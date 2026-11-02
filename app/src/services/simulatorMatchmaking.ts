import { SIMULATOR_MATCHDAY_ID } from '../constants/simulator';
import type {
  DailyDuelAssignment,
  DailyDuelPair,
  MatchdayPairingResult,
  MatchmakingOptions,
  MatchmakingPlayer,
} from '../types/simulatorMatchmaking.types';

const DEFAULT_RECENT_WINDOW = 5;
const DEFAULT_MAX_RANK_DISTANCE = 30;
/** Hash déterministe 32 bits pour départager les candidats */
function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function wasRecentOpponent(
  player: MatchmakingPlayer,
  opponentId: string,
  window: number
): boolean {
  const recent = player.recentOpponentIds ?? [];
  return recent.slice(0, window).includes(opponentId);
}

/** Ordre de candidats : celui à dépasser d’abord, puis voisins de rang */
function candidateRanks(myRank: number, poolSize: number): number[] {
  const ranks: number[] = [];
  if (poolSize <= 1) return ranks;

  if (myRank <= 1) {
    for (let r = 2; r <= poolSize; r += 1) ranks.push(r);
    return ranks;
  }
  if (myRank >= poolSize) {
    for (let r = poolSize - 1; r >= 1; r -= 1) ranks.push(r);
    return ranks;
  }

  ranks.push(myRank - 1);
  ranks.push(myRank + 1);
  for (let d = 2; d < poolSize; d += 1) {
    if (myRank - d >= 1) ranks.push(myRank - d);
    if (myRank + d <= poolSize) ranks.push(myRank + d);
  }
  return ranks;
}

function pairingReasonFor(
  myRank: number,
  opponentRank: number
): DailyDuelAssignment['pairingReason'] {
  if (opponentRank === myRank - 1) return 'chase_above';
  if (opponentRank === myRank + 1) return 'chase_below';
  return 'swiss_tier';
}

function scoreCandidate(
  player: MatchmakingPlayer,
  candidate: MatchmakingPlayer,
  myRank: number,
  matchdayId: string,
  options: Required<Pick<MatchmakingOptions, 'recentOpponentWindow' | 'maxRankDistance' | 'preferSameNation'>>
): number {
  const rankGap = Math.abs(candidate.rank - myRank);
  if (rankGap > options.maxRankDistance) return Infinity;

  let score = rankGap * 100;

  if (wasRecentOpponent(player, candidate.userId, options.recentOpponentWindow)) {
    score += 10_000;
  }
  if (wasRecentOpponent(candidate, player.userId, options.recentOpponentWindow)) {
    score += 2_000;
  }

  if (candidate.rank === myRank - 1) score -= 80;
  if (candidate.rank === myRank + 1 && myRank <= 3) score -= 40;
  if (myRank === 1 && candidate.rank === 2) score -= 120;

  if (options.preferSameNation && player.country === candidate.country) {
    score -= 15;
  }

  const tie = hash32(`${matchdayId}:${player.userId}:${candidate.userId}`) % 1000;
  return score + tie * 0.001;
}

function buildAssignment(
  player: MatchmakingPlayer,
  opponent: MatchmakingPlayer,
  matchdayId: string,
  matchdayLabel: string,
  reason: DailyDuelAssignment['pairingReason'],
  dayScores?: { user: number; opponent: number }
): DailyDuelAssignment {
  return {
    userId: player.userId,
    opponentUserId: opponent.userId,
    opponentName: opponent.displayName,
    opponentCountry: opponent.country,
    opponentProfilePhotoUrl: opponent.profilePhotoUrl,
    userDayScore: dayScores?.user ?? 0,
    opponentDayScore: dayScores?.opponent ?? 0,
    matchdayId,
    matchdayLabel,
    pairingReason: reason,
  };
}

