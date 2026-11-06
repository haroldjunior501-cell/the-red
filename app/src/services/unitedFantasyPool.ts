/**
 * Pool Fantasy THE RED — effectif Manchester United uniquement.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UNITED_SQUAD_SEED } from '../constants/unitedSquadSeed';
import { FOTMOB_MU_FULL_NAME, FOTMOB_MU_TEAM_ID } from '../constants/fotmobTheRed';
import { fotmobPlayerImageUrl } from '../constants/fotmob';
import type { FantasyListPosition, FantasyPitchPlayer } from '../types/fantasy.types';
import { fetchFotmobSquad, type SquadMember } from './fotmobSquad';
import { groupPlayersByPosition } from './fotmobService';

const CACHE_KEY = '@thered/united_fantasy_pool_v2';
const CACHE_TTL_MS = 1000 * 60 * 30;

function mapRole(roleKey: string): FantasyListPosition {
  const t = (roleKey || '').toLowerCase();
  if (t.includes('keep') || t === 'gk') return 'GK';
  if (t.includes('def')) return 'DEF';
  if (t.includes('mid')) return 'MID';
  if (t.includes('att') || t.includes('forw') || t.includes('strik')) return 'ATT';
  return 'MID';
}

function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return full.slice(0, 12);
  const last = parts[parts.length - 1] ?? full;
  return last.length > 11 ? `${last.slice(0, 10)}…` : last;
}

function squadMemberToFantasy(m: SquadMember): FantasyPitchPlayer {
  const position = mapRole(m.roleKey);
  return {
    id: String(m.id),
    fotmobId: m.id,
    name: m.name,
    shortName: shortName(m.name),
    photo: m.photo || fotmobPlayerImageUrl(m.id),
    country: 'England',
    countryCode: 'ENG',
    club: FOTMOB_MU_FULL_NAME,
    number: m.shirtNumber ?? (m.id % 99) + 1,
    price: 0,
    pts: Math.round((m.rating ?? 6.5) * 2),
    goals: m.goals ?? 0,
    rating: m.rating ?? 6.5,
    position,
  };
}

export async function loadUnitedFantasyPlayerPool(): Promise<{
  players: FantasyPitchPlayer[];
  source: 'cache' | 'network' | 'seed';
}> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as { savedAt: number; players: FantasyPitchPlayer[] };
      if (Date.now() - cached.savedAt < CACHE_TTL_MS && cached.players?.length >= 11) {
        return { players: cached.players, source: 'cache' };
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const squad = await fetchFotmobSquad(FOTMOB_MU_TEAM_ID);
    const players = squad.map(squadMemberToFantasy);
    if (players.length >= 11) {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ savedAt: Date.now(), players })
      ).catch(() => {});
      return { players, source: 'network' };
    }
  } catch {
    /* fallback seed */
  }

  return { players: UNITED_SQUAD_SEED, source: 'seed' };
}

export { groupPlayersByPosition };
