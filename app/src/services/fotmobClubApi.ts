import AsyncStorage from '@react-native-async-storage/async-storage';
import { FOTMOB_API_BASE } from '../constants/fotmobWorldCup';
import { fotmobPlayerImageUrl, fotmobTeamLogoUrl } from '../constants/fotmob';
import {
  FOTMOB_MU_TEAM_ID,
  FOTMOB_MU_WOMEN_TEAM_ID,
  FOTMOB_PL_LEAGUE_ID,
  FOTMOB_PL_SEASON,
  FOTMOB_THE_RED_CACHE_KEY,
  FOTMOB_THE_RED_CACHE_TTL_MS,
  FOTMOB_THE_RED_FIXTURES_CACHE_KEY,
  FOTMOB_THE_RED_WOMEN_CACHE_KEY,
} from '../constants/fotmobTheRed';
import type {
  FormChar,
  FormMatchDetail,
  H2HDetail,
  H2HMatchDetail,
  H2HSummary,
  Injury,
  TopScorer,
  WorldCupMatch,
} from './footballService';
import type { LiveMatchResult } from '../types/footballHome.types';
import { FOTMOB_FETCH_HEADERS } from './fotmobFootballMappers';

type ClubSide = { id?: number; name?: string; score?: number };
type ClubStatus = {
  utcTime?: string;
  started?: boolean;
  finished?: boolean;
  cancelled?: boolean;
  scoreStr?: string;
  reason?: { short?: string };
};
type ClubTournament = { name?: string; stage?: string; leagueId?: number };
type ClubFixture = {
  id: number;
  home?: ClubSide;
  away?: ClubSide;
  opponent?: ClubSide;
  notStarted?: boolean;
  tournament?: ClubTournament;
  status?: ClubStatus;
  result?: number;
};

type TeamFormRow = {
  resultString?: string;
  tournamentName?: string;
  score?: string;
  home?: { name?: string };
  away?: { name?: string };
};

type CachedClub = {
  savedAt: number;
  payload?: unknown;
};

let memoryPayload: unknown | null = null;
let memoryWomenPayload: unknown | null = null;
let memoryFixturesPayload: unknown | null = null;

async function loadCache(key = FOTMOB_THE_RED_CACHE_KEY): Promise<CachedClub | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedClub;
    if (Date.now() - parsed.savedAt > FOTMOB_THE_RED_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function saveCache(payload: unknown, key = FOTMOB_THE_RED_CACHE_KEY): Promise<void> {
  const next: CachedClub = { savedAt: Date.now(), payload };
  await AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
}

export async function fetchManchesterUnitedTeam(force = false): Promise<unknown> {
  if (!force && memoryPayload) return memoryPayload;
  if (!force) {
    const cached = await loadCache();
    if (cached?.payload) {
      memoryPayload = cached.payload;
      return cached.payload;
    }
  }

  const url = `${FOTMOB_API_BASE}/teams?id=${FOTMOB_MU_TEAM_ID}&tab=overview`;
  const res = await fetch(url, { headers: FOTMOB_FETCH_HEADERS });
  if (!res.ok) throw new Error(`FotMob MU (${res.status})`);
  const json = await res.json();
  memoryPayload = json;
  await saveCache(json);
  return json;
}

/** Calendrier complet (toutes compétitions) — tab fixtures FotMob. */
export async function fetchManchesterUnitedFixtures(force = false): Promise<unknown> {
  if (!force && memoryFixturesPayload) return memoryFixturesPayload;
  if (!force) {
    const cached = await loadCache(FOTMOB_THE_RED_FIXTURES_CACHE_KEY);
    if (cached?.payload) {
      memoryFixturesPayload = cached.payload;
      return cached.payload;
    }
  }

  const url = `${FOTMOB_API_BASE}/teams?id=${FOTMOB_MU_TEAM_ID}&tab=fixtures`;
  const res = await fetch(url, { headers: FOTMOB_FETCH_HEADERS });
  if (!res.ok) throw new Error(`FotMob MU fixtures (${res.status})`);
  const json = await res.json();
  memoryFixturesPayload = json;
  await saveCache(json, FOTMOB_THE_RED_FIXTURES_CACHE_KEY);
  return json;
}

export async function fetchManchesterUnitedWomenTeam(force = false): Promise<unknown> {
  if (!force && memoryWomenPayload) return memoryWomenPayload;
  if (!force) {
    const cached = await loadCache(FOTMOB_THE_RED_WOMEN_CACHE_KEY);
    if (cached?.payload) {
      memoryWomenPayload = cached.payload;
      return cached.payload;
    }
  }

  const url = `${FOTMOB_API_BASE}/teams?id=${FOTMOB_MU_WOMEN_TEAM_ID}&tab=overview`;
  const res = await fetch(url, { headers: FOTMOB_FETCH_HEADERS });
  if (!res.ok) throw new Error(`FotMob MU Women (${res.status})`);
  const json = await res.json();
  memoryWomenPayload = json;
  await saveCache(json, FOTMOB_THE_RED_WOMEN_CACHE_KEY);
  return json;
}

function parseScore(st: ClubStatus | undefined, home?: ClubSide, away?: ClubSide): {
  home: number | null;
  away: number | null;
} {
  if (typeof home?.score === 'number' && typeof away?.score === 'number') {
    return { home: home.score, away: away.score };
  }
  const m = st?.scoreStr?.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!m) return { home: null, away: null };
  return { home: Number(m[1]), away: Number(m[2]) };
}

