import { fotmobPlayerImageUrl } from '../constants/fotmob';
import { FOTMOB_API_BASE, FOTMOB_WC_LEAGUE_ID, FOTMOB_WC_SEASON } from '../constants/fotmobWorldCup';
import { FOTMOB_FETCH_HEADERS } from './fotmobFootballMappers';
import { loadFantasyPlayerPool } from './fotmobService';

const UA = FOTMOB_FETCH_HEADERS['User-Agent'];

export type FotmobPlayerRef = {
  fotmobId: number;
  name: string;
  photo: string;
  country?: string;
  club?: string;
  goals?: number;
  assists?: number;
  rating?: number;
};

type PlayerIndexEntry = {
  fotmobId: number;
  photo: string;
  country?: string;
  club?: string;
};

let playerIndex: Map<string, PlayerIndexEntry> | null = null;
let indexBuiltAt = 0;
const INDEX_TTL_MS = 1000 * 60 * 60 * 6;

function normalizeKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lastName(name: string): string {
  const parts = normalizeKey(name).split(' ');
  return parts[parts.length - 1] ?? normalizeKey(name);
}

async function ensurePlayerIndex(): Promise<Map<string, PlayerIndexEntry>> {
  if (playerIndex && Date.now() - indexBuiltAt < INDEX_TTL_MS) return playerIndex;

  const map = new Map<string, PlayerIndexEntry>();
  try {
    const { players } = await loadFantasyPlayerPool();
    for (const p of players) {
      const fid = p.fotmobId ?? Number(p.id);
      if (!Number.isFinite(fid) || fid <= 0) continue;
      const entry: PlayerIndexEntry = {
        fotmobId: fid,
        photo: p.photo || fotmobPlayerImageUrl(fid),
        country: p.country,
        club: p.club,
      };
      const keys = new Set([normalizeKey(p.name), normalizeKey(p.shortName), lastName(p.name)]);
      for (const k of keys) {
        if (k.length >= 2 && !map.has(k)) map.set(k, entry);
      }
    }
  } catch {
    /* pool vide */
  }

  playerIndex = map;
  indexBuiltAt = Date.now();
  return map;
}

export function lookupPlayerByName(name: string, teamHint?: string): PlayerIndexEntry | null {
  if (!playerIndex) return null;
  const full = normalizeKey(name);
  const direct = playerIndex.get(full);
  if (direct) return direct;

  const ln = lastName(name);
  const byLast = playerIndex.get(ln);
  if (byLast) return byLast;

  if (teamHint) {
    const th = normalizeKey(teamHint);
    for (const [key, entry] of playerIndex.entries()) {
      if (key.includes(ln) || ln.includes(key)) {
        if (entry.country && normalizeKey(entry.country).includes(th.slice(0, 4))) return entry;
      }
    }
  }

  return null;
}

export async function resolvePlayerPhoto(name: string, teamHint?: string): Promise<string | undefined> {
  await ensurePlayerIndex();
  const hit = lookupPlayerByName(name, teamHint);
  return hit?.photo;
}

export async function resolveFotmobPlayerId(name: string, teamHint?: string): Promise<number | undefined> {
  await ensurePlayerIndex();
  return lookupPlayerByName(name, teamHint)?.fotmobId;
}

/** FotMob overview players expose `stat` as `{ name, value, format, fractions }` (not a bare number). */
type FotmobStatBag = {
  name?: string;
  value?: number;
  format?: string;
  fractions?: number;
};

type OverviewPlayer = {
  id?: number;
  name?: string;
  teamName?: string;
  goals?: number;
  assists?: number;
  value?: number;
  stat?: number | FotmobStatBag;
  rating?: number;
};

function fotmobStatNumber(raw: unknown, fallback = 0): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const v = (raw as FotmobStatBag).value;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return fallback;
}

