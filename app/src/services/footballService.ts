/**
 * Données football GOALYA — **hybride** Live Score (compétition) + FotMob (joueurs).
 */
import { LIVESCORE_TEAM_ID_BY_ISO } from '../constants/worldCupLiveScore';
import { iso3ToIso2 } from '../utils/fotmobCountryCodes';
import { getHybridTopScorers } from './footballHybridService';
import {
  fetchMatchEvents,
  getFixturesList,
  getHead2Head,
  getLiveMatches,
  getMatchHistory,
  getWorldCupParticipants,
  getStandingsLive,
  isFootballDataConfigured,
  isLivescoreConfigured,
} from './livescoreApi';
import { getFotmobTeamIdForCountry, getIso2ForFotmobTeamId } from './fotmobTeamRegistry';
import type { LiveMatchResult, NextMatchResult } from '../types/footballHome.types';
import { getLocalLiveMatch, getLocalWorldCupNextContext } from '../utils/wc2026HomeFallback';

let dailyLimitHit = false;

export function hasFootballApiKey(): boolean {
  return isFootballDataConfigured();
}

export function isFootballApiQuotaExceeded(): boolean {
  return dailyLimitHit;
}

function markLimitFromError(e: unknown): void {
  const t = `${e instanceof Error ? e.message : String(e)}`.toLowerCase();
  if (
    t.includes('timeout') ||
    t.includes('network') ||
    t.includes('504') ||
    t.includes('econn') ||
    t.includes('aborted')
  ) {
    return;
  }
  if (t.includes('limit') || t.includes('quota') || t.includes('exceeded')) {
    dailyLimitHit = true;
  }
}

async function withApiTimeout<T>(promise: Promise<T>, ms = 12_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('API timeout')), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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

function teamFromRow(o: Record<string, unknown> | null, fallback: string): { id: string; name: string; logo?: string } {
  if (!o) return { id: fallback, name: fallback };
  const id = asString(o.id ?? o.team_id ?? o.teamId) || fallback;
  const name = asString(o.name ?? o.title) || fallback;
  const logo = asString(o.logo ?? o.image ?? o.flag) || undefined;
  return { id, name, logo };
}

function extractRows(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = root.data;
  if (Array.isArray(data)) {
    return data.map((x) => asRecord(x)).filter(Boolean) as Record<string, unknown>[];
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const v of Object.values(data as Record<string, unknown>)) {
      if (Array.isArray(v)) {
        const objs = v.map((x) => asRecord(x)).filter(Boolean) as Record<string, unknown>[];
        if (objs.length) return objs;
      }
    }
  }
  for (const key of ['fixtures', 'matches', 'match', 'games'] as const) {
    const v = root[key];
    if (Array.isArray(v)) {
      return v.map((x) => asRecord(x)).filter(Boolean) as Record<string, unknown>[];
    }
  }
  return [];
}

function matchStatus(row: Record<string, unknown>): string {
  return asString(row.status ?? row.match_status ?? row.state ?? row.time_status).toUpperCase();
}

