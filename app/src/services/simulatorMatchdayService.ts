import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { ref, update } from 'firebase/database';
import {
  MATCHMAKING_MAX_RANK_DISTANCE,
  MATCHMAKING_RECENT_OPPONENTS,
  SIMULATOR_SEASON_ID,
} from '../constants/simulator';
import { getFirebaseRtdb, getFirestoreDb } from './firebase';
import {
  appendRecentOpponent,
  buildRtdbCurrentMatchPayload,
  computeMatchdayPairings,
  playersFromRankingEntries,
} from './simulatorMatchmaking';
import type { MatchdayPairingResult } from '../types/simulatorMatchmaking.types';

type RankingFirestoreDoc = {
  userId?: string;
  displayName?: string;
  name?: string;
  country?: string;
  profilePhotoUrl?: string;
  totalPoints?: number;
  rank?: number;
  recentOpponentIds?: string[];
  teamComplete?: boolean;
};

function firestoreSafe() {
  try {
    return getFirestoreDb();
  } catch {
    return null;
  }
}

function rtdbSafe() {
  try {
    return getFirebaseRtdb();
  } catch {
    return null;
  }
}

export async function fetchEligibleMatchmakingPlayers(): Promise<
  ReturnType<typeof playersFromRankingEntries>
> {
  const fs = firestoreSafe();
  if (!fs) return [];

  const snap = await getDocs(collection(fs, 'simulator', SIMULATOR_SEASON_ID, 'rankings'));
  const sorted = snap.docs
    .map((d) => {
      const data = d.data() as RankingFirestoreDoc;
      return {
        userId: data.userId ?? d.id,
        displayName: data.displayName ?? data.name ?? 'Joueur',
        country: data.country ?? 'FR',
        profilePhotoUrl: data.profilePhotoUrl ?? null,
        totalPoints: data.totalPoints ?? 0,
        rank: data.rank ?? 0,
        recentOpponentIds: data.recentOpponentIds,
        teamComplete: data.teamComplete ?? true,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return playersFromRankingEntries(sorted);
}

/**
 * Job quotidien (Node.js / Cloud Function) — assigne tous les duels du jour.
 */
export async function runDailySimulatorMatchmaking(
  matchdayId: string,
  matchdayLabel: string
): Promise<MatchdayPairingResult> {
  const fs = firestoreSafe();
  const snap = fs
    ? await getDocs(collection(fs, 'simulator', SIMULATOR_SEASON_ID, 'rankings'))
    : null;
  const recentByUser = new Map<string, string[]>();
  if (snap) {
    for (const d of snap.docs) {
      const data = d.data() as RankingFirestoreDoc;
      recentByUser.set(d.id, data.recentOpponentIds ?? []);
    }
  }

  const players = await fetchEligibleMatchmakingPlayers();
  const withHistory = players.map((p) => ({
    ...p,
    recentOpponentIds: recentByUser.get(p.userId) ?? p.recentOpponentIds,
  }));

  const result = computeMatchdayPairings(withHistory, matchdayId, {
    matchdayLabel,
    recentOpponentWindow: MATCHMAKING_RECENT_OPPONENTS,
    maxRankDistance: MATCHMAKING_MAX_RANK_DISTANCE,
  });

  if (fs) {
    const batch = writeBatch(fs);
    for (const assignment of result.assignments) {
      const playerRef = doc(fs, 'simulator', SIMULATOR_SEASON_ID, 'rankings', assignment.userId);
      const recent = appendRecentOpponent(
        recentByUser.get(assignment.userId),
        assignment.opponentUserId,
        MATCHMAKING_RECENT_OPPONENTS
      );
      batch.update(playerRef, {
        recentOpponentIds: recent,
        lastMatchdayId: matchdayId,
      });
    }
    await batch.commit();
  }

  const db = rtdbSafe();
  if (db) {
    await Promise.all(
      result.assignments.map((assignment) =>
        update(
          ref(db, `simulator/${SIMULATOR_SEASON_ID}/rankings/${assignment.userId}/currentMatch`),
          buildRtdbCurrentMatchPayload(assignment, true)
        )
      )
    );
  }

  return result;
}

export async function patchDailyDuelScores(
  userId: string,
  userDayScore: number,
  opponentDayScore: number
): Promise<void> {
  const db = rtdbSafe();
  if (!db) return;
  await update(ref(db, `simulator/${SIMULATOR_SEASON_ID}/rankings/${userId}/currentMatch`), {
    userScore: userDayScore,
    opponentScore: opponentDayScore,
  });
}