/**
 * Algorithme principal — pairing quotidien 1v1 pour tout le classement.
 *
 * Principes :
 * 1. Duel narratif = adversaire proche au classement (souvent rank-1 à dépasser).
 * 2. Appariement mutuel symétrique (A↔B).
 * 3. Anti-rematch sur les N dernières journées.
 * 4. Rotation suisse dans les grands pools pour variété.
 * 5. Déterministe pour une journée donnée (reproductible côté backend).
 */
export function computeMatchdayPairings(
  players: MatchmakingPlayer[],
  matchdayId: string = SIMULATOR_MATCHDAY_ID,
  options: MatchmakingOptions = {}
): MatchdayPairingResult {
  const recentWindow = options.recentOpponentWindow ?? DEFAULT_RECENT_WINDOW;
  const maxRankDistance = options.maxRankDistance ?? DEFAULT_MAX_RANK_DISTANCE;
  const preferSameNation = options.preferSameNation ?? false;
  const matchdayLabel = options.matchdayLabel ?? `Journée · ${matchdayId}`;

  const eligible = players
    .filter((p) => p.userId && (p.teamComplete !== false))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.userId.localeCompare(b.userId))
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const byId = new Map(eligible.map((p) => [p.userId, p]));
  const poolSize = eligible.length;
  const unpaired = new Set(eligible.map((p) => p.userId));
  const pairs: DailyDuelPair[] = [];
  const assignments: DailyDuelAssignment[] = [];
  const byUserId = new Map<string, DailyDuelAssignment>();
  let rematchAvoided = 0;
  let totalGap = 0;

  if (poolSize === 0) {
    return {
      matchdayId,
      matchdayLabel,
      assignments: [],
      byUserId,
      pairs: [],
      unpairedUserIds: [],
      stats: { eligibleCount: 0, pairedCount: 0, averageRankGap: 0, rematchAvoided: 0 },
    };
  }

  if (poolSize === 1) {
    return {
      matchdayId,
      matchdayLabel,
      assignments: [],
      byUserId,
      pairs: [],
      unpairedUserIds: [eligible[0].userId],
      stats: { eligibleCount: 1, pairedCount: 0, averageRankGap: 0, rematchAvoided: 0 },
    };
  }

  const sortedByRank = [...eligible];

  for (const player of sortedByRank) {
    if (!unpaired.has(player.userId)) continue;

    const myRank = player.rank;
    const rankCandidates = candidateRanks(myRank, poolSize);

    type Scored = { player: MatchmakingPlayer; score: number; reason: DailyDuelAssignment['pairingReason'] };
    const scored: Scored[] = [];

    for (const targetRank of rankCandidates) {
      const cand = sortedByRank[targetRank - 1];
      if (!cand || cand.userId === player.userId) continue;
      if (!unpaired.has(cand.userId)) continue;

      const rankGap = Math.abs(cand.rank - myRank);
      const s = scoreCandidate(player, cand, myRank, matchdayId, {
        recentOpponentWindow: recentWindow,
        maxRankDistance,
        preferSameNation,
      });
      if (!Number.isFinite(s)) continue;

      if (wasRecentOpponent(player, cand.userId, recentWindow) && rankGap <= maxRankDistance) {
        rematchAvoided += 1;
      }

      scored.push({
        player: cand,
        score: s,
        reason: pairingReasonFor(myRank, cand.rank),
      });
    }

    scored.sort((a, b) => a.score - b.score);

    let chosen: Scored | null = scored[0] ?? null;

    if (!chosen) {
      for (const other of sortedByRank) {
        if (other.userId === player.userId || !unpaired.has(other.userId)) continue;
        chosen = {
          player: other,
          score: Infinity,
          reason: 'rematch_fallback',
        };
        break;
      }
    }

    if (!chosen) continue;

    const opp = chosen.player;
    const reason = chosen.reason;

    const pair: DailyDuelPair = {
      userAId: player.userId,
      userBId: opp.userId,
      scoreA: 0,
      scoreB: 0,
    };
    pairs.push(pair);

    const assignA = buildAssignment(player, opp, matchdayId, matchdayLabel, reason);
    const assignB = buildAssignment(opp, player, matchdayId, matchdayLabel, pairingReasonFor(opp.rank, myRank));

    assignments.push(assignA, assignB);
    byUserId.set(player.userId, assignA);
    byUserId.set(opp.userId, assignB);

    totalGap += Math.abs(myRank - opp.rank);
    unpaired.delete(player.userId);
    unpaired.delete(opp.userId);
  }

  const unpairedList = [...unpaired];
  while (unpairedList.length >= 2) {
    const aId = unpairedList.pop()!;
    const bId = unpairedList.pop()!;
    const a = byId.get(aId)!;
    const b = byId.get(bId)!;
    pairs.push({ userAId: aId, userBId: bId, scoreA: 0, scoreB: 0 });
    const assignA = buildAssignment(a, b, matchdayId, matchdayLabel, 'rematch_fallback');
    const assignB = buildAssignment(b, a, matchdayId, matchdayLabel, 'rematch_fallback');
    assignments.push(assignA, assignB);
    byUserId.set(aId, assignA);
    byUserId.set(bId, assignB);
    totalGap += Math.abs(a.rank - b.rank);
  }

  const pairedCount = byUserId.size;

  return {
    matchdayId,
    matchdayLabel,
    assignments,
    byUserId,
    pairs,
    unpairedUserIds: unpairedList,
    stats: {
      eligibleCount: poolSize,
      pairedCount,
      averageRankGap: pairedCount > 0 ? totalGap / (pairs.length || 1) : 0,
      rematchAvoided,
    },
  };
}

