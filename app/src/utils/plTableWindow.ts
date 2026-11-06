import { FOTMOB_MU_TEAM_ID } from '../constants/fotmobTheRed';
import type { LeagueTableRow } from '../services/fotmobLeague';

export type PlTableWindowRow = LeagueTableRow & { rank: number; isUnited: boolean };

/** Fenêtre de classement centrée sur United (±radius lignes). */
export function plTableWindowAroundUnited(
  table: LeagueTableRow[],
  radius = 2
): { rows: PlTableWindowRow[]; unitedRank: number | null } {
  if (!table.length) return { rows: [], unitedRank: null };
  const mu = String(FOTMOB_MU_TEAM_ID);
  let idx = table.findIndex((r) => r.id === mu);
  if (idx < 0) idx = Math.min(16, table.length - 1);
  const start = Math.max(0, idx - radius);
  const end = Math.min(table.length, idx + radius + 1);
  const rows = table.slice(start, end).map((r, i) => ({
    ...r,
    rank: start + i + 1,
    isUnited: r.id === mu,
  }));
  return { rows, unitedRank: idx >= 0 ? idx + 1 : null };
}

export function plDisplayName(row: LeagueTableRow): string {
  const short = row.shortName?.trim();
  if (short) {
    if (short === 'Man United') return 'Man Utd';
    if (short === 'Nottm Forest' || short.toLowerCase().includes('nottingham')) return 'Nottm Forest';
    return short;
  }
  const n = row.name;
  if (n === 'Manchester United') return 'Man Utd';
  if (n.startsWith('Nottingham')) return 'Nottm Forest';
  if (n.startsWith('Crystal Palace')) return 'Crystal Palace';
  return n;
}