function statusShort(st: ClubStatus | undefined, notStarted?: boolean): string {
  if (!st) return notStarted ? 'NS' : 'NS';
  if (st.cancelled) return 'CANC';
  if (st.finished) return st.reason?.short?.toUpperCase() || 'FT';
  if (st.started) return 'LIVE';
  return 'NS';
}

function fixtureToMatch(fx: ClubFixture): WorldCupMatch {
  const homeId = String(fx.home?.id ?? '');
  const awayId = String(fx.away?.id ?? '');
  const goals = parseScore(fx.status, fx.home, fx.away);
  const phase =
    fx.tournament?.stage?.trim() ||
    fx.tournament?.name?.trim() ||
    'Premier League';
  const utc = fx.status?.utcTime ?? new Date().toISOString();
  return {
    fixtureId: String(fx.id),
    date: new Date(utc).toISOString(),
    home: {
      id: homeId,
      name: fx.home?.name ?? 'Home',
      logo: fotmobTeamLogoUrl(fx.home?.id),
    },
    away: {
      id: awayId,
      name: fx.away?.name ?? 'Away',
      logo: fotmobTeamLogoUrl(fx.away?.id),
    },
    statusShort: statusShort(fx.status, fx.notStarted),
    elapsed: null,
    goals: { home: goals.home, away: goals.away },
    phase,
  };
}

function asClubRoot(payload: unknown) {
  return payload as {
    overview?: {
      nextMatch?: ClubFixture;
      lastMatch?: ClubFixture;
      overviewFixtures?: ClubFixture[];
      teamForm?: TeamFormRow[];
      hasOngoingMatch?: boolean;
    };
    fixtures?: {
      allFixtures?: { fixtures?: ClubFixture[]; nextMatch?: ClubFixture };
      hasOngoingMatch?: boolean;
    };
  };
}

export function pickUnitedNextMatch(payload: unknown): WorldCupMatch | null {
  const root = asClubRoot(payload);
  const next =
    root.overview?.nextMatch ??
    root.fixtures?.allFixtures?.nextMatch ??
    (root.overview?.overviewFixtures ?? []).find((f) => f.notStarted);
  return next ? fixtureToMatch(next) : null;
}

export function pickUnitedLastFinished(payload: unknown): WorldCupMatch | null {
  const root = asClubRoot(payload);
  const list = [
    ...(root.overview?.overviewFixtures ?? []),
    ...(root.fixtures?.allFixtures?.fixtures ?? []),
  ];
  const finished = list
    .filter((f) => f.status?.finished && !f.status?.cancelled)
    .sort((a, b) => {
      const ta = new Date(a.status?.utcTime ?? 0).getTime();
      const tb = new Date(b.status?.utcTime ?? 0).getTime();
      return tb - ta;
    });
  if (finished[0]) return fixtureToMatch(finished[0]);
  const last = (root.overview as { lastMatch?: ClubFixture } | undefined)?.lastMatch;
  return last?.status?.finished ? fixtureToMatch(last) : null;
}

export type UnitedProgrammeMatch = WorldCupMatch & {
  /** 1 = win United, 0 = draw, -1 = loss, null = pas encore joué */
  resultVsUnited: 1 | 0 | -1 | null;
  competition: string;
  kickoffMs: number;
};

