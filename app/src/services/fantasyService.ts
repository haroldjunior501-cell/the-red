import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ALL_SLOT_KEYS, BENCH_SLOT_KEYS } from '../constants/fantasyPitch';
import { FANTASY_BUDGET_M } from '../constants/fantasyTheme';
import { getFirestoreDb } from './firebase';
import { registerSimulatorArena } from './simulatorArenaService';
import type { FantasyBenchState, FantasySlotsState, FantasyTeamDoc } from '../types/fantasy.types';
import type { FantasyTeam } from '../types/games.types';

const FANTASY_GUEST_ID_KEY = '@goalya/fantasy_guest_user_id';
const FANTASY_LOCAL_PREFIX = '@goalya/fantasy_team_v2:';

export type FantasySaveResult = {
  ok: boolean;
  mode: 'cloud' | 'local';
  cloudError?: string;
};

function firestoreSafe() {
  try {
    return getFirestoreDb();
  } catch {
    return null;
  }
}

/** Firestore rejette les champs `undefined` — on les retire avant écriture. */
export function sanitizeForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function ensureFantasyStorageUserId(): Promise<string> {
  const existing = await AsyncStorage.getItem(FANTASY_GUEST_ID_KEY);
  if (existing?.trim()) return existing.trim();
  const id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(FANTASY_GUEST_ID_KEY, id);
  return id;
}

function localKey(userId: string) {
  return `${FANTASY_LOCAL_PREFIX}${userId}`;
}

export function emptySlots(): FantasySlotsState {
  const slots = {} as FantasySlotsState;
  for (const key of ALL_SLOT_KEYS) slots[key] = null;
  return slots;
}

export function emptyBench(): FantasyBenchState {
  const bench = {} as FantasyBenchState;
  for (const key of BENCH_SLOT_KEYS) bench[key] = null;
  return bench;
}

const FANTASY_LOAD_MS = 6000;

export async function loadFantasyTeamLocal(userId: string): Promise<FantasyTeamDoc | null> {
  if (!userId) return null;
  try {
    const raw = await AsyncStorage.getItem(localKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { team?: FantasyTeamDoc };
    return parsed.team ?? null;
  } catch {
    return null;
  }
}

export async function saveFantasyTeamLocal(userId: string, team: FantasyTeamDoc): Promise<void> {
  const clean = sanitizeForFirestore(team);
  await AsyncStorage.setItem(
    localKey(userId),
    JSON.stringify({ team: clean, savedAt: Date.now() })
  );
}

function buildLegacyFantasyTeam(
  userId: string,
  team: FantasyTeamDoc,
  countryCode: string
): FantasyTeam {
  const players: FantasyTeam['players'] = [];
  const playerIds: string[] = [];

  for (const key of ALL_SLOT_KEYS) {
    const p = team.slots[key];
    if (!p) continue;
    playerIds.push(p.id);
    players.push({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      country: p.country,
      countryCode: p.countryCode,
      jerseyNumber: p.number,
      position: p.position,
      price: p.price,
      goals: p.goals,
      assists: 0,
      rating: p.rating,
      fantasyPoints: p.pts,
      totalPoints: p.pts,
      isCaptain: team.captainSlot === key,
    });
  }

  for (const key of BENCH_SLOT_KEYS) {
    const p = team.bench?.[key];
    if (p && !playerIds.includes(p.id)) playerIds.push(p.id);
  }

  return {
    userId,
    country: countryCode,
    formation: team.formation,
    players,
    playerIds,
    totalPoints: team.totalPoints,
    budget: team.budget,
  };
}

export async function loadFantasyTeamDoc(userId: string): Promise<FantasyTeamDoc | null> {
  const fs = firestoreSafe();
  if (!fs || !userId) return null;
  try {
    const snap = await getDoc(doc(fs, `users/${userId}/fantasy/team`));
    if (!snap.exists()) return null;
    return normalizeTeamDoc(snap.data() as FantasyTeamDoc);
  } catch {
    return null;
  }
}

function normalizeTeamDoc(data: FantasyTeamDoc): FantasyTeamDoc {
  const slots = emptySlots();
  for (const key of ALL_SLOT_KEYS) {
    slots[key] = data.slots?.[key] ?? null;
  }
  const bench = emptyBench();
  for (const key of BENCH_SLOT_KEYS) {
    bench[key] = data.bench?.[key] ?? null;
  }
  return {
    formation: data.formation ?? '4-3-3',
    slots,
    bench,
    captainSlot: data.captainSlot ?? null,
    totalPoints: data.totalPoints ?? 0,
    budget: data.budget ?? FANTASY_BUDGET_M,
    spent: data.spent ?? 0,
  };
}

export function loadFantasyTeamDocWithTimeout(
  userId: string,
  timeoutMs = FANTASY_LOAD_MS
): Promise<FantasyTeamDoc | null> {
  return Promise.race([
    loadFantasyTeamDoc(userId),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

export async function loadFantasyTeamForUser(userId: string | null | undefined): Promise<FantasyTeamDoc | null> {
  const guestId = await ensureFantasyStorageUserId();
  const uid = userId?.trim() || guestId;

  if (userId?.trim()) {
    const cloud = await loadFantasyTeamDocWithTimeout(userId.trim());
    if (cloud && countFilledSlots(cloud.slots) > 0) return cloud;

    const localAuth = await loadFantasyTeamLocal(userId.trim());
    if (localAuth && countFilledSlots(localAuth.slots) > 0) return localAuth;
  }

  const localGuest = await loadFantasyTeamLocal(guestId);
  if (localGuest && countFilledSlots(localGuest.slots) > 0) return localGuest;

  return loadFantasyTeamLocal(uid);
}

function countFilledSlots(slots: FantasySlotsState): number {
  return Object.values(slots).filter(Boolean).length;
}

export async function saveFantasyTeamDoc(
  userId: string | null | undefined,
  team: FantasyTeamDoc,
  countryCode = ''
): Promise<FantasySaveResult> {
  const uid = userId?.trim() || (await ensureFantasyStorageUserId());
  const clean = sanitizeForFirestore({
    ...team,
    updatedAt: Date.now(),
  });

  await saveFantasyTeamLocal(uid, clean);

  const fs = firestoreSafe();
  const authenticated = Boolean(userId?.trim());
  if (!fs) {
    if (authenticated) {
      return { ok: false, mode: 'local', cloudError: 'Firebase non configuré' };
    }
    return { ok: true, mode: 'local' };
  }

  if (!authenticated) {
    return { ok: true, mode: 'local' };
  }

  try {
    await setDoc(doc(fs, `users/${uid}/fantasy/team`), clean);

    const legacy = sanitizeForFirestore(buildLegacyFantasyTeam(uid, clean, countryCode));
    await setDoc(doc(fs, `users/${uid}/games/fantasy`), legacy);
    await setDoc(doc(fs, `fantasy_teams/${uid}`), legacy);

    void registerSimulatorArena({ country: countryCode }).catch(() => undefined);

    return { ok: true, mode: 'cloud' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur cloud';
    return { ok: false, mode: 'local', cloudError: msg };
  }
}
