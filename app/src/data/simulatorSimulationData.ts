import type { DocumentSnapshot } from 'firebase/firestore';
import { fotmobPlayerImageUrl } from '../constants/fotmob';
import { SIMULATOR_MATCHDAY_ID } from '../constants/simulator';
import {
  computeMatchdayPairings,
  playersFromRankingEntries,
} from '../services/simulatorMatchmaking';
import type {
  RankingFilter,
  SimulatorCurrentMatch,
  SimulatorDuelOutcome,
  SimulatorHistoryEntry,
  SimulatorLiveEvent,
  SimulatorRankingEntry,
  SimulatorScoreState,
} from '../types/arena.types';
import { countryMeta } from '../services/gamesService';
import { duelOutcome } from '../utils/simulatorHistory';

const SIM_USERS: Omit<SimulatorRankingEntry, 'rank'>[] = [
  {
    userId: 'sim-carlos',
    displayName: 'Carlos',
    country: 'BR',
    flag: countryMeta('BR').flag,
    profilePhotoUrl: null,
    totalPoints: 936,
    weeklyPoints: 142,
    captainId: '292462',
    captainFlag: countryMeta('BR').flag,
    wins: 12,
  },
  {
    userId: 'sim-harold',
    displayName: 'Harold',
    country: 'FR',
    flag: countryMeta('FR').flag,
    profilePhotoUrl: null,
    rankDelta: 'up',
    totalPoints: 847,
    weeklyPoints: 128,
    captainId: '701154',
    captainFlag: countryMeta('FR').flag,
    wins: 9,
  },
  {
    userId: 'sim-maria',
    displayName: 'Maria',
    country: 'ES',
    flag: countryMeta('ES').flag,
    profilePhotoUrl: null,
    rankDelta: 'down',
    totalPoints: 812,
    weeklyPoints: 119,
    captainId: '155997',
    captainFlag: countryMeta('ES').flag,
    wins: 8,
  },
  {
    userId: 'sim-yuki',
    displayName: 'Yuki',
    country: 'JP',
    flag: countryMeta('JP').flag,
    profilePhotoUrl: null,
    rankDelta: 'stable',
    totalPoints: 798,
    weeklyPoints: 115,
    captainId: '914458',
    captainFlag: countryMeta('JP').flag,
    wins: 7,
  },
  {
    userId: 'sim-alex',
    displayName: 'Alex',
    country: 'US',
    flag: countryMeta('US').flag,
    profilePhotoUrl: null,
    rankDelta: 'up',
    totalPoints: 765,
    weeklyPoints: 108,
    captainId: '466439',
    captainFlag: countryMeta('US').flag,
    wins: 6,
  },
  {
    userId: 'sim-sophie',
    displayName: 'Sophie',
    country: 'FR',
    flag: countryMeta('FR').flag,
    profilePhotoUrl: null,
    rankDelta: 'stable',
    totalPoints: 741,
    weeklyPoints: 102,
    captainId: '8198',
    captainFlag: countryMeta('FR').flag,
    wins: 5,
  },
  {
    userId: 'sim-diego',
    displayName: 'Diego',
    country: 'AR',
    flag: countryMeta('AR').flag,
    profilePhotoUrl: null,
    rankDelta: 'down',
    totalPoints: 720,
    weeklyPoints: 98,
    captainId: '292462',
    captainFlag: countryMeta('AR').flag,
    wins: 5,
  },
  {
    userId: 'sim-luca',
    displayName: 'Luca',
    country: 'IT',
    flag: countryMeta('IT').flag,
    profilePhotoUrl: null,
    rankDelta: 'stable',
    totalPoints: 698,
    weeklyPoints: 94,
    captainId: '155997',
    captainFlag: countryMeta('IT').flag,
    wins: 4,
  },
];

function sortByFilter(list: SimulatorRankingEntry[], filter: RankingFilter): SimulatorRankingEntry[] {
  const key = filter === 'week' ? 'weeklyPoints' : 'totalPoints';
  return [...list].sort((a, b) => b[key] - a[key]).map((e, i) => ({ ...e, rank: i + 1 }));
}