async function fetchOverviewLeaders(): Promise<{
  scorers: OverviewPlayer[];
  assisters: OverviewPlayer[];
}> {
  const url = `${FOTMOB_API_BASE}/leagues?id=${FOTMOB_WC_LEAGUE_ID}&tab=overview&season=${FOTMOB_WC_SEASON}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return { scorers: [], assisters: [] };

  const data = (await res.json()) as {
    overview?: {
      topPlayers?: {
        byGoals?: { players?: OverviewPlayer[] };
        byAssists?: { players?: OverviewPlayer[] };
      };
    };
  };

  return {
    scorers: data.overview?.topPlayers?.byGoals?.players ?? [],
    assisters: data.overview?.topPlayers?.byAssists?.players ?? [],
  };
}

export async function getFotmobLeaderboards(limit = 10): Promise<{
  scorers: FotmobPlayerRef[];
  assisters: FotmobPlayerRef[];
}> {
  await ensurePlayerIndex();
  const { scorers, assisters } = await fetchOverviewLeaders();

  const mapRow = (p: OverviewPlayer, statKey: 'goals' | 'assists'): FotmobPlayerRef | null => {
    const name = p.name?.trim();
    if (!name) return null;
    const fromIndex = lookupPlayerByName(name, p.teamName);
    const fotmobId = p.id ?? fromIndex?.fotmobId;
    if (!fotmobId) return null;
    const n = fotmobStatNumber(
      statKey === 'goals' ? (p.goals ?? p.value ?? p.stat) : (p.assists ?? p.value ?? p.stat)
    );
    return {
      fotmobId,
      name,
      photo: fotmobPlayerImageUrl(fotmobId),
      country: p.teamName,
      goals: statKey === 'goals' ? n : undefined,
      assists: statKey === 'assists' ? n : undefined,
      rating: p.rating ?? undefined,
    };
  };

  return {
    scorers: scorers.map((p) => mapRow(p, 'goals')).filter((x): x is FotmobPlayerRef => x != null).slice(0, limit),
    assisters: assisters
      .map((p) => mapRow(p, 'assists'))
      .filter((x): x is FotmobPlayerRef => x != null)
      .slice(0, limit),
  };
}

export type FotmobPlayerProfile = {
  fotmobId: number;
  name: string;
  photo: string;
  position?: string;
  country?: string;
  club?: string;
  goals?: number;
  assists?: number;
  rating?: number;
};

/** Profil joueur — index local + option API (souvent bloquée Turnstile). */
export async function fetchFotmobPlayerProfile(fotmobId: number): Promise<FotmobPlayerProfile | null> {
  await ensurePlayerIndex();
  for (const entry of playerIndex?.values() ?? []) {
    if (entry.fotmobId === fotmobId) {
      return {
        fotmobId,
        name: '',
        photo: entry.photo,
        country: entry.country,
        club: entry.club,
      };
    }
  }

  try {
    const res = await fetch(`${FOTMOB_API_BASE}/playerData?id=${fotmobId}`, {
      headers: { 'User-Agent': UA },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      name?: string;
      primaryTeam?: { teamName?: string };
      positionDescription?: { primaryPosition?: { label?: string } };
      mainLeague?: { stats?: { goals?: number; assists?: number } };
    };
    return {
      fotmobId,
      name: data.name ?? 'Joueur',
      photo: fotmobPlayerImageUrl(fotmobId),
      club: data.primaryTeam?.teamName,
      position: data.positionDescription?.primaryPosition?.label,
      goals: data.mainLeague?.stats?.goals,
      assists: data.mainLeague?.stats?.assists,
    };
  } catch {
    return {
      fotmobId,
      name: 'Joueur',
      photo: fotmobPlayerImageUrl(fotmobId),
    };
  }
}

export async function enrichNamesWithPhotos<T extends { name: string; team?: string }>(
  rows: T[]
): Promise<(T & { photo?: string; fotmobId?: number })[]> {
  await ensurePlayerIndex();
  return rows.map((row) => {
    const hit = lookupPlayerByName(row.name, row.team);
    if (!hit) return row;
    return { ...row, photo: hit.photo, fotmobId: hit.fotmobId };
  });
}
