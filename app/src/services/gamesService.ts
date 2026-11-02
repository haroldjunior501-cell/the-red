import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction as runFirestoreTransaction,
  setDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { off, onValue, ref, runTransaction as runRtdbTransaction, type DatabaseReference } from 'firebase/database';
import { COUNTRIES } from '../constants/countries';
import { getFirebaseRtdb, getFirestoreDb } from './firebase';
import type {
  BracketPrediction,
  Duel,
  DuelPlayer,
  FantasyTeam,
  MatchResult,
  NationPower,
  PointsSource,
  Prono,
  TableauDoc,
} from '../types/games.types';

export const POINTS: Record<PointsSource, number> = {
  prono_exact_score: 120,
  prono_winner: 40,
  prono_scorer: 25,
  prono_goal_diff: 15,
  tableau_group: 100,
  tableau_r16: 10,
  tableau_quarter: 20,
  tableau_semi: 40,
  tableau_final: 80,
  tableau_champion: 160,
  duel_win: 150,
  duel_perfect: 300,
  fantasy_goal: 10,
  fantasy_assist: 6,
  fantasy_clean_sheet: 8,
  fantasy_motm: 15,
  hub_reaction: 0.2,
  hub_message: 0.5,
  hub_mission: 500,
};

const HUB_COOLDOWN_MS = {
  hub_reaction: 30_000,
  hub_message: 60_000,
} as const;

const hubLastAction = new Map<string, number>();

function rtdbSafe() {
  try {
    return getFirebaseRtdb();
  } catch {
    return null;
  }
}

function firestoreSafe() {
  try {
    return getFirestoreDb();
  } catch {
    return null;
  }
}

export function normalizeCountryCode(code: string): string {
  return (code || 'FR').trim().toUpperCase();
}

export function countryMeta(code: string): { name: string; flag: string } {
  const c = normalizeCountryCode(code);
  const row = COUNTRIES.find((x) => x.code.toUpperCase() === c || x.code.replace('-', '').toUpperCase() === c);
  return { name: row?.name ?? c, flag: row?.flag ?? '🏳️' };
}