function buildFullList(userId: string, userName: string, country: string): SimulatorRankingEntry[] {
  const code = country.toUpperCase();
  const meta = countryMeta(code);
  const hasUser = SIM_USERS.some((u) => u.userId === userId);
  const base = SIM_USERS.map((u, i) => ({ ...u, rank: i + 1 }));
  if (hasUser) {
    return base.map((u) =>
      u.userId === userId ? { ...u, displayName: userName || u.displayName } : u
    );
  }
  const me: SimulatorRankingEntry = {
    userId,
    displayName: userName || 'Toi',
    country: code,
    flag: meta.flag,
    profilePhotoUrl: null,
    totalPoints: 847,
    weeklyPoints: 128,
    captainId: '701154',
    captainFlag: meta.flag,
    wins: 9,
    rank: 2,
  };
  const merged = [...base];
  const haroldIdx = merged.findIndex((u) => u.userId === 'sim-harold');
  if (haroldIdx >= 0 && userId !== 'sim-harold') {
    merged[haroldIdx] = me;
  } else if (haroldIdx < 0) {
    merged.splice(1, 0, me);
  }
  return merged.map((u, i) => ({ ...u, rank: i + 1 }));
}

export function getSimRankingList(
  filter: RankingFilter,
  userId: string,
  userName: string,
  country: string
): SimulatorRankingEntry[] {
  let list = buildFullList(userId, userName, country);
  if (filter === 'nation') {
    list = list.filter((e) => e.country === country.toUpperCase());
  }
  if (filter === 'friends') {
    return [];
  }
  return sortByFilter(list, filter);
}

export function getSimRankingPage(
  filter: RankingFilter,
  userId: string,
  userName: string,
  country: string,
  lastDoc: DocumentSnapshot | null,
  pageSize: number
): { entries: SimulatorRankingEntry[]; lastDoc: DocumentSnapshot | null; hasMore: boolean } {
  const list = getSimRankingList(filter, userId, userName, country);
  const offset = lastDoc ? Number(lastDoc.id) || 0 : 0;
  const slice = list.slice(offset, offset + pageSize);
  const nextOffset = offset + slice.length;
  const fakeLast =
    slice.length > 0 && nextOffset < list.length
      ? ({ id: String(nextOffset) } as DocumentSnapshot)
      : null;
  return {
    entries: slice,
    lastDoc: fakeLast,
    hasMore: nextOffset < list.length,
  };
}

export function getSimUserRanking(userId: string): SimulatorRankingEntry | null {
  if (!userId) return null;
  const list = getSimRankingList('mondial', userId, '', 'FR');
  return list.find((e) => e.userId === userId) ?? null;
}

export function getSimScore(userId: string): SimulatorScoreState {
  const list = getSimRankingList('mondial', userId, '', 'FR');
  const me = list.find((e) => e.userId === userId) ?? list[1];
  const leader = list[0];
  if (!me || !leader) {
    return {
      totalPoints: 0,
      worldRank: 0,
      dayGain: 0,
      leaderPoints: 0,
      leaderName: '—',
      gapToLeader: 0,
    };
  }
  return {
    totalPoints: me.totalPoints,
    worldRank: me.rank,
    dayGain: 127,
    leaderPoints: leader.totalPoints,
    leaderName: leader.displayName,
    gapToLeader: Math.max(leader.totalPoints - me.totalPoints + 1, 1),
  };
}