export function pickUnitedSeasonFixtures(payload: unknown): UnitedProgrammeMatch[] {
  const root = asClubRoot(payload);
  const list = [
    ...(root.fixtures?.allFixtures?.fixtures ?? []),
    ...(root.overview?.overviewFixtures ?? []),
  ];
  const seen = new Set<number>();
  const mu = String(FOTMOB_MU_TEAM_ID);
  const out: UnitedProgrammeMatch[] = [];

  for (const fx of list) {
    if (!fx?.id || seen.has(fx.id)) continue;
    seen.add(fx.id);
    const base = fixtureToMatch(fx);
    const kickoffMs = new Date(base.date).getTime();
    let resultVsUnited: 1 | 0 | -1 | null = null;
    if (fx.status?.finished && !fx.status?.cancelled) {
      if (typeof fx.result === 'number' && (fx.result === -1 || fx.result === 0 || fx.result === 1)) {
        // FotMob result is from United's perspective when opponent is set
        resultVsUnited = fx.result as 1 | 0 | -1;
      } else if (base.goals.home != null && base.goals.away != null) {
        const unitedHome = base.home.id === mu;
        const ug = unitedHome ? base.goals.home : base.goals.away;
        const og = unitedHome ? base.goals.away : base.goals.home;
        resultVsUnited = ug > og ? 1 : ug < og ? -1 : 0;
      }
    }
    out.push({
      ...base,
      competition: fx.tournament?.name?.trim() || base.phase,
      kickoffMs,
      resultVsUnited,
    });
  }

  return out.sort((a, b) => a.kickoffMs - b.kickoffMs);
}

export function pickUnitedUpcoming(payload: unknown, max = 6): WorldCupMatch[] {
  const root = asClubRoot(payload);
  const list = [
    ...(root.overview?.overviewFixtures ?? []),
    ...(root.fixtures?.allFixtures?.fixtures ?? []),
  ];
  const seen = new Set<number>();
  const upcoming = list
    .filter((f) => {
      if (!f?.id || seen.has(f.id)) return false;
      seen.add(f.id);
      return f.notStarted || (!f.status?.started && !f.status?.finished && !f.status?.cancelled);
    })
    .sort((a, b) => {
      const ta = new Date(a.status?.utcTime ?? 0).getTime();
      const tb = new Date(b.status?.utcTime ?? 0).getTime();
      return ta - tb;
    })
    .slice(0, max)
    .map(fixtureToMatch);
  if (upcoming.length) return upcoming;
  const next = pickUnitedNextMatch(payload);
  return next ? [next] : [];
}

export function pickUnitedLiveMatch(payload: unknown): WorldCupMatch | null {
  const root = asClubRoot(payload);
  const list = [
    ...(root.overview?.overviewFixtures ?? []),
    ...(root.fixtures?.allFixtures?.fixtures ?? []),
  ];
  const live = list.find(
    (f) => f.status?.started && !f.status?.finished && !f.status?.cancelled
  );
  if (live) return fixtureToMatch(live);
  if (root.overview?.hasOngoingMatch || root.fixtures?.hasOngoingMatch) {
    const next = root.overview?.nextMatch;
    if (next?.status?.started && !next.status?.finished) return fixtureToMatch(next);
  }
  return null;
}

export function unitedLiveDetail(match: WorldCupMatch): LiveMatchResult {
  return {
    score: {
      home: match.goals.home ?? 0,
      away: match.goals.away ?? 0,
    },
    minute: match.elapsed,
    recentEvents: [],
    fixtureId: match.fixtureId,
    date: match.date,
    home: match.home,
    away: match.away,
    phase: match.phase,
    statusShort: match.statusShort,
    elapsed: match.elapsed,
  };
}

function mapFormChar(s: string | undefined): FormChar | null {
  const c = (s ?? '').toUpperCase();
  if (c === 'W' || c === 'G') return 'G';
  if (c === 'L' || c === 'P') return 'P';
  if (c === 'D' || c === 'N') return 'N';
  return null;
}

/** Forme récente (du plus récent au plus ancien). */
export function pickUnitedForm(payload: unknown): FormChar[] {
  const rows = asClubRoot(payload).overview?.teamForm ?? [];
  return rows
    .map((r) => mapFormChar(r.resultString))
    .filter((x): x is FormChar => x != null)
    .reverse()
    .slice(0, 5);
}

