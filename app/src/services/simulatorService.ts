import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { RANKING_PAGE_SIZE, SIMULATOR_SEASON_ID } from '../constants/simulator';
import type { RankingFilter, SimulatorRankingEntry } from '../types/arena.types';
import { countryMeta, normalizeCountryCode } from './gamesService';
import { getFirestoreDb } from './firebase';

type RankingDoc = {
  userId?: string;
  displayName?: string;
  name?: string;
  country?: string;
  profilePhotoUrl?: string;
  totalPoints?: number;
  weeklyPoints?: number;
  captainId?: string;
  captainCountry?: string;
  wins?: number;
  rank?: number;
  rankDelta?: 'up' | 'down' | 'stable';
  updatedAt?: number;
};

function firestoreSafe() {
  try {
    return getFirestoreDb();
  } catch {
    return null;
  }
}

function rankingsCollection(fs: ReturnType<typeof getFirestoreDb>) {
  return collection(fs, 'simulator', SIMULATOR_SEASON_ID, 'rankings');
}

function parseRankingDoc(
  snap: DocumentSnapshot,
  fallbackRank: number
): SimulatorRankingEntry | null {
  const data = snap.data() as RankingDoc | undefined;
  if (!data) return null;
  const country = normalizeCountryCode(data.country ?? 'FR');
  const meta = countryMeta(country);
  const captainCountry = normalizeCountryCode(data.captainCountry ?? country);
  const captainMeta = countryMeta(captainCountry);
  const userId = data.userId ?? snap.id;
  return {
    userId,
    displayName: data.displayName ?? data.name ?? 'Joueur',
    country,
    flag: meta.flag,
    profilePhotoUrl: data.profilePhotoUrl ?? null,
    totalPoints: data.totalPoints ?? 0,
    weeklyPoints: data.weeklyPoints ?? 0,
    captainId: data.captainId ?? '',
    captainFlag: captainMeta.flag,
    wins: data.wins ?? 0,
    rank: data.rank ?? fallbackRank,
    rankDelta: data.rankDelta ?? 'stable',
  };
}

export type RankingPageResult = {
  entries: SimulatorRankingEntry[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
};

export async function fetchRankingPage(
  filter: RankingFilter,
  options: {
    userId: string;
    userName?: string;
    country: string;
    friendIds?: string[];
    lastDoc?: DocumentSnapshot | null;
    pageSize?: number;
  }
): Promise<RankingPageResult> {
  const pageSize = options.pageSize ?? RANKING_PAGE_SIZE;

  const fs = firestoreSafe();
  if (!fs) {
    return { entries: [], lastDoc: null, hasMore: false };
  }

  const constraints: QueryConstraint[] = [];
  const code = normalizeCountryCode(options.country);

  if (filter === 'week') {
    constraints.push(orderBy('weeklyPoints', 'desc'));
  } else {
    constraints.push(orderBy('totalPoints', 'desc'));
  }

  if (filter === 'nation') {
    constraints.push(where('country', '==', code));
  }

  if (filter === 'friends') {
    const ids = (options.friendIds ?? []).filter(Boolean).slice(0, 10);
    if (ids.length === 0) {
      return { entries: [], lastDoc: null, hasMore: false };
    }
    constraints.push(where('userId', 'in', ids));
  }

  constraints.push(limit(pageSize));

  if (options.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  const snap = await getDocs(query(rankingsCollection(fs), ...constraints));
  const startRank = options.lastDoc ? 0 : 1;
  const entries = snap.docs
    .map((d, i) => parseRankingDoc(d, startRank + i))
    .filter((e): e is SimulatorRankingEntry => e !== null);

  const ranked = entries.map((e, i) => ({
    ...e,
    rank: options.lastDoc ? e.rank : i + 1,
  }));

  const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return {
    entries: ranked,
    lastDoc: last,
    hasMore: snap.docs.length >= pageSize,
  };
}

export async function fetchUserRanking(userId: string): Promise<SimulatorRankingEntry | null> {
  if (!userId) return null;

  const fs = firestoreSafe();
  if (!fs) return null;

  const snap = await getDoc(doc(rankingsCollection(fs), userId));
  if (!snap.exists()) return null;
  const entry = parseRankingDoc(snap, 0);
  if (!entry) return null;
  return entry;
}