export function getSimMatch(userId: string, userName = '', country = 'FR'): SimulatorCurrentMatch {
  const list = getSimRankingList('mondial', userId, userName, country);
  const players = playersFromRankingEntries(list);
  const pairing = computeMatchdayPairings(players, SIMULATOR_MATCHDAY_ID, {
    matchdayLabel: 'Coupe du Monde · Duel du jour',
  });
  const duel = pairing.byUserId.get(userId);

  if (!duel) {
    const fallback = list.find((e) => e.userId === 'sim-carlos') ?? list[0];
    return {
      opponentUserId: fallback?.userId ?? 'sim-carlos',
      opponentName: fallback?.displayName ?? 'Carlos',
      opponentCountry: fallback?.country ?? 'BR',
      opponentProfilePhotoUrl: fallback?.profilePhotoUrl ?? null,
      userScore: 47,
      opponentScore: 31,
      isLive: true,
      matchdayLabel: pairing.matchdayLabel,
    };
  }

  const me = list.find((e) => e.userId === userId);
  const oppPts = list.find((e) => e.userId === duel.opponentUserId)?.totalPoints ?? 0;
  const myPts = me?.totalPoints ?? 847;

  return {
    opponentUserId: duel.opponentUserId,
    opponentName: duel.opponentName,
    opponentCountry: duel.opponentCountry,
    opponentProfilePhotoUrl: duel.opponentProfilePhotoUrl,
    userScore: duel.userDayScore || Math.min(99, Math.round(myPts * 0.05)),
    opponentScore: duel.opponentDayScore || Math.min(99, Math.round(oppPts * 0.05)),
    isLive: true,
    matchdayLabel: duel.matchdayLabel,
  };
}

const HISTORY_MATCHDAYS = [
  { id: 'md_01', label: 'Groupe A · Journée 1' },
  { id: 'md_02', label: 'Groupe A · Journée 2' },
  { id: 'md_03', label: 'Groupe A · Journée 3' },
  { id: 'md_04', label: 'Groupe B · Journée 1' },
  { id: 'md_05', label: 'Groupe B · Journée 2' },
  { id: 'md_06', label: 'Groupe B · Journée 3' },
  { id: 'md_07', label: 'Huitièmes · J1' },
  { id: 'md_08', label: 'Huitièmes · J2' },
  { id: 'md_09', label: 'Quarts · J1' },
  { id: 'md_10', label: 'Quarts · J2' },
  { id: 'md_11', label: 'Demi · J1' },
] as const;

