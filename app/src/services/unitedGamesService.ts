/**
 * Jeux THE RED — pronostics United, Pick XI, notes, classements fans (H+F combinés).
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { UNITED_LOCK, UNITED_PRONO_POINTS } from '../constants/unitedGames';
import type {
  UnitedFanStanding,
  UnitedMatchOutcome,
  UnitedMatchPrediction,
  UnitedPickXiDoc,
  UnitedPlayerRating,
  UnitedQuizVote,
  UnitedTeamSegment,
} from '../types/unitedGames.types';
import { getFirestoreDb } from './firebase';

function db() {
  try {
    return getFirestoreDb();
  } catch {
    return null;
  }
}

export function lineupLockAt(kickoffMs: number): number {
  return kickoffMs - UNITED_LOCK.lineupMinutesBeforeKickoff * 60_000;
}

export function canEditLineup(kickoffMs: number, now = Date.now()): boolean {
  return now < lineupLockAt(kickoffMs);
}

export function canEditScoreMarkets(kickoffMs: number, now = Date.now()): boolean {
  return now < kickoffMs;
}

export function minutesUntilLineupLock(kickoffMs: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((lineupLockAt(kickoffMs) - now) / 60_000));
}

export function calculateUnitedPronoPoints(
  pred: UnitedMatchPrediction,
  outcome: UnitedMatchOutcome
): { total: number; breakdown: NonNullable<UnitedMatchPrediction['pointsBreakdown']> } {
  const breakdown: NonNullable<UnitedMatchPrediction['pointsBreakdown']> = {};

  if (
    pred.homeScore != null &&
    pred.awayScore != null &&
    pred.homeScore === outcome.homeScore &&
    pred.awayScore === outcome.awayScore
  ) {
    breakdown.result = UNITED_PRONO_POINTS.finalResult;
  }

  if (pred.firstScorerId && outcome.firstScorerId && pred.firstScorerId === outcome.firstScorerId) {
    breakdown.firstScorer = UNITED_PRONO_POINTS.firstScorer;
  }

  if (pred.potmId && outcome.potmId && pred.potmId === outcome.potmId) {
    breakdown.potm = UNITED_PRONO_POINTS.playerOfTheMatch;
  }

  if (pred.formation && outcome.formation && pred.formation === outcome.formation) {
    breakdown.formation = UNITED_PRONO_POINTS.lineupFormation;
  }

  if (pred.starters?.length && outcome.starterIds?.length) {
    const actual = new Set(outcome.starterIds.map(String));
    let hits = 0;
    for (const id of pred.starters) {
      if (actual.has(String(id))) hits += 1;
    }
    breakdown.starters = hits * UNITED_PRONO_POINTS.lineupStarterEach;
  }

  const total = Object.values(breakdown).reduce((a, b) => a + (b ?? 0), 0);
  return { total, breakdown };
}

/** Même schéma que les jeux CDM : `users/{uid}/games/united_pronos` (map matchId → doc). */
export async function saveUnitedPrediction(
  userId: string,
  pred: UnitedMatchPrediction
): Promise<void> {
  const firestore = db();
  if (!firestore) throw new Error('Firestore indisponible');
  const ref = doc(firestore, `users/${userId}/games/united_pronos`);
  await setDoc(
    ref,
    { [pred.matchId]: { ...pred, updatedAt: Date.now() } },
    { merge: true }
  );
}

export async function loadUnitedPredictions(
  userId: string
): Promise<Record<string, UnitedMatchPrediction>> {
  const firestore = db();
  if (!firestore) return {};
  const snap = await getDoc(doc(firestore, `users/${userId}/games/united_pronos`));
  if (!snap.exists()) return {};
  const data = snap.data() as Record<string, UnitedMatchPrediction>;
  const out: Record<string, UnitedMatchPrediction> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === 'object' && 'matchId' in v) out[k] = v;
  }
  return out;
}

export async function loadUnitedPrediction(
  userId: string,
  matchId: string
): Promise<UnitedMatchPrediction | null> {
  const all = await loadUnitedPredictions(userId);
  return all[matchId] ?? null;
}

