import { WC2026_MATCHES, getMatchScheduleStatus, type Wc2026Match } from '../data/wc2026Matches';
import { LIVESCORE_TEAM_ID_BY_ISO } from '../constants/worldCupLiveScore';
import type { LiveMatchResult, NextMatchResult } from '../types/footballHome.types';
import { getFotmobTeamIdForCountry } from '../services/fotmobTeamRegistry';
import { iso3ToIso2 } from './fotmobCountryCodes';

function codesEqual(a: string, b: string): boolean {
  const na = iso3ToIso2(a).toUpperCase();
  const nb = iso3ToIso2(b).toUpperCase();
  if (na === nb) return true;
  if (na.startsWith('GB') && nb.startsWith('GB')) return true;
  return na.replace(/-/g, '') === nb.replace(/-/g, '');
}

function teamInMatch(m: Wc2026Match, countryCode: string): boolean {
  return codesEqual(m.home.code, countryCode) || codesEqual(m.away.code, countryCode);
}

function localTeamId(countryCode: string): string {
  const iso2 = iso3ToIso2(countryCode);
  return LIVESCORE_TEAM_ID_BY_ISO[iso2] ?? getFotmobTeamIdForCountry(iso2) ?? iso2;
}

function wcToNext(m: Wc2026Match): NextMatchResult {
  const j = m.journee === 'j1' ? '1' : m.journee === 'j2' ? '2' : '3';
  return {
    homeTeam: m.home.name,
    awayTeam: m.away.name,
    date: new Date(m.kickoffMs).toISOString(),
    venue: '',
    phase: `${m.group} · Journée ${j}`,
    fixtureId: m.id,
    homeId: m.home.code,
    awayId: m.away.code,
    goalsHome: null,
    goalsAway: null,
    statusShort: 'NS',
    elapsed: null,
  };
}

function wcToLive(m: Wc2026Match): LiveMatchResult {
  return {
    score: { home: 0, away: 0 },
    minute: null,
    recentEvents: [],
    fixtureId: m.id,
    date: new Date(m.kickoffMs).toISOString(),
    home: { id: m.home.code, name: m.home.name },
    away: { id: m.away.code, name: m.away.name },
    phase: m.group,
    statusShort: 'LIVE',
    elapsed: null,
  };
}

function upcomingForCountry(countryCode: string): Wc2026Match[] {
  const now = Date.now();
  return WC2026_MATCHES.filter(
    (m) =>
      teamInMatch(m, countryCode) &&
      getMatchScheduleStatus(m) === 'scheduled' &&
      m.kickoffMs > now
  ).sort((a, b) => a.kickoffMs - b.kickoffMs);
}

function globalUpcoming(): Wc2026Match | undefined {
  const now = Date.now();
  return WC2026_MATCHES.filter(
    (m) => getMatchScheduleStatus(m) === 'scheduled' && m.kickoffMs > now
  ).sort((a, b) => a.kickoffMs - b.kickoffMs)[0];
}

/** Prochain match CDM depuis le calendrier FIFA intégré (secours si API indisponible). */
export function getLocalWorldCupNextContext(countryCode: string): {
  userTeamId: string;
  next: NextMatchResult | null;
} {
  const code = countryCode.trim();
  const userTeamId = code ? localTeamId(code) : 'FR';
  const list = code ? upcomingForCountry(code) : [];
  const pick =
    list[0] ??
    globalUpcoming() ??
    (code
      ? WC2026_MATCHES.filter((m) => teamInMatch(m, code)).sort((a, b) => b.kickoffMs - a.kickoffMs)[0]
      : WC2026_MATCHES.slice().sort((a, b) => b.kickoffMs - a.kickoffMs)[0]);
  return { userTeamId, next: pick ? wcToNext(pick) : null };
}

export function getLocalLiveMatch(countryCode: string): LiveMatchResult | null {
  const code = countryCode.trim();
  if (!code) return null;
  const live = WC2026_MATCHES.find(
    (m) => teamInMatch(m, code) && getMatchScheduleStatus(m) === 'live'
  );
  return live ? wcToLive(live) : null;
}