export function pickUnitedFormDetail(payload: unknown): FormMatchDetail[] {
  const rows = asClubRoot(payload).overview?.teamForm ?? [];
  return [...rows]
    .reverse()
    .slice(0, 8)
    .map((r) => {
      const result = mapFormChar(r.resultString) ?? 'N';
      const home = r.home?.name ?? 'Home';
      const away = r.away?.name ?? 'Away';
      return {
        result,
        label: `${home} ${r.score ?? ''} ${away}`.replace(/\s+/g, ' ').trim(),
        subtitle: r.tournamentName ?? 'Match',
      };
    });
}

export function pickUnitedInjuries(payload: unknown): Injury[] {
  const root = payload as {
    squad?: { squad?: { title?: string; members?: { name?: string; injury?: { id?: string; expectedReturn?: string } | null }[] }[] };
    overview?: { squad?: { title?: string; members?: { name?: string; injury?: { id?: string; expectedReturn?: string } | null }[] }[] };
  };
  const groups = root.squad?.squad ?? root.overview?.squad ?? [];
  const out: Injury[] = [];
  for (const g of groups) {
    for (const m of g.members ?? []) {
      if (!m.injury || !m.name?.trim()) continue;
      out.push({
        name: m.name.trim(),
        reason: m.injury.expectedReturn
          ? `Retour : ${m.injury.expectedReturn}`
          : g.title
            ? `Blessé · ${g.title}`
            : 'Blessé',
      });
    }
  }
  return out;
}

/** H2H simplifié à partir des derniers face-à-face dans le calendrier United. */
export function pickUnitedH2H(payload: unknown, oppId: string): H2HSummary | null {
  if (!oppId) return null;
  const list = asClubRoot(payload).overview?.overviewFixtures ?? [];
  const vs = list.filter(
    (f) =>
      f.status?.finished &&
      (String(f.home?.id) === oppId || String(f.away?.id) === oppId)
  );
  if (!vs.length) return null;
  let winsTeam1 = 0;
  let winsTeam2 = 0;
  let draws = 0;
  const mu = String(FOTMOB_MU_TEAM_ID);
  for (const f of vs) {
    const g = parseScore(f.status, f.home, f.away);
    if (g.home == null || g.away == null) continue;
    const muHome = String(f.home?.id) === mu;
    const muGoals = muHome ? g.home : g.away;
    const oppGoals = muHome ? g.away : g.home;
    if (muGoals > oppGoals) winsTeam1 += 1;
    else if (muGoals < oppGoals) winsTeam2 += 1;
    else draws += 1;
  }
  return { winsTeam1, draws, winsTeam2 };
}

const teamCache = new Map<string, { at: number; payload: unknown }>();

export async function fetchFotmobTeam(teamId: string | number, force = false): Promise<unknown> {
  const id = String(teamId);
  const hit = teamCache.get(id);
  if (!force && hit && Date.now() - hit.at < FOTMOB_THE_RED_CACHE_TTL_MS) return hit.payload;
  const url = `${FOTMOB_API_BASE}/teams?id=${id}&tab=overview`;
  const res = await fetch(url, { headers: FOTMOB_FETCH_HEADERS });
  if (!res.ok) throw new Error(`FotMob team ${id} (${res.status})`);
  const json = await res.json();
  teamCache.set(id, { at: Date.now(), payload: json });
  return json;
}

