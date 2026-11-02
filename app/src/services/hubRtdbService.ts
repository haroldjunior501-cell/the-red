import {
  limitToLast,
  off,
  onDisconnect,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  set,
} from 'firebase/database';
import { centroidForCountry, nationColor } from '../constants/hubGlobe';
import { getFirebaseRtdb } from './firebase';

const ACTIVE_TTL_MS = 5 * 60 * 1000;

export type WorldChatMessage = {
  id: string;
  userId: string;
  username: string;
  flag: string;
  country: string;
  countryColor: string;
  rank: string;
  message: string;
  timestamp: number;
  lat: number;
  lng: number;
};

export type ActiveSupporter = {
  id: string;
  lat: number;
  lng: number;
  country: string;
  countryColor: string;
  flag: string;
  username: string;
  rank: string;
  intensity: number;
  lastActive: number;
};

export type NationActivityRow = {
  strength: number;
  supporterCount: number;
  recentActivity: number;
};

function rtdbOrNull() {
  try {
    return getFirebaseRtdb();
  } catch {
    return null;
  }
}

export function subscribeMatchChat(matchId: string, cb: (messages: WorldChatMessage[]) => void): () => void {
  const db = rtdbOrNull();
  if (!db || !matchId) {
    cb([]);
    return () => undefined;
  }
  const qy = query(ref(db, `matches/${matchId}/chat`), orderByChild('timestamp'), limitToLast(200));
  const handler = onValue(qy, (snap) => {
    const val = snap.val() as Record<string, Omit<WorldChatMessage, 'id'>> | null;
    if (!val) {
      cb([]);
      return;
    }
    const rows = Object.entries(val)
      .map(([id, row]) => ({ id, ...row } as WorldChatMessage))
      .sort((a, b) => a.timestamp - b.timestamp);
    cb(rows);
  });
  return () => off(qy, 'value', handler);
}

export async function sendMatchChatMessage(
  matchId: string,
  payload: Omit<WorldChatMessage, 'id' | 'timestamp'>
): Promise<void> {
  const db = rtdbOrNull();
  if (!db || !matchId) return;
  await push(ref(db, `matches/${matchId}/chat`), {
    ...payload,
    timestamp: serverTimestamp(),
  });
  await incrementNationActivity(payload.country);
}

export async function pushSimulatedChatMessage(
  matchId: string,
  payload: Omit<WorldChatMessage, 'id' | 'timestamp'>
): Promise<void> {
  const db = rtdbOrNull();
  if (!db || !matchId) return;
  await push(ref(db, `matches/${matchId}/chat`), {
    ...payload,
    isSimulated: true,
    timestamp: Date.now(),
  });
}

export async function removeSimulatedChat(matchId: string): Promise<void> {
  const db = rtdbOrNull();
  if (!db || !matchId) return;
  await remove(ref(db, `matches/${matchId}/chat`));
}

export function subscribeActiveSupporters(cb: (rows: ActiveSupporter[]) => void): () => void {
  const db = rtdbOrNull();
  if (!db) {
    cb([]);
    return () => undefined;
  }
  const qy = query(ref(db, 'supporters/active'), limitToLast(50));
  const handler = onValue(qy, (snap) => {
    const val = snap.val() as Record<string, Omit<ActiveSupporter, 'id'>> | null;
    if (!val) {
      cb([]);
      return;
    }
    const now = Date.now();
    const rows = Object.entries(val)
      .map(([id, row]) => ({ id, ...row } as ActiveSupporter))
      .filter((row) => now - row.lastActive <= ACTIVE_TTL_MS);
    cb(rows);
  });
  return () => off(qy, 'value', handler);
}

export async function upsertActiveSupporter(
  userId: string,
  data: {
    country: string;
    flag: string;
    username: string;
    rank: string;
    lat: number;
    lng: number;
  }
): Promise<void> {
  const db = rtdbOrNull();
  if (!db || !userId) return;
  const presenceRef = ref(db, `supporters/active/${userId}`);
  await set(presenceRef, {
    country: data.country,
    countryColor: nationColor(data.country),
    flag: data.flag,
    username: data.username,
    rank: data.rank,
    lat: data.lat,
    lng: data.lng,
    intensity: 1,
    lastActive: Date.now(),
  });
  onDisconnect(presenceRef).remove();
}

export function subscribeNations(cb: (rows: Record<string, NationActivityRow>) => void): () => void {
  const db = rtdbOrNull();
  if (!db) {
    cb({});
    return () => undefined;
  }
  const r = ref(db, 'nations');
  const handler = onValue(r, (snap) => {
    cb((snap.val() as Record<string, NationActivityRow> | null) ?? {});
  });
  return () => off(r, 'value', handler);
}

export async function incrementNationActivity(country: string): Promise<void> {
  const db = rtdbOrNull();
  if (!db || !country) return;
  const code = country.toUpperCase();
  const actRef = ref(db, `nations/${code}/recentActivity`);
  await runTransaction(actRef, (current) => (typeof current === 'number' ? current : 0) + 1);
}

export function buildPresencePayload(country: string, username: string, rank: string, flag: string) {
  const [lng, lat] = centroidForCountry(country);
  const jitter = () => (Math.random() - 0.5) * 3;
  return {
    country: country.toUpperCase(),
    flag,
    username,
    rank,
    lat: lat + jitter(),
    lng: lng + jitter(),
  };
}

export async function ensureGoalBoost(matchId: string, goalId: string): Promise<void> {
  const db = rtdbOrNull();
  if (!db || !matchId || !goalId) return;
  const boostRef = ref(db, `matches/${matchId}/boost/${goalId}`);
  await runTransaction(boostRef, (current) => {
    if (current) return current;
    return { count: 0, updatedAt: Date.now() };
  });
}

export function subscribeGoalBoost(matchId: string, goalId: string, cb: (count: number) => void): () => void {
  const db = rtdbOrNull();
  if (!db || !matchId || !goalId) {
    cb(0);
    return () => undefined;
  }
  const boostRef = ref(db, `matches/${matchId}/boost/${goalId}`);
  const handler = onValue(boostRef, (snap) => {
    const val = snap.val() as { count?: number } | null;
    cb(typeof val?.count === 'number' ? val.count : 0);
  });
  return () => off(boostRef, 'value', handler);
}

export async function incrementGoalBoost(matchId: string, goalId: string): Promise<void> {
  const db = rtdbOrNull();
  if (!db || !matchId || !goalId) return;
  const boostRef = ref(db, `matches/${matchId}/boost/${goalId}`);
  await runTransaction(boostRef, (current) => {
    const row = (current as { count?: number; updatedAt?: number } | null) ?? { count: 0 };
    return { count: (row.count ?? 0) + 1, updatedAt: Date.now() };
  });
}
