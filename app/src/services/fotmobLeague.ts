/**
 * Classement / leaders de ligue FotMob — porté depuis FootballIntelligence `lib/fotmob/league.ts`.
 */
import { FOTMOB_PL_LEAGUE_ID, FOTMOB_PL_SEASON } from '../constants/fotmobTheRed';
import { fotmobGet, num, playerPhoto, rec, str, teamLogo } from './fotmobHttp';

export type LeagueTableRow = {
  id: string;
  name: string;
  shortName?: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  /** Rang FotMob (1-based) si fourni. */
  idx?: number;
  logo?: string;
};

export type LeagueLeader = {
  fotmobId: number;
  name: string;
  team: string;
  photo: string;
  value: number;
};

function parseGFGA(scoresStr: string | undefined): { gf: number; ga: number } {
  if (!scoresStr) return { gf: 0, ga: 0 };
  const m = scoresStr.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!m) return { gf: 0, ga: 0 };
  return { gf: Number(m[1]), ga: Number(m[2]) };
}

function findAllTableRows(payload: unknown): unknown[] {
  const out: unknown[] = [];
  const seen = new Set<string>();
  const visit = (node: unknown, depth = 0) => {
    if (depth > 12 || node == null) return;
    if (Array.isArray(node)) {
      for (const x of node) visit(x, depth + 1);
      return;
    }
    const o = rec(node);
    if (!o) return;
    const inner = rec(o.table) ?? o;
    if (Array.isArray(inner.all) && rec(inner.all[0])?.name) {
      for (const row of inner.all) {
        const r = rec(row);
        const id = str(r?.id ?? r?.teamId);
        if (!id || seen.has(id)) continue;
        seen.add(id);
        out.push(row);
      }
    }
    for (const v of Object.values(o)) visit(v, depth + 1);
  };
  visit(payload);
  return out;
}

export function parseLeagueTable(payload: unknown): LeagueTableRow[] {
  const rows: LeagueTableRow[] = [];
  for (const row of findAllTableRows(payload)) {
    const r = rec(row);
    if (!r) continue;
    const id = str(r.id);
    if (!id) continue;
    const { gf, ga } = parseGFGA(str(r.scoresStr) || undefined);
    rows.push({
      id,
      name: str(r.name),
      shortName: str(r.shortName) || undefined,
      played: num(r.played, 0) ?? 0,
      wins: num(r.wins, 0) ?? 0,
      draws: num(r.draws, 0) ?? 0,
      losses: num(r.losses, 0) ?? 0,
      gf: num(r.goalsScored, gf) ?? gf,
      ga,
      gd: num(r.goalConDiff, gf - ga) ?? gf - ga,
      pts: num(r.pts, 0) ?? 0,
      idx: num(r.idx) ?? undefined,
      logo: teamLogo(id),
    });
  }
  return rows;
}

function mapStatPlayers(block: unknown): LeagueLeader[] {
  const o = rec(block);
  if (!o) return [];
  const list = Array.isArray(o.topThree) ? o.topThree : [];
  const extra = rec(o.participant);
  const rows = extra ? [extra, ...list] : list;
  const seen = new Set<string>();
  const out: LeagueLeader[] = [];
  for (const row of rows) {
    const p = rec(row);
    if (!p) continue;
    const id = num(p.id) ?? 0;
    const name = str(p.name);
    if (!name || seen.has(`${id}-${name}`)) continue;
    seen.add(`${id}-${name}`);
    const stat = rec(p.stat);
    const value = num(p.value ?? stat?.value, 0) ?? 0;
    out.push({
      fotmobId: id,
      name,
      team: str(p.teamName),
      photo: playerPhoto(id) ?? '',
      value,
    });
  }
  return out.slice(0, 15);
}

export async function fetchPremierLeagueTable(): Promise<LeagueTableRow[]> {
  const payload = await fotmobGet(
    `/leagues?id=${FOTMOB_PL_LEAGUE_ID}&tab=table&season=${encodeURIComponent(FOTMOB_PL_SEASON)}`,
    { ttlMs: 60_000 }
  );
  return parseLeagueTable(payload);
}

export async function fetchPremierLeagueScorers(): Promise<LeagueLeader[]> {
  const payload = await fotmobGet(
    `/leagues?id=${FOTMOB_PL_LEAGUE_ID}&tab=overview&season=${encodeURIComponent(FOTMOB_PL_SEASON)}`,
    { ttlMs: 60_000 }
  );
  const root = rec(payload);
  const stats = rec(root?.stats);
  const players = Array.isArray(stats?.players) ? stats!.players : [];
  const goalsBlock = players.find(
    (p) => str(rec(p)?.name) === 'goals' || str(rec(p)?.header).toLowerCase().includes('goal')
  );
  const mapped = mapStatPlayers(goalsBlock);
  if (mapped.length) return mapped;

  const overview = rec(rec(root?.overview)?.topPlayers);
  const arr = rec(overview?.byGoals)?.players;
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 15).map((row) => {
    const p = rec(row) ?? {};
    const id = num(p.id) ?? 0;
    return {
      fotmobId: id,
      name: str(p.name),
      team: str(p.teamName),
      photo: playerPhoto(id) ?? '',
      value: num(p.stat, 0) ?? 0,
    };
  }).filter((p) => p.name);
}

export function pickTeamStanding(
  table: LeagueTableRow[],
  teamId: string | number
): (LeagueTableRow & { rank: number }) | null {
  const id = String(teamId);
  const idx = table.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  return { ...table[idx], rank: idx + 1 };
}