function hashPick<T>(seed: string, index: number, list: T[]): T {
  let h = 0;
  const s = `${seed}:${index}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

function buildPastDuel(
  userId: string,
  idx: number,
  matchday: (typeof HISTORY_MATCHDAYS)[number],
  opponent: SimulatorRankingEntry,
  forcedOutcome: SimulatorDuelOutcome,
  rankAfter: number,
  rankDelta: 'up' | 'down' | 'stable',
  playedAt: number
): SimulatorHistoryEntry {
  const base = 28 + (Math.abs(hashPick(userId, idx, [1, 2, 3, 4, 5])) % 22);
  let userScore = base;
  let opponentScore = base - 4;
  if (forcedOutcome === 'win') {
    userScore = base + 6;
    opponentScore = base - 8;
  } else if (forcedOutcome === 'loss') {
    userScore = base - 10;
    opponentScore = base + 4;
  } else {
    userScore = base;
    opponentScore = base;
  }

  const delta =
    forcedOutcome === 'win' ? 72 + (idx % 5) * 8 : forcedOutcome === 'loss' ? -(48 + (idx % 4) * 6) : 18;

  return {
    id: `${matchday.id}_${userId}`,
    matchdayId: matchday.id,
    matchdayLabel: matchday.label,
    playedAt,
    opponentUserId: opponent.userId,
    opponentName: opponent.displayName,
    opponentCountry: opponent.country,
    userScore,
    opponentScore,
    outcome: duelOutcome(userScore, opponentScore),
    fantasyPointsDelta: delta,
    rankAfter,
    rankDelta,
  };
}

export function getSimMatchHistory(
  userId: string,
  userName: string,
  country: string,
  currentMatch: SimulatorCurrentMatch | null
): SimulatorHistoryEntry[] {
  const list = getSimRankingList('mondial', userId, userName, country);
  const me = list.find((e) => e.userId === userId) ?? list[1];
  const opponents = list.filter((e) => e.userId !== userId);
  if (!me || opponents.length === 0) return [];

  const winsTarget = Math.max(me.wins, 6);
  const lossCount = Math.max(2, Math.floor(winsTarget * 0.28));
  const drawCount = 1;
  const pastCount = Math.min(HISTORY_MATCHDAYS.length, winsTarget + lossCount + drawCount);

  const outcomes: SimulatorDuelOutcome[] = [
    ...Array(winsTarget).fill('win' as const),
    ...Array(lossCount).fill('loss' as const),
    ...Array(drawCount).fill('draw' as const),
  ].slice(0, pastCount);

  while (outcomes.length < pastCount) outcomes.push('win');
  outcomes.length = pastCount;

  const now = Date.now();
  const dayMs = 86_400_000;
  let rank = Math.min(me.rank + 4, 12);

  const past: SimulatorHistoryEntry[] = [];
  for (let i = 0; i < pastCount; i++) {
    const md = HISTORY_MATCHDAYS[i];
    const opp = hashPick(userId, i, opponents);
    const outcome = outcomes[i];
    const rankDelta: 'up' | 'down' | 'stable' =
      outcome === 'win' ? 'up' : outcome === 'loss' ? 'down' : 'stable';
    if (outcome === 'win' && rank > 1) rank -= 1;
    if (outcome === 'loss') rank = Math.min(rank + 1, 15);

    past.push(
      buildPastDuel(
        userId,
        i,
        md,
        opp,
        outcome,
        rank,
        rankDelta,
        now - (pastCount - i) * dayMs
      )
    );
  }

  past.sort((a, b) => b.playedAt - a.playedAt);

  if (currentMatch) {
    const live: SimulatorHistoryEntry = {
      id: `live_${SIMULATOR_MATCHDAY_ID}`,
      matchdayId: SIMULATOR_MATCHDAY_ID,
      matchdayLabel: currentMatch.matchdayLabel || 'Duel du jour',
      playedAt: now,
      opponentUserId: currentMatch.opponentUserId,
      opponentName: currentMatch.opponentName,
      opponentCountry: currentMatch.opponentCountry,
      userScore: currentMatch.userScore,
      opponentScore: currentMatch.opponentScore,
      outcome: duelOutcome(currentMatch.userScore, currentMatch.opponentScore),
      fantasyPointsDelta: 0,
      rankAfter: me.rank,
      rankDelta: 'stable',
      isLive: currentMatch.isLive,
    };
    return [live, ...past];
  }

  return past;
}

export function getSimEvents(): SimulatorLiveEvent[] {
  return [
    {
      id: 'e1',
      minute: 47,
      playerId: '466439',
      playerName: 'Maignan',
      photo: fotmobPlayerImageUrl(466439),
      type: 'clean_sheet',
      points: 8,
      isUserTeam: true,
    },
    {
      id: 'e2',
      minute: 61,
      playerId: '292462',
      playerName: 'Vinícius Júnior',
      photo: fotmobPlayerImageUrl(292462),
      type: 'goal',
      points: 10,
      isUserTeam: false,
    },
    {
      id: 'e4',
      minute: 75,
      playerId: '701154',
      playerName: 'Kylian Mbappé',
      photo: fotmobPlayerImageUrl(701154),
      type: 'captain_goal',
      points: 20,
      isCaptain: true,
      isUserTeam: true,
    },
  ];
}

export function getSimRankingPreview(
  userId: string,
  userName: string,
  country: string,
  previewCount = 6
): { preview: SimulatorRankingEntry[]; totalCount: number; myRanking: SimulatorRankingEntry | null } {
  const list = getSimRankingList('mondial', userId, userName, country);
  const myRanking = list.find((e) => e.userId === userId) ?? list[1] ?? null;
  return {
    preview: list.slice(0, previewCount),
    totalCount: 1247,
    myRanking,
  };
}

export function captainPhotoFromId(captainId: string): string {
  const id = Number(captainId);
  if (Number.isFinite(id) && id > 0) return fotmobPlayerImageUrl(id);
  return fotmobPlayerImageUrl(701154);
}