function kickoffMs(row: Record<string, unknown>): number {
  const date = asString(row.date ?? row.match_date ?? row.fixture_date);
  const time = asString(row.time ?? row.start_time ?? row.kickoff_time ?? '12:00:00');
  if (!date) return 0;
  const iso = time.includes('T') ? time : `${date}T${time}`;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function rowGoals(row: Record<string, unknown>): { home: number | null; away: number | null } {
  const ft = asString(row.ft_score ?? row.score ?? row.result ?? row.fulltime_score);
  if (ft && /^\s*\d+\s*[-:]\s*\d+/.test(ft)) {
    const parts = ft.split(/[-:]/).map((x) => x.trim());
    if (parts.length >= 2) {
      const h = Number(parts[0]);
      const a = Number(parts[1]);
      if (Number.isFinite(h) && Number.isFinite(a)) return { home: h, away: a };
    }
  }
  const s = asRecord(row.score) ?? asRecord(row.scores) ?? row;
  const h = asNumber(s.home_score ?? s.score_home ?? s.localteam_score ?? s['1'], NaN);
  const a = asNumber(s.away_score ?? s.score_away ?? s.visitorteam_score ?? s['2'], NaN);
  return {
    home: Number.isFinite(h) ? h : null,
    away: Number.isFinite(a) ? a : null,
  };
}

function rowMinute(row: Record<string, unknown>): number | null {
  const timeObj = asRecord(row.time);
  const m = asNumber(row.minute ?? timeObj?.minute, NaN);
  return Number.isFinite(m) ? m : null;
}

export function getMappedTeamId(countryCode: string): string | undefined {
  const iso2 = iso3ToIso2(countryCode);
  return LIVESCORE_TEAM_ID_BY_ISO[iso2] ?? getFotmobTeamIdForCountry(iso2);
}

export function resolveCountryCodeForTeamId(teamId: string, excludeCode?: string): string | null {
  const tid = String(teamId);
  const exclude = excludeCode ? iso3ToIso2(excludeCode) : '';
  const fotmobIso = getIso2ForFotmobTeamId(tid);
  if (fotmobIso && fotmobIso !== exclude) return fotmobIso;

  let fallback: string | null = fotmobIso && fotmobIso === exclude ? fotmobIso : null;
  for (const [code, id] of Object.entries(LIVESCORE_TEAM_ID_BY_ISO)) {
    if (id !== tid) continue;
    if (code === excludeCode) {
      if (!fallback) fallback = code;
      continue;
    }
    return code;
  }
  return fallback;
}

export async function resolveTeamId(countryCode: string): Promise<string> {
  const code = iso3ToIso2(countryCode);
  const mapped = LIVESCORE_TEAM_ID_BY_ISO[code];
  if (mapped) return mapped;

  const fotmobId = getFotmobTeamIdForCountry(code);
  if (fotmobId) return fotmobId;

  try {
    const payload = await getWorldCupParticipants();
    const rows = extractRows(payload);
    for (const row of rows) {
      const iso =
        asString(row.iso ?? row.country_code ?? row.code ?? row.cc).toUpperCase() ||
        asString(asRecord(row.country)?.code).toUpperCase();
      const id = asString(row.id ?? row.team_id ?? row.teamId);
      if (iso === code && id) return id;
    }
  } catch (e) {
    markLimitFromError(e);
    throw e instanceof Error ? e : new Error(String(e));
  }
  throw new Error(
    `Équipe introuvable pour ${code}. Vérifie FotMob (ligue 77) ou la carte LIVESCORE_TEAM_ID_BY_ISO.`
  );
}

export type WorldCupMatch = {
  fixtureId: string;
  date: string;
  home: { id: string; name: string; logo?: string };
  away: { id: string; name: string; logo?: string };
  statusShort: string;
  elapsed: number | null;
  goals: { home: number | null; away: number | null };
  phase: string;
};

export type { LiveMatchResult, NextMatchResult } from '../types/footballHome.types';

export type LiveEventBrief = { type: string; detail: string; minute?: number };

export type TeamStats = {
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
};

export type FormChar = 'G' | 'P' | 'N';

export type Injury = { name: string; reason?: string; photo?: string };

export type TopScorer = {
  name: string;
  team: string;
  goals: number;
  photo?: string;
  fotmobId?: number;
};

export type H2HSummary = { winsTeam1: number; draws: number; winsTeam2: number };

export type H2HMatchDetail = {
  id: string;
  dateMs: number;
  phase: string;
  home: { id: string; name: string; logo?: string };
  away: { id: string; name: string; logo?: string };
  goalsHome: number;
  goalsAway: number;
};

export type H2HDetail = H2HSummary & {
  goalsTeam1: number;
  goalsTeam2: number;
  matches: H2HMatchDetail[];
};

export type FormMatchDetail = {
  result: FormChar;
  label: string;
  subtitle: string;
};

function rowToNext(row: Record<string, unknown>): NextMatchResult | null {
  const home = teamFromRow(asRecord(row.home ?? row.team1 ?? row.localteam), 'HOME');
  const away = teamFromRow(asRecord(row.away ?? row.team2 ?? row.visitorteam), 'AWAY');
  const id = asString(row.id ?? row.match_id ?? row.fixture_id);
  if (!id) return null;
  const g = rowGoals(row);
  const venue =
    asString(asRecord(row.venue)?.name) ||
    asString(row.stadium) ||
    asString(row.location) ||
    '';
  const phase = asString(row.stage_name ?? row.round ?? row.group_name ?? row.phase ?? '');
  const status = matchStatus(row);
  const elapsed = rowMinute(row);
  return {
    homeTeam: home.name,
    awayTeam: away.name,
    date: new Date(kickoffMs(row) || Date.now()).toISOString(),
    venue,
    phase,
    fixtureId: id,
    homeId: home.id,
    awayId: away.id,
    homeLogo: home.logo,
    awayLogo: away.logo,
    goalsHome: g.home,
    goalsAway: g.away,
    statusShort: status,
    elapsed,
  };
}

export function nextResultToWorldCupMatch(n: NextMatchResult): WorldCupMatch {
  return {
    fixtureId: n.fixtureId,
    date: n.date,
    home: { id: n.homeId, name: n.homeTeam, logo: n.homeLogo },
    away: { id: n.awayId, name: n.awayTeam, logo: n.awayLogo },
    statusShort: n.statusShort,
    elapsed: n.elapsed,
    goals: { home: n.goalsHome, away: n.goalsAway },
    phase: n.phase,
  };
}

export function liveResultToWorldCupMatch(l: LiveMatchResult): WorldCupMatch {
  return {
    fixtureId: l.fixtureId,
    date: l.date,
    home: l.home,
    away: l.away,
    statusShort: l.statusShort,
    elapsed: l.elapsed,
    goals: { home: l.score.home, away: l.score.away },
    phase: l.phase,
  };
}

function isLiveStatus(status: string): boolean {
  const s = status.toUpperCase();
  if (!s) return false;
  if (s === 'FT' || s === 'AET' || s === 'PEN' || s === 'CANC' || s === 'ABD') return false;
  if (s.includes('LIVE') || s === 'HT' || s === '1H' || s === '2H' || s === 'ET' || s === 'INT' || s === 'BRK') return true;
  const minute = asNumber(s, NaN);
  return Number.isFinite(minute) && minute > 0 && minute <= 120;
}

function isScheduled(status: string): boolean {
  const s = status.toUpperCase();
  return s === 'NS' || s === 'SCHED' || s === 'TBD' || s === 'POSTP' || s === '' || s === 'UPCOMING' || s === 'NOTSTARTED';
}

export async function getWorldCupNextContext(countryCode: string): Promise<{ userTeamId: string; next: NextMatchResult | null }> {
  const code = countryCode.trim();
  if (!code) return getLocalWorldCupNextContext('FR');

  if (!isLivescoreConfigured()) {
    return getLocalWorldCupNextContext(code);
  }

  try {
    const userTeamId = await resolveTeamId(code);
    const payload = await withApiTimeout(getFixturesList({ team: userTeamId }));
    const rows = extractRows(payload);
    const now = Date.now();
    const upcoming = rows
      .filter((r) => {
        const st = matchStatus(r);
        const ko = kickoffMs(r);
        return isScheduled(st) && ko > now;
      })
      .sort((a, b) => kickoffMs(a) - kickoffMs(b));
    const first = upcoming[0];
    if (first) return { userTeamId, next: rowToNext(first) };
    const local = getLocalWorldCupNextContext(code);
    return { userTeamId, next: local.next };
  } catch (e) {
    markLimitFromError(e);
    return getLocalWorldCupNextContext(code);
  }
}

export async function getNextMatch(countryCode: string): Promise<NextMatchResult | null> {
  const { next } = await getWorldCupNextContext(countryCode);
  return next;
}

export async function getLiveMatch(countryCode: string): Promise<LiveMatchResult | null> {
  const code = countryCode.trim();
  if (!code) return null;

  const localLive = getLocalLiveMatch(code);
  if (!isLivescoreConfigured()) return localLive;

  let teamId: string;
  try {
    teamId = await resolveTeamId(code);
  } catch (e) {
    markLimitFromError(e);
    return localLive;
  }

  let liveRow: Record<string, unknown> | undefined;
  try {
    const payload = await withApiTimeout(getLiveMatches());
    const rows = extractRows(payload);
    liveRow = rows.find((r) => {
      const home = teamFromRow(asRecord(r.home ?? r.team1 ?? r.localteam), '');
      const away = teamFromRow(asRecord(r.away ?? r.team2 ?? r.visitorteam), '');
      const st = matchStatus(r);
      if (!isLiveStatus(st)) return false;
      return String(home.id) === String(teamId) || String(away.id) === String(teamId);
    });
  } catch (e) {
    markLimitFromError(e);
    return localLive;
  }

  if (!liveRow) return localLive;

  const home = teamFromRow(asRecord(liveRow.home ?? liveRow.team1 ?? liveRow.localteam), 'HOME');
  const away = teamFromRow(asRecord(liveRow.away ?? liveRow.team2 ?? liveRow.visitorteam), 'AWAY');
  const id = asString(liveRow.id ?? liveRow.match_id) || 'live';
  const g = rowGoals(liveRow);
  const gh = g.home ?? 0;
  const ga = g.away ?? 0;
  const minute = rowMinute(liveRow);
  let recentEvents: LiveEventBrief[] = [];
  try {
    const evs = await fetchMatchEvents(id);
    recentEvents = (evs ?? []).slice(-8).map((e) => ({
      type: e.type,
      detail: e.playerName ?? e.teamCode ?? '',
      minute: e.minute,
    }));
  } catch {
    recentEvents = [];
  }

  return {
    score: { home: gh, away: ga },
    minute,
    recentEvents,
    fixtureId: id,
    date: new Date(kickoffMs(liveRow) || Date.now()).toISOString(),
    home,
    away,
    phase: asString(liveRow.stage_name ?? liveRow.round ?? liveRow.group_name ?? ''),
    statusShort: matchStatus(liveRow),
    elapsed: minute,
  };
}

export async function getWorldCupMatches(countryCode: string): Promise<WorldCupMatch[]> {
  const teamId = await resolveTeamId(countryCode);
  const payload = await getFixturesList({ team: teamId });
  return extractRows(payload)
    .map((r) => rowToNext(r))
    .filter((x): x is NextMatchResult => x != null)
    .map(nextResultToWorldCupMatch);
}

function mapFormLetter(result: 'W' | 'D' | 'L'): FormChar {
  if (result === 'W') return 'G';
  if (result === 'D') return 'N';
  return 'P';
}

function resultForTeam(row: Record<string, unknown>, teamRef: string): 'W' | 'D' | 'L' | null {
  const home = teamFromRow(asRecord(row.home ?? row.team1 ?? row.localteam), '');
  const away = teamFromRow(asRecord(row.away ?? row.team2 ?? row.visitorteam), '');
  const g = rowGoals(row);
  if (g.home == null || g.away == null) return null;
  if (g.home === g.away) return 'D';

  const refIso = iso3ToIso2(teamRef);
  const homeIso = getIso2ForFotmobTeamId(home.id) ?? iso3ToIso2(home.id);
  const awayIso = getIso2ForFotmobTeamId(away.id) ?? iso3ToIso2(away.id);
  const isHome =
    String(home.id) === String(teamRef) || (refIso.length >= 2 && homeIso === refIso);
  if (isHome) return g.home > g.away ? 'W' : 'L';
  const isAway =
    String(away.id) === String(teamRef) || (refIso.length >= 2 && awayIso === refIso);
  if (isAway) return g.away > g.home ? 'W' : 'L';
  return null;
}

export async function getTeamForm(countryCode: string): Promise<FormChar[]> {
  const teamId = await resolveTeamId(countryCode);
  const payload = await getMatchHistory({ team: teamId });
  const rows = extractRows(payload);
  const finished = rows.filter((r) => {
    const st = matchStatus(r);
    return st === 'FT' || st === 'AET' || st === 'PEN';
  });
  const out: FormChar[] = [];
  for (const row of finished.slice(-10)) {
    const res = resultForTeam(row, teamId);
    if (res) out.push(mapFormLetter(res));
  }
  return out.slice(-5);
}

export async function getTeamStats(countryCode: string): Promise<TeamStats> {
  const teamId = await resolveTeamId(countryCode);
  try {
    const payload = await getStandingsLive({});
    const rows = extractRows(payload);
    for (const row of rows) {
      const tid = asString(row.team_id ?? row.teamid ?? row.id ?? asRecord(row.team)?.id);
      if (String(tid) !== String(teamId)) continue;
      const played = asNumber(row.played ?? row.mp ?? row.matches, 0);
      const w = asNumber(row.won ?? row.win ?? row.w, 0);
      const d = asNumber(row.draw ?? row.d ?? row.drawn, 0);
      const l = asNumber(row.lost ?? row.loss ?? row.l, 0);
      const gf = asNumber(row.goals_scored ?? row.goalsfor ?? row.gf ?? row.goals_for, 0);
      const ga = asNumber(row.goals_against ?? row.goalsagainst ?? row.ga ?? row.goals_against, 0);
      if (played || w || d || l) {
        return { wins: w, draws: d, losses: l, goalsFor: gf, goalsAgainst: ga };
      }
    }
  } catch {
    /* standings shape varies — fallback below */
  }
  return { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
}

export async function getInjuries(_countryCode: string): Promise<Injury[]> {
  void _countryCode;
  return [];
}

export async function getTopScorers(): Promise<TopScorer[]> {
  const rows = await getHybridTopScorers(15);
  return rows.map((r) => ({
    name: r.name,
    team: r.team,
    goals: r.goals,
    photo: r.photo,
    fotmobId: r.fotmobId,
  }));
}

const FINISHED = new Set(['FT', 'AET', 'PEN']);

function rowPhaseLabel(row: Record<string, unknown>): string {
  const parts = [
    asString(row.season ?? row.season_name),
    asString(row.stage_name ?? row.round ?? row.group_name ?? row.phase),
  ].filter(Boolean);
  return parts.join(' - ') || 'Match';
}

function formatMatchDateFr(ms: number): string {
  if (!ms) return '';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ms));
}