export async function savePickXi(userId: string, docData: UnitedPickXiDoc): Promise<void> {
  const firestore = db();
  if (!firestore) throw new Error('Firestore indisponible');
  await setDoc(
    doc(firestore, `users/${userId}/games/united_pickxi`),
    { [docData.matchId]: { ...docData, updatedAt: Date.now() } },
    { merge: true }
  );
}

export async function loadPickXi(userId: string, matchId: string): Promise<UnitedPickXiDoc | null> {
  const firestore = db();
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, `users/${userId}/games/united_pickxi`));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, UnitedPickXiDoc>;
  return data[matchId] ?? null;
}

export async function savePlayerRatings(
  userId: string,
  matchId: string,
  ratings: UnitedPlayerRating[]
): Promise<void> {
  const firestore = db();
  if (!firestore) throw new Error('Firestore indisponible');
  await setDoc(
    doc(firestore, `users/${userId}/games/united_ratings`),
    { [matchId]: { matchId, ratings, updatedAt: Date.now() } },
    { merge: true }
  );
}

export async function loadPlayerRatings(
  userId: string,
  matchId: string
): Promise<UnitedPlayerRating[] | null> {
  const firestore = db();
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, `users/${userId}/games/united_ratings`));
  if (!snap.exists()) return null;
  const row = (snap.data() as Record<string, { ratings?: UnitedPlayerRating[] }>)[matchId];
  return row?.ratings ?? null;
}

export async function saveQuizVote(userId: string, vote: UnitedQuizVote): Promise<void> {
  const firestore = db();
  if (!firestore) throw new Error('Firestore indisponible');
  await setDoc(
    doc(firestore, `users/${userId}/games/united_quiz`),
    { [vote.pollId]: { ...vote, updatedAt: Date.now() } },
    { merge: true }
  );
}

export async function loadQuizVotes(userId: string): Promise<Record<string, UnitedQuizVote>> {
  const firestore = db();
  if (!firestore) return {};
  const snap = await getDoc(doc(firestore, `users/${userId}/games/united_quiz`));
  if (!snap.exists()) return {};
  return snap.data() as Record<string, UnitedQuizVote>;
}

export async function upsertFanStanding(
  userId: string,
  patch: Partial<UnitedFanStanding> & { displayName?: string }
): Promise<void> {
  const firestore = db();
  if (!firestore) return;
  const ref = doc(firestore, 'united_fan_standings', userId);
  const prev = await getDoc(ref);
  const base = (prev.exists() ? prev.data() : {}) as UnitedFanStanding;
  await setDoc(
    ref,
    {
      userId,
      displayName: patch.displayName ?? base.displayName ?? 'Fan',
      monthlyPoints: patch.monthlyPoints ?? base.monthlyPoints ?? 0,
      seasonPoints: patch.seasonPoints ?? base.seasonPoints ?? 0,
      menPoints: patch.menPoints ?? base.menPoints ?? 0,
      womenPoints: patch.womenPoints ?? base.womenPoints ?? 0,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export async function addFanPoints(
  userId: string,
  points: number,
  segment: UnitedTeamSegment,
  displayName?: string
): Promise<void> {
  if (points <= 0) return;
  const firestore = db();
  if (!firestore) return;
  const ref = doc(firestore, 'united_fan_standings', userId);
  const prev = await getDoc(ref);
  const base = (prev.exists() ? prev.data() : {}) as UnitedFanStanding;
  const men = (base.menPoints ?? 0) + (segment === 'men' ? points : 0);
  const women = (base.womenPoints ?? 0) + (segment === 'women' ? points : 0);
  await setDoc(
    ref,
    {
      userId,
      displayName: displayName ?? base.displayName ?? 'Fan',
      menPoints: men,
      womenPoints: women,
      monthlyPoints: (base.monthlyPoints ?? 0) + points,
      seasonPoints: (base.seasonPoints ?? 0) + points,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export async function fetchFanStandings(
  period: 'monthly' | 'season' = 'monthly',
  max = 50
): Promise<UnitedFanStanding[]> {
  const firestore = db();
  if (!firestore) return [];
  const field = period === 'monthly' ? 'monthlyPoints' : 'seasonPoints';
  try {
    const q = query(
      collection(firestore, 'united_fan_standings'),
      orderBy(field, 'desc'),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UnitedFanStanding);
  } catch {
    return [];
  }
}
