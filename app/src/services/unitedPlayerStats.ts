/**
 * Classements stats joueurs — Manchester United uniquement (saison courante).
 */
import { fotmobPlayerImageUrl } from '../constants/fotmob';
import {
  FOTMOB_MU_FULL_NAME,
  FOTMOB_MU_TEAM_ID,
  FOTMOB_PL_LEAGUE_ID,
} from '../constants/fotmobTheRed';
import type { PlayerStatKind } from '../constants/homeStats';
import { FOTMOB_API_BASE } from '../constants/fotmobWorldCup';
import { FOTMOB_FETCH_HEADERS } from './fotmobHttp';
import { fetchManchesterUnitedTeam } from './fotmobClubApi';

export type UnitedPlayerStatRow = {
  name: string;
  team: string;
  value: number;
  photo?: string;
  fotmobId?: number;
};

/** Clé fichier data.fotmob.com pour chaque onglet home. */
const STAT_FILE: Record<PlayerStatKind, string> = {
  goals: 'goals.json',
  assists: 'goal_assist.json',
  shots: 'total_scoring_att.json',
  dribbles: 'won_contest.json',
  passAccuracy: 'accurate_pass.json',
};

type StatsCat = {
  header?: string;
  fetchAllUrl?: string;
  topThree?: Array<{
    id?: number;
    name?: string;
    value?: number;
    teamId?: number;
    teamName?: string;
    stat?: { value?: number };
  }>;
};

type LeaderRow = {
  ParticipantName?: string;
  ParticiantId?: number;
  ParticipantId?: number;
  TeamId?: number;
  TeamName?: string;
  StatValue?: number;
};

function fotmobStatNumber(raw: unknown, fallback = 0): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const v = (raw as { value?: number }).value;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return fallback;
}

async function resolveSeasonMeta(): Promise<{ leagueId: number; seasonId: number; cats: StatsCat[] }> {
  const payload = (await fetchManchesterUnitedTeam()) as {
    stats?: { primaryLeagueId?: number; primarySeasonId?: number; players?: StatsCat[] };
  };
  const leagueId = payload.stats?.primaryLeagueId ?? FOTMOB_PL_LEAGUE_ID;
  const seasonId = payload.stats?.primarySeasonId ?? 0;
  return { leagueId, seasonId, cats: payload.stats?.players ?? [] };
}

function mapTopThree(cats: StatsCat[], kind: PlayerStatKind): UnitedPlayerStatRow[] {
  const file = STAT_FILE[kind];
  const cat =
    cats.find((c) => c.fetchAllUrl?.includes(`/${file.replace('.json', '')}.json`) || c.fetchAllUrl?.endsWith(file)) ??
    cats.find((c) => {
      const h = (c.header ?? '').toLowerCase();
      if (kind === 'goals') return h.includes('top scorer') || h === 'goals';
      if (kind === 'assists') return h === 'assists';
      if (kind === 'shots') return h.includes('shots per');
      if (kind === 'dribbles') return h.includes('dribble');
      if (kind === 'passAccuracy') return h.includes('accurate pass');
      return false;
    });
  if (!cat?.topThree?.length) return [];
  return cat.topThree
    .filter((p) => !p.teamId || p.teamId === FOTMOB_MU_TEAM_ID)
    .map((p) => ({
      name: p.name?.trim() || '—',
      team: p.teamName ?? FOTMOB_MU_FULL_NAME,
      value: fotmobStatNumber(p.value ?? p.stat),
      photo: p.id ? fotmobPlayerImageUrl(p.id) : undefined,
      fotmobId: p.id,
    }))
    .filter((r) => r.name !== '—');
}

async function fetchLeagueStatFile(
  leagueId: number,
  seasonId: number,
  kind: PlayerStatKind
): Promise<LeaderRow[]> {
  if (!seasonId) return [];
  const file = STAT_FILE[kind];
  const url = `https://data.fotmob.com/stats/${leagueId}/season/${seasonId}/${file}`;
  const res = await fetch(url, {
    headers: {
      ...FOTMOB_FETCH_HEADERS,
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
    },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { TopLists?: Array<{ StatList?: LeaderRow[] }> };
  return data.TopLists?.[0]?.StatList ?? [];
}

/** Classement MU pour un type de stat (saison PL courante). */
export async function getUnitedPlayerStats(
  kind: PlayerStatKind,
  limit = 20
): Promise<UnitedPlayerStatRow[]> {
  try {
    const { leagueId, seasonId, cats } = await resolveSeasonMeta();
    const list = await fetchLeagueStatFile(leagueId, seasonId, kind);
    const mu = list
      .filter((r) => r.TeamId === FOTMOB_MU_TEAM_ID)
      .map((r) => {
        const id = r.ParticiantId ?? r.ParticipantId;
        return {
          name: r.ParticipantName?.trim() || '—',
          team: r.TeamName ?? FOTMOB_MU_FULL_NAME,
          value: typeof r.StatValue === 'number' ? r.StatValue : 0,
          photo: id ? fotmobPlayerImageUrl(id) : undefined,
          fotmobId: id,
        };
      })
      .filter((r) => r.name !== '—');

    if (mu.length > 0) return mu.slice(0, limit);

    // Fallback : top 3 déjà filtrés MU dans l’overview club
    return mapTopThree(cats, kind).slice(0, limit);
  } catch {
    try {
      const { cats } = await resolveSeasonMeta();
      return mapTopThree(cats, kind).slice(0, limit);
    } catch {
      return [];
    }
  }
}

export async function getUnitedTopScorers(limit = 15): Promise<UnitedPlayerStatRow[]> {
  return getUnitedPlayerStats('goals', limit);
}

export async function getUnitedTopAssisters(limit = 15): Promise<UnitedPlayerStatRow[]> {
  return getUnitedPlayerStats('assists', limit);
}

/** Warm cache via overview (évite un 2e round-trip inutile). */
export async function warmUnitedTeamStats(): Promise<void> {
  try {
    await fetch(`${FOTMOB_API_BASE}/teams?id=${FOTMOB_MU_TEAM_ID}&tab=overview`, {
      headers: FOTMOB_FETCH_HEADERS,
    });
  } catch {
    /* ignore */
  }
}
