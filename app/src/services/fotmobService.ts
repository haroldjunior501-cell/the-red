import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FantasyListPosition, FantasyPitchPlayer } from '../types/fantasy.types';
import {
  FOTMOB_CACHE_KEY,
  FOTMOB_CACHE_TTL_MS,
  FOTMOB_WORLD_CUP_2026_TEAMS,
  fotmobPlayerImageUrl,
  type FotmobNationalTeam,
} from '../constants/fotmob';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

type FotmobSquadMember = {
  id: number;
  name: string;
  shirtNumber?: number | null;
  cname?: string;
  role?: { key?: string };
  transferValue?: number;
  rating?: number | null;
  goals?: number;
  assists?: number;
};

type FotmobSquadCategory = {
  title: string;
  members?: FotmobSquadMember[];
};

type FotmobSquadResponse = {
  squad?: { squad?: FotmobSquadCategory[] };
};

function mapRoleToPosition(roleKey?: string): FantasyListPosition | null {
  if (!roleKey) return null;
  if (roleKey.includes('keeper')) return 'GK';
  if (roleKey.includes('defender')) return 'DEF';
  if (roleKey.includes('midfielder')) return 'MID';
  if (roleKey.includes('attacker') || roleKey.includes('forward')) return 'ATT';
  return null;
}

function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return full.slice(0, 12);
  const last = parts[parts.length - 1] ?? full;
  return last.length > 11 ? `${last.slice(0, 10)}…` : last;
}

function stablePts(id: number, position: FantasyListPosition): number {
  const base = { ATT: 7, MID: 6, DEF: 5, GK: 4 }[position];
  return base + (id % 5);
}

function priceFromValue(transferValue?: number, id = 0): number {
  if (transferValue && transferValue > 0) {
    const m = transferValue / 4_000_000;
    return Math.min(18, Math.max(6, Math.round(m)));
  }
  return 7 + (id % 8);
}

function mapMemberToPlayer(
  m: FotmobSquadMember,
  team: FotmobNationalTeam
): FantasyPitchPlayer | null {
  const position = mapRoleToPosition(m.role?.key);
  if (!position) return null;

  const id = String(m.id);
  return {
    id,
    fotmobId: m.id,
    name: m.name,
    shortName: shortName(m.name),
    photo: fotmobPlayerImageUrl(m.id),
    country: team.country,
    countryCode: team.countryCode,
    club: m.cname,
    number: m.shirtNumber ?? (m.id % 99) + 1,
    price: priceFromValue(m.transferValue, m.id),
    pts: stablePts(m.id, position),
    goals: m.goals ?? 0,
    rating: m.rating ? Number(m.rating) : 7 + (m.id % 30) / 10,
    position,
  };
}

export async function fetchNationalTeamSquad(team: FotmobNationalTeam): Promise<FantasyPitchPlayer[]> {
  const url = `https://www.fotmob.com/api/data/teams?id=${team.teamId}&tab=squad`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`FotMob squad ${team.countryCode} (${res.status})`);
  const data = (await res.json()) as FotmobSquadResponse;
  const categories = data.squad?.squad ?? [];
  const out: FantasyPitchPlayer[] = [];

  for (const cat of categories) {
    if (cat.title === 'coach') continue;
    for (const m of cat.members ?? []) {
      const p = mapMemberToPlayer(m, team);
      if (p) out.push(p);
    }
  }
  return out;
}

async function fetchAllWorldCupPlayers(): Promise<FantasyPitchPlayer[]> {
  const chunkSize = 6;
  const all: FantasyPitchPlayer[] = [];

  for (let i = 0; i < FOTMOB_WORLD_CUP_2026_TEAMS.length; i += chunkSize) {
    const chunk = FOTMOB_WORLD_CUP_2026_TEAMS.slice(i, i + chunkSize);
    const batches = await Promise.all(
      chunk.map(async (team) => {
        try {
          return await fetchNationalTeamSquad(team);
        } catch {
          return [] as FantasyPitchPlayer[];
        }
      })
    );
    all.push(...batches.flat());
  }

  const byId = new Map<string, FantasyPitchPlayer>();
  for (const p of all) byId.set(p.id, p);
  return Array.from(byId.values());
}

type CachedPool = {
  savedAt: number;
  players: FantasyPitchPlayer[];
};

export async function loadFantasyPlayerPool(): Promise<{
  players: FantasyPitchPlayer[];
  source: 'cache' | 'network' | 'demo';
}> {
  try {
    const raw = await AsyncStorage.getItem(FOTMOB_CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as CachedPool;
      if (Date.now() - cached.savedAt < FOTMOB_CACHE_TTL_MS && cached.players?.length) {
        return { players: cached.players, source: 'cache' };
      }
    }
  } catch {
    /* ignore */
  }

  const players = await fetchAllWorldCupPlayers();
  if (players.length > 40) {
    const payload: CachedPool = { savedAt: Date.now(), players };
    await AsyncStorage.setItem(FOTMOB_CACHE_KEY, JSON.stringify(payload)).catch(() => {});
    return { players, source: 'network' };
  }

  return { players: [], source: 'demo' };
}

export function groupPlayersByPosition(
  players: FantasyPitchPlayer[]
): Record<FantasyListPosition, FantasyPitchPlayer[]> {
  const pool: Record<FantasyListPosition, FantasyPitchPlayer[]> = {
    ATT: [],
    MID: [],
    DEF: [],
    GK: [],
  };
  for (const p of players) pool[p.position].push(p);
  for (const key of Object.keys(pool) as FantasyListPosition[]) {
    pool[key].sort((a, b) => b.pts - a.pts || a.name.localeCompare(b.name));
  }
  return pool;
}
