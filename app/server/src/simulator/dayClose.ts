import { FieldValue } from 'firebase-admin/firestore';
import { getDatabase, getFirestore } from '../firebaseAdmin.js';
import { SIMULATOR_MATCHDAY_ID, SIMULATOR_SEASON_ID, utcDayKey } from './constants.js';
import { clearMatchdayEvents, fetchAllRankingDocs, appendHistoryEntry, writeMeta } from './rankingStore.js';

type CurrentMatchRtdb = {
  opponentUserId?: string;
  opponentName?: string;
  opponentCountry?: string;
  userScore?: number;
  opponentScore?: number;
  isLive?: boolean;
  matchdayLabel?: string;
};

function duelOutcome(userScore: number, opponentScore: number): 'win' | 'loss' | 'draw' {
  if (userScore > opponentScore) return 'win';
  if (userScore < opponentScore) return 'loss';
  return 'draw';
}

export async function closeSimulatorDay(dayKey = utcDayKey()): Promise<{ closed: number }> {
  const db = getDatabase();
  const base = `simulator/${SIMULATOR_SEASON_ID}/rankings`;
  const snap = await db.ref(base).get();
  const raw = snap.val() as Record<string, Record<string, unknown>> | null;
  if (!raw) {
    await clearMatchdayEvents();
    await writeMeta(dayKey);
    return { closed: 0 };
  }

  const fs = getFirestore();
  const rankingsCol = fs.collection('simulator').doc(SIMULATOR_SEASON_ID).collection('rankings');
  let closed = 0;

  for (const [userId, node] of Object.entries(raw)) {
    const current = node.currentMatch as CurrentMatchRtdb | undefined;
    if (!current?.opponentUserId) continue;

    const userScore = current.userScore ?? 0;
    const opponentScore = current.opponentScore ?? 0;
    const outcome = duelOutcome(userScore, opponentScore);

    const historyId = `${dayKey}_${userId}`;
    await appendHistoryEntry(userId, historyId, {
      matchdayId: SIMULATOR_MATCHDAY_ID,
      matchdayLabel: current.matchdayLabel ?? `Journée ${dayKey}`,
      playedAt: Date.now(),
      opponentUserId: current.opponentUserId,
      opponentName: current.opponentName ?? 'Adversaire',
      opponentCountry: current.opponentCountry ?? 'FR',
      userScore,
      opponentScore,
      outcome,
      fantasyPointsDelta: userScore,
      rankAfter: (node.rank as number) ?? 0,
    });

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (outcome === 'win') updates.wins = FieldValue.increment(1);
    else if (outcome === 'loss') updates.losses = FieldValue.increment(1);
    else updates.draws = FieldValue.increment(1);

    await rankingsCol.doc(userId).update(updates);

    await db.ref(`${base}/${userId}/currentMatch`).update({ isLive: false });
    await db.ref(`${base}/${userId}`).update({ dayGain: 0 });
    closed += 1;
  }

  await clearMatchdayEvents();
  await writeMeta(dayKey);
  return { closed };
}