export function formatPower(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

type NationRtdbRow = {
  power?: number;
  strength?: number;
  supporterCount?: number;
  dailyGain?: number;
  weeklyGain?: number;
};

export function parseNationPower(val: NationRtdbRow | null): NationPower {
  if (!val) {
    return { power: 0, supporterCount: 0, dailyGain: 0, weeklyGain: 0 };
  }
  const power = typeof val.power === 'number' ? val.power : typeof val.strength === 'number' ? val.strength : 0;
  return {
    power,
    supporterCount: typeof val.supporterCount === 'number' ? val.supporterCount : 0,
    dailyGain: typeof val.dailyGain === 'number' ? val.dailyGain : 0,
    weeklyGain: typeof val.weeklyGain === 'number' ? val.weeklyGain : 0,
  };
}

export function subscribeNationPower(
  countryCode: string,
  cb: (power: NationPower | null) => void
): () => void {
  const db = rtdbSafe();
  const code = normalizeCountryCode(countryCode);
  if (!db) {
    cb(null);
    return () => undefined;
  }
  const nationRef = ref(db, `nations/${code}`);
  const handler = onValue(nationRef, (snap) => {
    cb(parseNationPower(snap.val() as NationRtdbRow | null));
  });
  return () => off(nationRef, 'value', handler);
}

export function subscribeAllNations(
  cb: (rows: Record<string, NationPower>) => void
): () => void {
  const db = rtdbSafe();
  if (!db) {
    cb({});
    return () => undefined;
  }
  const rootRef = ref(db, 'nations');
  const handler = onValue(rootRef, (snap) => {
    const raw = snap.val() as Record<string, NationRtdbRow> | null;
    if (!raw) {
      cb({});
      return;
    }
    const out: Record<string, NationPower> = {};
    Object.entries(raw).forEach(([code, row]) => {
      out[code] = parseNationPower(row);
    });
    cb(out);
  });
  return () => off(rootRef, 'value', handler);
}

async function txIncrement(target: DatabaseReference, delta: number): Promise<void> {
  await runRtdbTransaction(target, (current) => {
    const base = typeof current === 'number' ? current : 0;
    return base + delta;
  });
}

export async function addNationalPoints(
  userId: string,
  countryCode: string,
  points: number,
  source: PointsSource
): Promise<void> {
  if (!userId || points <= 0) return;

  if (source === 'hub_reaction' || source === 'hub_message') {
    const key = `${userId}:${source}`;
    const last = hubLastAction.get(key) ?? 0;
    const cooldown = HUB_COOLDOWN_MS[source];
    if (Date.now() - last < cooldown) return;
    hubLastAction.set(key, Date.now());
  }

  const db = rtdbSafe();
  if (!db) return;
  const code = normalizeCountryCode(countryCode);
  const userRef = ref(db, `users/${userId}/nationalPoints`);
  const nationRef = ref(db, `nations/${code}/power`);
  const dailyRef = ref(db, `nations/${code}/dailyGain`);
  const contribRef = ref(db, `users/${userId}/contributions/${source}`);

  await Promise.all([
    txIncrement(userRef, points),
    txIncrement(nationRef, points),
    txIncrement(dailyRef, points),
    txIncrement(contribRef, points),
  ]);
}

export function calculatePronoPoints(prediction: Prono, result: MatchResult): number {
  if (prediction.homeScore === result.homeScore && prediction.awayScore === result.awayScore) {
    return POINTS.prono_exact_score;
  }
  const predWinner =
    prediction.homeScore > prediction.awayScore ? 'home' : prediction.homeScore < prediction.awayScore ? 'away' : 'draw';
  const realWinner =
    result.homeScore > result.awayScore ? 'home' : result.homeScore < result.awayScore ? 'away' : 'draw';
  if (predWinner === realWinner) return POINTS.prono_winner;
  const predDiff = Math.abs(prediction.homeScore - prediction.awayScore);
  const realDiff = Math.abs(result.homeScore - result.awayScore);
  if (predDiff === realDiff) return POINTS.prono_goal_diff;
  if (
    prediction.predictedScorer &&
    result.homeScorer &&
    prediction.predictedScorer.toLowerCase() === result.homeScorer.toLowerCase()
  ) {
    return POINTS.prono_scorer;
  }
  return 0;
}

export async function saveTableau(userId: string, predictions: BracketPrediction[]): Promise<void> {
  const fs = firestoreSafe();
  if (!fs || !userId) return;
  const payload: TableauDoc = { predictions, submittedAt: Date.now() };
  await setDoc(doc(fs, `users/${userId}/games/tableau`), payload);
}

export async function loadTableau(userId: string): Promise<TableauDoc | null> {
  const fs = firestoreSafe();
  if (!fs || !userId) return null;
  const snap = await getDoc(doc(fs, `users/${userId}/games/tableau`));
  if (!snap.exists()) return null;
  return snap.data() as TableauDoc;
}

export async function incrementPopularProno(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<void> {
  const fs = firestoreSafe();
  if (!fs) return;
  const scoreKey = `${homeScore}-${awayScore}`;
  const popularRef = doc(fs, `pronos/${matchId}/aggregates/${scoreKey}`);
  await runFirestoreTransaction(fs, async (t) => {
    const snap = await t.get(popularRef);
    const count = snap.exists() ? asNumber(snap.data()?.count, 0) : 0;
    t.set(popularRef, { score: scoreKey, count: count + 1 }, { merge: true });
  });
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export async function loadPopularPronos(matchId: string): Promise<{ score: string; percentage: number }[]> {
  const fs = firestoreSafe();
  if (!fs) return [];
  const snap = await getDocs(collection(fs, `pronos/${matchId}/aggregates`));
  const rows: { score: string; count: number }[] = [];
  snap.forEach((d) => {
    const data = d.data();
    const score = typeof data.score === 'string' ? data.score : d.id;
    rows.push({ score, count: asNumber(data.count, 0) });
  });
  const total = rows.reduce((s, r) => s + r.count, 0);
  if (total === 0) return [];
  return rows
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((r) => ({
      score: r.score,
      percentage: Math.round((r.count / total) * 100),
    }));
}

export async function saveProno(userId: string, prono: Prono, countryCode?: string): Promise<void> {
  const fs = firestoreSafe();
  if (!fs || !userId) return;
  const raw = {
    ...prono,
    ...(countryCode ? { country: normalizeCountryCode(countryCode) } : {}),
  };
  const payload = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
  await setDoc(doc(fs, `users/${userId}/games/pronos`), { [prono.matchId]: payload }, { merge: true });
  try {
    await incrementPopularProno(prono.matchId, prono.homeScore, prono.awayScore);
  } catch {
    /* Le prono utilisateur est sauvé ; l’agrégat populaire est secondaire. */
  }
}

/** Attribue les points nation une fois le match terminé (idempotent via pointsAwarded). */
export async function awardPronoPointsIfNeeded(
  userId: string,
  countryCode: string,
  prono: Prono,
  result: MatchResult
): Promise<number> {
  if (prono.pointsAwarded != null && prono.pointsAwarded > 0) return prono.pointsAwarded;
  const pts = calculatePronoPoints(prono, result);
  if (pts <= 0) return 0;
  const fs = firestoreSafe();
  if (!fs) return pts;
  await addNationalPoints(userId, countryCode, pts, pts >= POINTS.prono_exact_score ? 'prono_exact_score' : 'prono_winner');
  await setDoc(
    doc(fs, `users/${userId}/games/pronos`),
    { [prono.matchId]: { ...prono, pointsAwarded: pts } },
    { merge: true }
  );
  return pts;
}

export async function loadPronos(userId: string): Promise<Record<string, Prono>> {
  const fs = firestoreSafe();
  if (!fs || !userId) return {};
  const snap = await getDoc(doc(fs, `users/${userId}/games/pronos`));
  if (!snap.exists()) return {};
  return snap.data() as Record<string, Prono>;
}

export async function saveFantasyTeam(userId: string, team: FantasyTeam): Promise<void> {
  const fs = firestoreSafe();
  if (!fs || !userId) return;
  await setDoc(doc(fs, `users/${userId}/games/fantasy`), team);
  await setDoc(doc(fs, `fantasy_teams/${userId}`), team);
}

export async function loadFantasyTeam(userId: string): Promise<FantasyTeam | null> {
  const fs = firestoreSafe();
  if (!fs || !userId) return null;
  const snap = await getDoc(doc(fs, `users/${userId}/games/fantasy`));
  if (!snap.exists()) return null;
  return snap.data() as FantasyTeam;
}

/** Points live fantasy (but) — appelé quand un but est détecté sur le hub / live. */
export async function applyLiveFantasyGoal(
  scorerPlayerId: string,
  points = FANTASY_LIVE_POINTS_GOAL
): Promise<void> {
  const fs = firestoreSafe();
  if (!fs || !scorerPlayerId) return;
  const teamsSnap = await getDocs(
    query(collection(fs, 'fantasy_teams'), where('playerIds', 'array-contains', scorerPlayerId))
  );
  await Promise.all(
    teamsSnap.docs.map(async (teamDoc) => {
      const data = teamDoc.data() as FantasyTeam;
      await addNationalPoints(teamDoc.id, data.country, points, 'fantasy_goal');
    })
  );
}

const FANTASY_LIVE_POINTS_GOAL = POINTS.fantasy_goal;

export async function findDuelOpponent(
  userId: string,
  country: string,
  userName: string
): Promise<Duel | null> {
  const fs = firestoreSafe();
  if (!fs || !userId) return null;
  const code = normalizeCountryCode(country);
  const waiting = await getDocs(
    query(collection(fs, 'duel_waiting'), where('country', '!=', code), limit(1))
  );
  const meta = countryMeta(code);

  if (!waiting.empty) {
    const opponentDoc = waiting.docs[0];
    const opp = opponentDoc.data() as { country: string; name?: string };
    const oppMeta = countryMeta(opp.country);
    const duelId = `${userId}_${opponentDoc.id}`;
    const duel: Duel = {
      id: duelId,
      player1: {
        userId,
        country: code,
        flag: meta.flag,
        points: 0,
        name: userName || 'Joueur',
      },
      player2: {
        userId: opponentDoc.id,
        country: opp.country,
        flag: oppMeta.flag,
        points: 0,
        name: opp.name ?? 'Adversaire',
      },
      matchIds: [],
      status: 'active',
    };
    await setDoc(doc(fs, `duels/${duelId}`), duel);
    await deleteDoc(doc(fs, `duel_waiting/${opponentDoc.id}`));
    return duel;
  }

  await setDoc(doc(fs, `duel_waiting/${userId}`), {
    country: code,
    name: userName,
    createdAt: Date.now(),
  });
  return null;
}

export async function loadActiveDuel(userId: string): Promise<Duel | null> {
  const fs = firestoreSafe();
  if (!fs || !userId) return null;
  const q1 = await getDocs(
    query(collection(fs, 'duels'), where('player1.userId', '==', userId), where('status', '==', 'active'), limit(1))
  );
  if (!q1.empty) return q1.docs[0].data() as Duel;
  const q2 = await getDocs(
    query(collection(fs, 'duels'), where('player2.userId', '==', userId), where('status', '==', 'active'), limit(1))
  );
  if (!q2.empty) return q2.docs[0].data() as Duel;
  return null;
}

export async function updateFantasyPointsForScorer(
  scorerId: string,
  points: number,
  source: PointsSource
): Promise<void> {
  const fs = firestoreSafe();
  if (!fs || !scorerId) return;
  const teams = await getDocs(
    query(collection(fs, 'fantasy_teams'), where('playerIds', 'array-contains', scorerId), limit(40))
  );
  await Promise.all(
    teams.docs.map(async (snap) => {
      const data = snap.data() as FantasyTeam & DocumentData;
      if (!data.userId || !data.country) return;
      await addNationalPoints(data.userId, data.country, points, source);
    })
  );
}
