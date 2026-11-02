import { fotmobTeamLogoUrl } from '../constants/fotmob';
import { mergeTeamsIntoRegistry } from './fotmobTeamRegistry';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

type FotmobSide = { id?: string | number; name?: string; shortName?: string };
type FotmobStatus = {
  utcTime?: string;
  started?: boolean;
  finished?: boolean;
  cancelled?: boolean;
  scoreStr?: string;
  reason?: { short?: string; shortKey?: string };
};
export type FotmobFixture = {
  id: string | number;
  home?: FotmobSide;
  away?: FotmobSide;
  group?: string;
  round?: string;
  roundName?: string | number;
  status?: FotmobStatus;
};

function parseScoreStr(scoreStr: string | undefined): { home: number | null; away: number | null } {
  if (!scoreStr) return { home: null, away: null };
  const m = scoreStr.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!m) return { home: null, away: null };
  return { home: Number(m[1]), away: Number(m[2]) };
}

function fotmobStatusToShort(st: FotmobStatus | undefined): string {
  if (!st) return 'NS';
  if (st.cancelled) return 'CANC';
  if (st.finished) return st.reason?.short?.toUpperCase() || 'FT';
  if (st.started) return 'LIVE';
  return 'NS';
}

function kickoffFromStatus(st: FotmobStatus | undefined): { date: string; time: string; ms: number } {
  const utc = st?.utcTime ?? '';
  if (!utc) {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    return { date, time: '12:00:00', ms: now.getTime() };
  }
  const d = new Date(utc);
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 19);
  return { date, time, ms: d.getTime() };
}

/** Format compatible avec `extractRows` / parsers Live Score existants. */
export function fotmobFixtureToLiveScoreRow(match: FotmobFixture): Record<string, unknown> {
  const home = match.home ?? {};
  const away = match.away ?? {};
  const st = match.status;
  const { home: gh, away: ga } = parseScoreStr(st?.scoreStr);
  const statusShort = fotmobStatusToShort(st);
  const { date, time } = kickoffFromStatus(st);
  const phase = match.group
    ? `Groupe ${match.group}`
    : String(match.roundName ?? match.round ?? '');

  mergeTeamsIntoRegistry([
    { id: home.id ?? '0', name: home.name ?? '' },
    { id: away.id ?? '0', name: away.name ?? '' },
  ]);

  const homeId = String(home.id ?? '');
  const awayId = String(away.id ?? '');
  const homeLogo = fotmobTeamLogoUrl(home.id);
  const awayLogo = fotmobTeamLogoUrl(away.id);

  return {
    id: String(match.id),
    match_id: String(match.id),
    home: {
      id: homeId,
      name: home.name ?? home.shortName ?? 'HOME',
      logo: homeLogo,
      image: homeLogo,
    },
    away: {
      id: awayId,
      name: away.name ?? away.shortName ?? 'AWAY',
      logo: awayLogo,
      image: awayLogo,
    },
    team1: { id: String(home.id ?? ''), name: home.name ?? 'HOME' },
    team2: { id: String(away.id ?? ''), name: away.name ?? 'AWAY' },
    status: statusShort,
    match_status: statusShort,
    date,
    time,
    ft_score: gh != null && ga != null ? `${gh}-${ga}` : undefined,
    score: gh != null && ga != null ? { home_score: gh, away_score: ga } : undefined,
    group_name: match.group,
    round: phase,
    stage_name: phase,
    _source: 'fotmob',
  };
}

export function wrapRowsAsLiveScorePayload(rows: Record<string, unknown>[]): { data: unknown[] } {
  return { data: rows };
}

export function extractFotmobFixtures(payload: unknown): FotmobFixture[] {
  const root = payload as { fixtures?: { allMatches?: FotmobFixture[] } };
  const list = root?.fixtures?.allMatches;
  return Array.isArray(list) ? list : [];
}

type FotmobTableRow = {
  id: number;
  name: string;
  played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  scoresStr?: string;
};
export type FotmobGroupTable = { leagueName?: string; table?: { all?: FotmobTableRow[] } };
export type FotmobTableSection = { data?: { tables?: FotmobGroupTable[] } };

export function extractFotmobTableTeams(payload: unknown): { id: string; name: string }[] {
  const root = payload as {
    table?: FotmobTableSection[];
    overview?: { table?: FotmobTableSection[] };
  };
  const blocks = root?.table?.[0]?.data?.tables ?? root?.overview?.table?.[0]?.data?.tables ?? [];
  const teams: { id: string; name: string }[] = [];
  for (const g of blocks) {
    for (const row of g.table?.all ?? []) {
      teams.push({ id: String(row.id), name: row.name });
    }
  }
  return teams;
}

export function fotmobStandingRowToLiveScoreRow(
  row: Record<string, unknown>,
  groupName: string
): Record<string, unknown> {
  return {
    team_id: String(row.id ?? ''),
    id: String(row.id ?? ''),
    team: { id: String(row.id ?? ''), name: row.name },
    played: row.played ?? 0,
    won: row.wins ?? 0,
    draw: row.draws ?? 0,
    lost: row.losses ?? 0,
    goals_scored: parseGoalsFor(row.scoresStr as string | undefined).for,
    goals_against: parseGoalsFor(row.scoresStr as string | undefined).against,
    group_name: groupName,
    _source: 'fotmob',
  };
}

function parseGoalsFor(scoresStr: string | undefined): { for: number; against: number } {
  if (!scoresStr) return { for: 0, against: 0 };
  const m = scoresStr.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!m) return { for: 0, against: 0 };
  return { for: Number(m[1]), against: Number(m[2]) };
}

export const FOTMOB_FETCH_HEADERS = { 'User-Agent': UA };
