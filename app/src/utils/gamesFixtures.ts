import { getFixtures, isFootballDataConfigured } from '../services/livescoreApi';
import { extractMatchRows, parseMatchRow } from '../services/liveMatchParsers';
import type { GamesFixture } from '../types/games.types';
import { resolveCountryDisplayCode } from './countryDisplayCode';
import { kickoffMsFromRow } from './liveMatchUtils';

function asString(v: unknown): string {
  return typeof v === 'string' ? v : v != null ? String(v) : '';
}

function rowStatus(row: Record<string, unknown>): string {
  return asString(row.status ?? row.match_status ?? row.state ?? row.time_status).toUpperCase();
}

export function rowToGamesFixture(row: Record<string, unknown>): GamesFixture | null {
  const base = parseMatchRow(row, []);
  if (!base) return null;
  const kickoffMs = kickoffMsFromRow(row);
  return {
    id: base.id,
    homeName: base.home_name,
    awayName: base.away_name,
    homeCode: resolveCountryDisplayCode({
      iso: base.home_country_code,
      teamId: base.home_team_id,
      teamName: base.home_name,
    }),
    awayCode: resolveCountryDisplayCode({
      iso: base.away_country_code,
      teamId: base.away_team_id,
      teamName: base.away_name,
    }),
    date: asString(row.date ?? row.match_date),
    time: asString(row.time ?? row.start_time ?? row.kickoff_time),
    phase: base.round,
    group: base.group,
    status: rowStatus(row),
    kickoffMs,
  };
}

function isLiveStatus(status: string): boolean {
  const s = status.toUpperCase();
  return s.includes('LIVE') || s === '1H' || s === '2H' || s === 'HT';
}

/** Calendrier complet pour pronos : pas de match en cours, tous les matchs à venir (ou date TBD). */
export async function fetchGamesFixturesForPronos(): Promise<GamesFixture[]> {
  if (!isFootballDataConfigured()) return [];

  try {
    const payload = await getFixtures();
    const now = Date.now();
    return extractMatchRows(payload)
      .map(rowToGamesFixture)
      .filter((f): f is GamesFixture => f != null)
      .filter((f) => {
        if (isLiveStatus(f.status)) return false;
        if (f.kickoffMs > 0) return f.kickoffMs > now;
        return true;
      })
      .sort((a, b) => a.kickoffMs - b.kickoffMs || a.id.localeCompare(b.id));
  } catch {
    return [];
  }
}

export async function fetchGamesFixtures(options?: { bracket?: boolean }): Promise<GamesFixture[]> {
  if (!isFootballDataConfigured()) return [];

  try {
    const payload = await getFixtures();
    const now = Date.now();
    const list = extractMatchRows(payload)
      .map(rowToGamesFixture)
      .filter((f): f is GamesFixture => f != null)
      .filter((f) => {
        if (isLiveStatus(f.status)) return false;
        return f.kickoffMs === 0 || f.kickoffMs > now;
      })
      .sort((a, b) => a.kickoffMs - b.kickoffMs);

    if (options?.bracket) {
      return list.filter((f) => {
        const p = f.phase.toLowerCase();
        return (
          p.includes('16') ||
          p.includes('1/8') ||
          p.includes('huit') ||
          p.includes('quart') ||
          p.includes('semi') ||
          p.includes('demi') ||
          (p.includes('final') || p.includes('finale'))
        );
      });
    }
    return list;
  } catch {
    return [];
  }
}

export function canSubmitProno(fixture: GamesFixture): boolean {
  const live = fixture.status.includes('LIVE') || fixture.status === '1H' || fixture.status === '2H' || fixture.status === 'HT';
  if (live) return false;
  if (fixture.kickoffMs > 0) return Date.now() < fixture.kickoffMs;
  return true;
}
