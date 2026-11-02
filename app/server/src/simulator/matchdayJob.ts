import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '../firebaseAdmin.js';
import {
  MATCHMAKING_MAX_RANK_DISTANCE,
  MATCHMAKING_RECENT_OPPONENTS,
  SIMULATOR_MATCHDAY_ID,
  SIMULATOR_SEASON_ID,
  utcDayKey,
} from './constants.js';
import { closeSimulatorDay } from './dayClose.js';
import { buildFantasyIndex } from './fantasyIndex.js';
import {
  appendRecentOpponent,
  buildRtdbCurrentMatchPayload,
  computeMatchdayPairings,
} from './matchmaking.js';
import type { MatchmakingPlayer } from './matchmakingTypes.js';
import {
  fetchAllRankingDocs,
  readMeta,
  refreshGlobalRanks,
  writeCurrentMatch,
  writeMeta,
} from './rankingStore.js';

export async function runDailySimulatorMatchmaking(
  matchdayLabel?: string
): Promise<{ paired: number; dayKey: string }> {
  const dayKey = utcDayKey();
  const meta = await readMeta();
  if (meta?.dayKey && meta.dayKey !== dayKey) {
    await closeSimulatorDay(meta.dayKey);
  } else if (!meta?.dayKey) {
    await closeSimulatorDay(dayKey);
  }

  const label = matchdayLabel ?? `Coupe du Monde · ${dayKey}`;
  const fantasy = await buildFantasyIndex();
  const rankingDocs = await fetchAllRankingDocs();
  const fs = getFirestore();

  const byUser = new Map(rankingDocs.map((r) => [r.userId, r]));
  for (const roster of fantasy.rosters) {
    if (!byUser.has(roster.userId)) {
      await fs
        .collection('simulator')
        .doc(SIMULATOR_SEASON_ID)
        .collection('rankings')
        .doc(roster.userId)
        .set(
          {
            userId: roster.userId,
            displayName: 'Joueur',
            country: roster.country,
            profilePhotoUrl: null,
            totalPoints: 0,
            weeklyPoints: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            rank: 0,
            captainId: roster.captainPlayerId ?? '',
            captainCountry: roster.country,
            teamComplete: true,
            recentOpponentIds: [],
            updatedAt: Date.now(),
          },
          { merge: true }
        );
    } else {
      await fs
        .collection('simulator')
        .doc(SIMULATOR_SEASON_ID)
        .collection('rankings')
        .doc(roster.userId)
        .update({ teamComplete: true, updatedAt: Date.now() });
    }
  }

  const refreshed = await fetchAllRankingDocs();
  const players: MatchmakingPlayer[] = refreshed
    .filter((r) => fantasy.rosters.some((x) => x.userId === r.userId))
    .map((r, _i, arr) => ({
      userId: r.userId,
      displayName: r.displayName,
      country: r.country,
      profilePhotoUrl: r.profilePhotoUrl,
      totalPoints: r.totalPoints,
      rank: r.rank,
      recentOpponentIds: r.recentOpponentIds,
      teamComplete: true,
    }));

  const result = computeMatchdayPairings(players, SIMULATOR_MATCHDAY_ID, {
    matchdayLabel: label,
    recentOpponentWindow: MATCHMAKING_RECENT_OPPONENTS,
    maxRankDistance: MATCHMAKING_MAX_RANK_DISTANCE,
  });

  const batch = fs.batch();
  for (const assignment of result.assignments) {
    const ref = fs.collection('simulator').doc(SIMULATOR_SEASON_ID).collection('rankings').doc(assignment.userId);
    const recent = appendRecentOpponent(
      refreshed.find((x) => x.userId === assignment.userId)?.recentOpponentIds,
      assignment.opponentUserId,
      MATCHMAKING_RECENT_OPPONENTS
    );
    batch.update(ref, {
      recentOpponentIds: recent,
      lastMatchdayId: SIMULATOR_MATCHDAY_ID,
      updatedAt: Date.now(),
    });
    await writeCurrentMatch(assignment.userId, buildRtdbCurrentMatchPayload(assignment, true));
  }
  await batch.commit();
  await refreshGlobalRanks();

  await writeMeta(dayKey);

  return { paired: result.stats.pairedCount, dayKey };
}
