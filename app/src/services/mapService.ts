/**
 * Données temps réel Guerre Map — Firebase Realtime Database.
 * Si Firebase n’est pas configuré, mode **mock** en mémoire (même API).
 */
import {
  get,
  limitToLast,
  off,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  runTransaction,
  serverTimestamp,
  set,
} from 'firebase/database';
import { getFirebaseRtdb } from './firebase';

export type NationPower = Record<string, number>;

export type TopNationRow = {
  code: string;
  name: string;
  flag: string;
  supporters: string;
  points: string;
};

export type TopSupporterRow = {
  id: string;
  name: string;
  avatar?: string;
  kdo: number;
  country: string;
  rank: number;
};

export type LiveEventRow = {
  id: string;
  type: 'goal' | 'gift' | 'control' | 'join' | 'reaction' | string;
  title: string;
  description?: string;
  timestamp: number;
  country?: string;
};

export type SupporterOnline = {
  userId: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  rank: string;
  avatar?: string;
};

const SEED_POWER: NationPower = { FR: 62, BR: 38, JP: 15, DE: 20, MA: 12, AR: 18 };

const SEED_TOP_NATIONS: TopNationRow[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷', supporters: '1.25M', points: '892K' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷', supporters: '982K', points: '801K' },
  { code: 'AR', name: 'Argentine', flag: '🇦🇷', supporters: '910K', points: '765K' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪', supporters: '640K', points: '512K' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', supporters: '580K', points: '498K' },
];

const SEED_TOP_SUPPORTERS: TopSupporterRow[] = [
  { id: '1', name: 'Harold', kdo: 245000, country: 'FR', rank: 1 },
  { id: '2', name: 'Lucas', kdo: 189500, country: 'BR', rank: 2 },
  { id: '3', name: 'Aminata', kdo: 156200, country: 'FR', rank: 3 },
  { id: '4', name: 'Inès', kdo: 134000, country: 'FR', rank: 4 },
  { id: '5', name: 'Karim', kdo: 121800, country: 'FR', rank: 5 },
];

const SEED_EVENTS: LiveEventRow[] = [
  { id: 'e1', type: 'goal', title: 'BUT !', description: 'France a marqué un but', timestamp: Date.now() - 120000, country: 'FR' },
  { id: 'e2', type: 'gift', title: 'CADEAU LÉGENDAIRE', description: 'Harold a envoyé un Lion', timestamp: Date.now() - 180000, country: 'FR' },
  { id: 'e3', type: 'control', title: 'PRISE DE CONTRÔLE', description: 'Le Brésil prend l’Afrique', timestamp: Date.now() - 300000, country: 'BR' },
  { id: 'e4', type: 'join', title: 'NOUVEAU SUPPORTER', description: 'Lucas a rejoint ta nation', timestamp: Date.now() - 420000, country: 'BR' },
];

const SEED_ONLINE: SupporterOnline[] = [
  { userId: 'u1', name: 'Karim', country: 'FR', lat: 48.85, lng: 2.35, rank: 'Capitaine', avatar: undefined },
  { userId: 'u2', name: 'Inès', country: 'FR', lat: 45.76, lng: 4.84, rank: 'Vétéran' },
  { userId: 'u3', name: 'Lucas', country: 'BR', lat: -22.9, lng: -43.2, rank: 'Capitaine' },
  { userId: 'u4', name: 'Ana', country: 'BR', lat: -23.55, lng: -46.63, rank: 'Supporter' },
  { userId: 'u5', name: 'Youssef', country: 'MA', lat: 33.97, lng: -6.85, rank: 'Vétéran' },
  { userId: 'u6', name: 'Sakura', country: 'JP', lat: 35.68, lng: 139.76, rank: 'Supporter' },
];

type MockState = {
  nations_power: NationPower;
  top_nations: TopNationRow[];
  top_supporters: TopSupporterRow[];
  global_events: Record<string, Omit<LiveEventRow, 'id'>>;
  supporters_online: Record<string, SupporterOnline>;
};

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

let mockState: MockState = {
  nations_power: clone(SEED_POWER),
  top_nations: clone(SEED_TOP_NATIONS),
  top_supporters: clone(SEED_TOP_SUPPORTERS),
  global_events: Object.fromEntries(
    SEED_EVENTS.map((e) => [e.id, { type: e.type, title: e.title, description: e.description, timestamp: e.timestamp, country: e.country }])
  ),
  supporters_online: Object.fromEntries(SEED_ONLINE.map((s) => [s.userId, s])),
};

type Listener = () => void;
const mockListeners = new Set<Listener>();

function notifyMock() {
  mockListeners.forEach((l) => l());
}

let rtdbOk: boolean | null = null;

function useRtdb() {
  if (rtdbOk === false) return null;
  if (rtdbOk === true) return getFirebaseRtdb();
  try {
    const db = getFirebaseRtdb();
    rtdbOk = true;
    return db;
  } catch {
    rtdbOk = false;
    console.warn('[mapService] Firebase RTDB indisponible — mode mock mémoire.');
    return null;
  }
}