function rowToH2HMatch(row: Record<string, unknown>): H2HMatchDetail | null {
  const st = matchStatus(row);
  if (!FINISHED.has(st)) return null;
  const home = teamFromRow(asRecord(row.home ?? row.team1 ?? row.localteam), 'HOME');
  const away = teamFromRow(asRecord(row.away ?? row.team2 ?? row.visitorteam), 'AWAY');
  const g = rowGoals(row);
  if (g.home == null || g.away == null) return null;
  const id = asString(row.id ?? row.match_id ?? row.fixture_id) || `${home.id}-${away.id}-${kickoffMs(row)}`;
  return {
    id,
    dateMs: kickoffMs(row) || Date.now(),
    phase: rowPhaseLabel(row),
    home,
    away,
    goalsHome: g.home,
    goalsAway: g.away,
  };
}

function rowToFormMatch(row: Record<string, unknown>, teamId: string): FormMatchDetail | null {
  const res = resultForTeam(row, teamId);
  if (!res) return null;
  const home = teamFromRow(asRecord(row.home ?? row.team1 ?? row.localteam), 'HOME');
  const away = teamFromRow(asRecord(row.away ?? row.team2 ?? row.visitorteam), 'AWAY');
  const g = rowGoals(row);
  if (g.home == null || g.away == null) return null;
  const ms = kickoffMs(row);
  const comp = rowPhaseLabel(row);
  const date = formatMatchDateFr(ms);
  return {
    result: mapFormLetter(res),
    label: `${home.name} ${g.home}-${g.away} ${away.name}`,
    subtitle: comp && date ? `${date} • ${comp}` : date || comp,
  };
}

