export type LiveMatchScoreRow = {
  matchId: string;
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : v != null ? String(v) : '';
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function teamCode(side: Record<string, unknown> | null, fallback: string): string {
  if (!side) return fallback;
  return (
    asString(side.country_code) ||
    asString(side.iso) ||
    asString(side.code) ||
    asString(side.id) ||
    fallback
  ).toUpperCase();
}

function rowGoals(row: Record<string, unknown>): { home: number; away: number } {
  const home = asRecord(row.home);
  const away = asRecord(row.away);
  return {
    home: asNumber(row.home_score ?? row.score_home ?? home?.score, 0),
    away: asNumber(row.away_score ?? row.score_away ?? away?.score, 0),
  };
}

export function parseLiveMatchScoreRow(row: Record<string, unknown>): LiveMatchScoreRow | null {
  const matchId = asString(row.id ?? row.match_id ?? row.fixture_id);
  if (!matchId) return null;
  const home = asRecord(row.home ?? row.team1);
  const away = asRecord(row.away ?? row.team2);
  const goals = rowGoals(row);
  return {
    matchId,
    homeCode: teamCode(home, 'HOME'),
    awayCode: teamCode(away, 'AWAY'),
    homeScore: goals.home,
    awayScore: goals.away,
  };
}