/** Face-à-face depuis matchDetails FotMob (`content.h2h.summary` = [homeWins, draws, awayWins]). */
export async function fetchMatchH2H(matchId: string): Promise<H2HDetail | null> {
  if (!matchId) return null;
  const url = `${FOTMOB_API_BASE}/matchDetails?matchId=${matchId}`;
  const res = await fetch(url, { headers: FOTMOB_FETCH_HEADERS });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    header?: { teams?: { id?: number | string; name?: string; score?: number }[] };
    content?: {
      h2h?: {
        summary?: number[];
        matches?: {
          finished?: boolean;
          matchUrl?: string;
          league?: { name?: string };
          home?: { id?: string | number; name?: string; score?: number };
          away?: { id?: string | number; name?: string; score?: number };
          status?: { utcTime?: string; scoreStr?: string };
          time?: { utcTime?: string };
        }[];
      };
    };
  };

  const teams = data.header?.teams ?? [];
  const homeId = String(teams[0]?.id ?? '');
  const awayId = String(teams[1]?.id ?? '');
  const summary = data.content?.h2h?.summary;
  const homeWins = Number(summary?.[0] ?? 0);
  const draws = Number(summary?.[1] ?? 0);
  const awayWins = Number(summary?.[2] ?? 0);

  const mu = String(FOTMOB_MU_TEAM_ID);
  const winsTeam1 = homeId === mu ? homeWins : awayId === mu ? awayWins : homeWins;
  const winsTeam2 = homeId === mu ? awayWins : awayId === mu ? homeWins : awayWins;

  const matches: H2HMatchDetail[] = [];
  let goalsTeam1 = 0;
  let goalsTeam2 = 0;

  for (const m of data.content?.h2h?.matches ?? []) {
    if (!m.finished) continue;
    const g = parseScore(m.status, m.home as ClubSide, m.away as ClubSide);
    if (g.home == null || g.away == null) continue;
    const hId = String(m.home?.id ?? '');
    const aId = String(m.away?.id ?? '');
    const muIsHome = hId === mu;
    const muGoals = muIsHome ? g.home : aId === mu ? g.away : g.home;
    const oppGoals = muIsHome ? g.away : aId === mu ? g.home : g.away;
    goalsTeam1 += muGoals;
    goalsTeam2 += oppGoals;
    const idFromUrl = m.matchUrl?.match(/#(\d+)/)?.[1] ?? `${hId}-${aId}-${m.status?.utcTime ?? ''}`;
    matches.push({
      id: idFromUrl,
      dateMs: new Date(m.status?.utcTime ?? m.time?.utcTime ?? Date.now()).getTime(),
      phase: m.league?.name ?? 'Match',
      home: {
        id: hId,
        name: m.home?.name ?? 'Home',
        logo: fotmobTeamLogoUrl(m.home?.id),
      },
      away: {
        id: aId,
        name: m.away?.name ?? 'Away',
        logo: fotmobTeamLogoUrl(m.away?.id),
      },
      goalsHome: g.home,
      goalsAway: g.away,
    });
    if (matches.length >= 12) break;
  }

  if (!summary && matches.length === 0) return null;

  return {
    winsTeam1,
    draws,
    winsTeam2,
    goalsTeam1,
    goalsTeam2,
    matches,
  };
}

type OverviewPlayer = {
  id?: number;
  name?: string;
  teamName?: string;
  goals?: number;
  assists?: number;
  value?: number;
  stat?: number | { value?: number };
};

function fotmobStatNumber(raw: unknown, fallback = 0): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const v = (raw as { value?: number }).value;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return fallback;
}

export async function getPremierLeagueTopScorers(limit = 10): Promise<TopScorer[]> {
  const url = `${FOTMOB_API_BASE}/leagues?id=${FOTMOB_PL_LEAGUE_ID}&tab=overview&season=${encodeURIComponent(FOTMOB_PL_SEASON)}`;
  const res = await fetch(url, { headers: FOTMOB_FETCH_HEADERS });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    overview?: { topPlayers?: { byGoals?: { players?: OverviewPlayer[] } } };
  };
  const players = data.overview?.topPlayers?.byGoals?.players ?? [];
  const rows: TopScorer[] = [];
  for (const p of players) {
    const name = p.name?.trim();
    if (!name || !p.id) continue;
    rows.push({
      name,
      team: p.teamName ?? 'Premier League',
      goals: fotmobStatNumber(p.goals ?? p.value ?? p.stat),
      photo: fotmobPlayerImageUrl(p.id),
      fotmobId: p.id,
    });
    if (rows.length >= limit) break;
  }
  return rows;
}

export async function getPremierLeagueTopAssisters(limit = 10): Promise<
  { name: string; team: string; assists: number; photo?: string; fotmobId?: number }[]
> {
  const url = `${FOTMOB_API_BASE}/leagues?id=${FOTMOB_PL_LEAGUE_ID}&tab=overview&season=${encodeURIComponent(FOTMOB_PL_SEASON)}`;
  const res = await fetch(url, { headers: FOTMOB_FETCH_HEADERS });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    overview?: { topPlayers?: { byAssists?: { players?: OverviewPlayer[] } } };
  };
  const players = data.overview?.topPlayers?.byAssists?.players ?? [];
  return players
    .map((p) => {
      const name = p.name?.trim();
      if (!name || !p.id) return null;
      return {
        name,
        team: p.teamName ?? 'Premier League',
        assists: fotmobStatNumber(p.assists ?? p.value ?? p.stat),
        photo: fotmobPlayerImageUrl(p.id),
        fotmobId: p.id,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .slice(0, limit);
}