export async function getH2H(code1: string, code2: string): Promise<H2HSummary> {
  const detail = await getH2HDetail(code1, code2);
  return { winsTeam1: detail.winsTeam1, draws: detail.draws, winsTeam2: detail.winsTeam2 };
}

export async function getH2HDetail(code1: string, code2: string): Promise<H2HDetail> {
  const iso1 = iso3ToIso2(code1);
  const iso2 = iso3ToIso2(code2);
  const fotmob1 = getFotmobTeamIdForCountry(iso1);
  const fotmob2 = getFotmobTeamIdForCountry(iso2);

  let rows: Record<string, unknown>[] = [];
  if (fotmob1 && fotmob2) {
    try {
      const { getFotmobHead2HeadPayload } = await import('./fotmobFootballApi');
      const payload = await getFotmobHead2HeadPayload(fotmob1, fotmob2);
      rows = extractRows(payload);
    } catch {
      /* FotMob indisponible */
    }
  }

  if (rows.length === 0) {
    try {
      const id1 = await resolveTeamId(code1);
      const id2 = await resolveTeamId(code2);
      const payload = await getHead2Head(id1, id2);
      rows = extractRows(payload);
    } catch {
      rows = [];
    }
  }

  const refTeam1Id = fotmob1 ?? (await resolveTeamId(code1).catch(() => iso1));
  let winsTeam1 = 0;
  let draws = 0;
  let winsTeam2 = 0;
  let goalsTeam1 = 0;
  let goalsTeam2 = 0;
  const matches: H2HMatchDetail[] = [];

  for (const row of rows) {
    const m = rowToH2HMatch(row);
    if (!m) continue;
    matches.push(m);
    const r = resultForTeam(row, refTeam1Id);
    if (r === 'W') winsTeam1++;
    else if (r === 'D') draws++;
    else if (r === 'L') winsTeam2++;

    const homeIso = getIso2ForFotmobTeamId(m.home.id) ?? iso3ToIso2(m.home.id);
    const isRefHome =
      String(m.home.id) === String(refTeam1Id) ||
      (iso1.length >= 2 && homeIso === iso1);
    if (isRefHome) {
      goalsTeam1 += m.goalsHome;
      goalsTeam2 += m.goalsAway;
    } else {
      goalsTeam1 += m.goalsAway;
      goalsTeam2 += m.goalsHome;
    }
  }

  matches.sort((a, b) => b.dateMs - a.dateMs);
  return { winsTeam1, draws, winsTeam2, goalsTeam1, goalsTeam2, matches };
}

export async function getTeamFormDetail(countryCode: string): Promise<FormMatchDetail[]> {
  const teamId = await resolveTeamId(countryCode);
  const payload = await getMatchHistory({ team: teamId });
  const rows = extractRows(payload);
  const finished = rows.filter((r) => FINISHED.has(matchStatus(r)));
  const out: FormMatchDetail[] = [];
  for (const row of finished) {
    const item = rowToFormMatch(row, teamId);
    if (item) out.push(item);
  }
  return out.slice(-5).reverse();
}

export async function testApiConnection(): Promise<void> {
  const { initFootballDataSources } = await import('./footballDataProvider');
  await initFootballDataSources();
}