/** Duel d’un utilisateur (utilise le pairing global de la journée). */
export function getDailyDuelForUser(
  userId: string,
  players: MatchmakingPlayer[],
  matchdayId?: string,
  options?: MatchmakingOptions
): DailyDuelAssignment | null {
  const result = computeMatchdayPairings(players, matchdayId, options);
  return result.byUserId.get(userId) ?? null;
}

/** Convertit les entrées classement app en joueurs matchmaking. */
export function playersFromRankingEntries(
  entries: {
    userId: string;
    displayName: string;
    country: string;
    profilePhotoUrl: string | null;
    totalPoints: number;
    rank: number;
  }[],
  extras?: Partial<Pick<MatchmakingPlayer, 'recentOpponentIds' | 'teamComplete'>>
): MatchmakingPlayer[] {
  return entries.map((e) => ({
    userId: e.userId,
    displayName: e.displayName,
    country: e.country,
    profilePhotoUrl: e.profilePhotoUrl,
    totalPoints: e.totalPoints,
    rank: e.rank,
    recentOpponentIds: extras?.recentOpponentIds,
    teamComplete: extras?.teamComplete ?? true,
  }));
}

/** Payload RTDB pour le backend Node (écriture `currentMatch` par user). */
export function buildRtdbCurrentMatchPayload(
  assignment: DailyDuelAssignment,
  isLive = true
): Record<string, string | number | boolean> {
  return {
    opponentUserId: assignment.opponentUserId,
    opponentName: assignment.opponentName,
    opponentCountry: assignment.opponentCountry,
    userScore: assignment.userDayScore,
    opponentScore: assignment.opponentDayScore,
    isLive,
    matchdayLabel: assignment.matchdayLabel,
    pairingReason: assignment.pairingReason,
    matchdayId: assignment.matchdayId,
  };
}

/** Historique adversaires après une journée (à persister Firestore). */
export function appendRecentOpponent(
  recent: string[] | undefined,
  opponentId: string,
  maxLen = DEFAULT_RECENT_WINDOW
): string[] {
  const next = [opponentId, ...(recent ?? []).filter((id) => id !== opponentId)];
  return next.slice(0, maxLen);
}