async function ensureFirebaseSeed(db: ReturnType<typeof getFirebaseRtdb>) {
  const snap = await get(ref(db, 'nations_power'));
  if (!snap.exists()) {
    await set(ref(db, 'nations_power'), SEED_POWER);
    await set(ref(db, 'top_nations'), SEED_TOP_NATIONS);
    await set(ref(db, 'top_supporters'), SEED_TOP_SUPPORTERS);
    await set(ref(db, 'supporters_online'), Object.fromEntries(SEED_ONLINE.map((s) => [s.userId, s])));
    for (const e of SEED_EVENTS) {
      await push(ref(db, 'global_events'), {
        type: e.type,
        title: e.title,
        description: e.description,
        timestamp: e.timestamp,
        country: e.country,
      });
    }
  }
}

export function subscribeToNationsPower(cb: (v: NationPower) => void): () => void {
  const db = useRtdb();
  if (!db) {
    const fn = () => cb({ ...mockState.nations_power });
    mockListeners.add(fn);
    queueMicrotask(fn);
    return () => mockListeners.delete(fn);
  }
  void ensureFirebaseSeed(db);
  const r = ref(db, 'nations_power');
  const h = onValue(r, (s) => cb((s.val() as NationPower) ?? SEED_POWER));
  return () => off(r, 'value', h);
}

export function subscribeToTopNations(cb: (v: TopNationRow[]) => void): () => void {
  const db = useRtdb();
  if (!db) {
    const fn = () => cb([...mockState.top_nations]);
    mockListeners.add(fn);
    queueMicrotask(fn);
    return () => mockListeners.delete(fn);
  }
  void ensureFirebaseSeed(db);
  const r = ref(db, 'top_nations');
  const h = onValue(r, (s) => {
    const v = s.val() as TopNationRow[] | Record<string, TopNationRow> | null;
    const arr = Array.isArray(v) ? v : v ? Object.values(v) : SEED_TOP_NATIONS;
    cb(arr as TopNationRow[]);
  });
  return () => off(r, 'value', h);
}

export function subscribeToTopSupporters(cb: (v: TopSupporterRow[]) => void): () => void {
  const db = useRtdb();
  if (!db) {
    const fn = () => cb([...mockState.top_supporters]);
    mockListeners.add(fn);
    queueMicrotask(fn);
    return () => mockListeners.delete(fn);
  }
  void ensureFirebaseSeed(db);
  const r = ref(db, 'top_supporters');
  const h = onValue(r, (s) => {
    const v = s.val() as TopSupporterRow[] | Record<string, TopSupporterRow> | null;
    const arr = Array.isArray(v) ? v : v ? Object.values(v) : SEED_TOP_SUPPORTERS;
    cb(arr as TopSupporterRow[]);
  });
  return () => off(r, 'value', h);
}

export function subscribeToLiveEvents(cb: (v: LiveEventRow[]) => void): () => void {
  const db = useRtdb();
  if (!db) {
    const fn = () => {
      const rows = Object.entries(mockState.global_events)
        .map(([id, v]) => ({ id, ...v } as LiveEventRow))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);
      cb(rows);
    };
    mockListeners.add(fn);
    queueMicrotask(fn);
    return () => mockListeners.delete(fn);
  }
  void ensureFirebaseSeed(db);
  const qy = query(ref(db, 'global_events'), orderByChild('timestamp'), limitToLast(20));
  const h = onValue(qy, (s) => {
    const val = s.val() as Record<string, Omit<LiveEventRow, 'id'>> | null;
    if (!val) {
      cb([]);
      return;
    }
    const rows = Object.entries(val)
      .map(([id, v]) => ({ id, ...v } as LiveEventRow))
      .sort((a, b) => a.timestamp - b.timestamp);
    cb(rows);
  });
  return () => off(qy, 'value', h);
}

export function subscribeToSupportersOnline(cb: (v: SupporterOnline[]) => void): () => void {
  const db = useRtdb();
  if (!db) {
    const fn = () => cb(Object.values(mockState.supporters_online));
    mockListeners.add(fn);
    queueMicrotask(fn);
    return () => mockListeners.delete(fn);
  }
  void ensureFirebaseSeed(db);
  const r = ref(db, 'supporters_online');
  const h = onValue(r, (s) => {
    const v = s.val() as Record<string, SupporterOnline> | null;
    cb(v ? Object.values(v) : SEED_ONLINE);
  });
  return () => off(r, 'value', h);
}

export async function sendReaction(type: string, userId: string, country: string, meta?: Record<string, unknown>) {
  const db = useRtdb();
  if (!db) {
    const id = `evt_${Date.now()}`;
    mockState.global_events[id] = {
      type: 'reaction',
      title: String(meta?.title ?? 'Réaction'),
      description: String(meta?.description ?? type),
      timestamp: Date.now(),
      country,
    };
    notifyMock();
    return;
  }
  await push(ref(db, 'global_events'), {
    type: 'reaction',
    reactionType: type,
    userId,
    country,
    ...meta,
    timestamp: serverTimestamp(),
  });
}

