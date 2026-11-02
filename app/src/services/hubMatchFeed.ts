/**
 * Match affiché sur le Hub — même logique hybride que Live (Live Score → FotMob → calendrier FIFA).
 */
import { flagEmoji } from '../constants/mapHub';
import { WC2026_MATCHES, getMatchScheduleStatus, type Wc2026Match } from '../data/wc2026Matches';
import type { LiveMatch } from '../types/live.types';
import { isFotmobFootballReachable } from './fotmobFootballApi';
import { fetchFotmobLiveMatches, fetchFotmobUpcomingMatches } from './liveFotmobService';
import { parseMatchList } from './liveMatchParsers';
import {
  fetchCurrentLiveMatch,
  fetchNextFixture,
  getLiveMatches,
  type ParsedLiveScore,
  type ParsedUpcomingMatch,
} from './livescoreApi';

function parseMinute(raw: string | number | undefined): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const n = parseInt(String(raw ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function liveMatchToParsedLive(m: LiveMatch): ParsedLiveScore {
  return {
    matchId: m.id,
    isLive: true,
    minute: parseMinute(m.minute),
    home: {
      name: m.home_name,
      flag: flagEmoji(m.home_country_code),
      score: m.home_score,
      code: m.home_country_code,
    },
    away: {
      name: m.away_name,
      flag: flagEmoji(m.away_country_code),
      score: m.away_score,
      code: m.away_country_code,
    },
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    xg: { home: 0, away: 0 },
  };
}

function liveMatchToUpcoming(m: LiveMatch): ParsedUpcomingMatch {
  const kickoffMs = m.kickoff_at ?? 0;
  return {
    matchId: m.id,
    home: {
      name: m.home_name,
      flag: flagEmoji(m.home_country_code),
      score: 0,
      code: m.home_country_code,
    },
    away: {
      name: m.away_name,
      flag: flagEmoji(m.away_country_code),
      score: 0,
      code: m.away_country_code,
    },
    kickoff: kickoffMs > 0 ? new Date(kickoffMs) : new Date(),
  };
}

function wcToUpcoming(m: Wc2026Match): ParsedUpcomingMatch {
  return {
    matchId: m.id,
    home: { name: m.home.name, flag: m.home.flag, score: 0, code: m.home.code },
    away: { name: m.away.name, flag: m.away.flag, score: 0, code: m.away.code },
    kickoff: new Date(m.kickoffMs),
  };
}

function codesEqual(a: string, b: string): boolean {
  const na = a.toUpperCase().replace(/-/g, '');
  const nb = b.toUpperCase().replace(/-/g, '');
  return na === nb || (na.startsWith('GB') && nb.startsWith('GB'));
}

function pickLocalUpcoming(userCountry?: string): ParsedUpcomingMatch | null {
  const now = Date.now();
  const scheduled = WC2026_MATCHES.filter(
    (m) => getMatchScheduleStatus(m) === 'scheduled' && m.kickoffMs > now
  ).sort((a, b) => a.kickoffMs - b.kickoffMs);

  const code = userCountry?.trim();
  if (code) {
    const forNation = scheduled.find(
      (m) => codesEqual(m.home.code, code) || codesEqual(m.away.code, code)
    );
    if (forNation) return wcToUpcoming(forNation);
  }

  const next = scheduled[0];
  return next ? wcToUpcoming(next) : null;
}

async function fetchFotmobLiveParsed(): Promise<ParsedLiveScore | null> {
  if (!isFotmobFootballReachable()) return null;
  const rows = await fetchFotmobLiveMatches().catch(() => [] as LiveMatch[]);
  return rows[0] ? liveMatchToParsedLive(rows[0]) : null;
}

async function fetchFotmobUpcomingParsed(): Promise<ParsedUpcomingMatch | null> {
  if (!isFotmobFootballReachable()) return null;
  const rows = await fetchFotmobUpcomingMatches().catch(() => [] as LiveMatch[]);
  return rows[0] ? liveMatchToUpcoming(rows[0]) : null;
}

async function fetchLiveScoreLiveParsed(): Promise<ParsedLiveScore | null> {
  const direct = await fetchCurrentLiveMatch().catch(() => null);
  if (direct) return direct;
  try {
    const payload = await getLiveMatches();
    const list = parseMatchList(payload);
    return list[0] ? liveMatchToParsedLive(list[0]) : null;
  } catch {
    return null;
  }
}

async function resolveUpcoming(userCountry?: string): Promise<ParsedUpcomingMatch | null> {
  const fromApi = await fetchNextFixture().catch(() => null);
  if (fromApi) return fromApi;
  const fotmob = await fetchFotmobUpcomingParsed();
  if (fotmob) return fotmob;
  return pickLocalUpcoming(userCountry);
}

/** Prochain ou live match pour le Hub (chat, globe, barre score). */
export async function fetchHubMatchFeed(userCountry?: string): Promise<{
  live: ParsedLiveScore | null;
  upcoming: ParsedUpcomingMatch | null;
}> {
  const live =
    (await fetchLiveScoreLiveParsed()) ?? (await fetchFotmobLiveParsed());

  if (live) {
    const upcoming = await resolveUpcoming(userCountry);
    return { live, upcoming };
  }

  const upcoming = await resolveUpcoming(userCountry);
  return { live: null, upcoming };
}