export async function sendGlobalGiftEvent(params: { userName: string; gift: string; team: string; power?: number }) {
  const db = useRtdb();
  const title = 'CADEAU LIVE';
  const description = `${params.userName} a envoyé un ${params.gift} pour ${params.team}`;
  if (!db) {
    const id = `evt_${Date.now()}`;
    mockState.global_events[id] = {
      type: 'gift',
      title,
      description,
      timestamp: Date.now(),
      country: params.team === 'France' ? 'FR' : 'BR',
    };
    notifyMock();
    return;
  }
  await push(ref(db, 'global_events'), {
    type: 'gift',
    title,
    description,
    country: params.team,
    power: params.power ?? 0,
    timestamp: serverTimestamp(),
  });
}

// ─── Chat par nation ──────────────────────────────────────────────────────────

export type ChatMessage = {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  rank: string;
};

type MockChatStore = Record<string, ChatMessage[]>;
const mockChat: MockChatStore = {
  FR: [
    { id: 'c1', userId: 'u1', username: 'Karim',   message: 'ALLEZ LES BLEUS ! 🇫🇷',       timestamp: Date.now() - 30000, rank: 'Capitaine' },
    { id: 'c2', userId: 'u2', username: 'Inès',    message: 'On les écrase !!! 🔥',          timestamp: Date.now() - 20000, rank: 'Vétéran' },
    { id: 'c3', userId: 'u5', username: 'Karim',   message: "C'est notre Coupe du Monde 🏆",  timestamp: Date.now() - 10000, rank: 'Vétéran' },
  ],
  BR: [
    { id: 'c4', userId: 'u3', username: 'Lucas',   message: 'Vai Brasil !! 🇧🇷💚',           timestamp: Date.now() - 25000, rank: 'Capitaine' },
    { id: 'c5', userId: 'u4', username: 'Ana',     message: 'On va tout gagner 🔥',           timestamp: Date.now() - 15000, rank: 'Supporter' },
  ],
};

export function subscribeToNationChat(nationCode: string, cb: (msgs: ChatMessage[]) => void): () => void {
  const db = useRtdb();
  if (!db) {
    const fn = () => cb([...(mockChat[nationCode] ?? [])]);
    mockListeners.add(fn);
    queueMicrotask(fn);
    return () => mockListeners.delete(fn);
  }
  void ensureFirebaseSeed(db);
  const qy = query(ref(db, `nations/${nationCode}/chat`), orderByChild('timestamp'), limitToLast(50));
  const h = onValue(qy, (s) => {
    const val = s.val() as Record<string, Omit<ChatMessage, 'id'>> | null;
    if (!val) { cb([]); return; }
    const msgs = Object.entries(val)
      .map(([id, v]) => ({ id, ...v } as ChatMessage))
      .sort((a, b) => a.timestamp - b.timestamp);
    cb(msgs);
  });
  return () => off(qy, 'value', h);
}

export async function sendNationChatMessage(
  nationCode: string,
  msg: { userId: string; username: string; message: string; rank: string }
): Promise<void> {
  const db = useRtdb();
  if (!db) {
    const id = `cm_${Date.now()}`;
    if (!mockChat[nationCode]) mockChat[nationCode] = [];
    mockChat[nationCode].push({ id, ...msg, timestamp: Date.now() });
    notifyMock();
    return;
  }
  await push(ref(db, `nations/${nationCode}/chat`), {
    ...msg,
    timestamp: serverTimestamp(),
  });
}

export async function updateNationPower(country: string, delta: number) {
  const db = useRtdb();
  if (!db) {
    const next = { ...mockState.nations_power };
    next[country] = Math.max(0, Math.min(100, (next[country] ?? 0) + delta));
    const keys = Object.keys(next).filter((k) => k !== country);
    const ally = next[country] ?? 0;
    const rest = Math.max(0, 100 - ally);
    if (keys.length === 1) next[keys[0]] = rest;
    mockState.nations_power = next;
    notifyMock();
    return;
  }
  const r = ref(db, 'nations_power');
  await runTransaction(r, (cur) => {
    const c = (cur as NationPower | null) ?? { ...SEED_POWER };
    const out: NationPower = { ...c };
    out[country] = Math.max(0, Math.min(100, (out[country] ?? 0) + delta));
    const others = Object.keys(out).filter((k) => k !== country);
    const sumOthers = others.reduce((s, k) => s + (out[k] ?? 0), 0);
    const target = Math.max(0, 100 - (out[country] ?? 0));
    if (sumOthers > 0 && others.length) {
      const f = target / sumOthers;
      others.forEach((k) => {
        out[k] = Math.max(0, Math.round((out[k] ?? 0) * f));
      });
    }
    return out;
  });
}
