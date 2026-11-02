import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FOTMOB_API_BASE,
  FOTMOB_FOOTBALL_CACHE_KEY,
  FOTMOB_FOOTBALL_CACHE_TTL_MS,
  FOTMOB_WC_LEAGUE_ID,
  FOTMOB_WC_SEASON,
} from '../constants/fotmobWorldCup';
import {
  extractFotmobFixtures,
  extractFotmobTableTeams,
  FOTMOB_FETCH_HEADERS,
  fotmobFixtureToLiveScoreRow,
  wrapRowsAsLiveScorePayload,
  type FotmobFixture,
  type FotmobTableSection,
} from './fotmobFootballMappers';
import {
  getFotmobTeamRegistry,
  getIso2ForFotmobTeamId,
  mergeTeamsIntoRegistry,
  resolveFotmobTeamIdFromRef,
} from './fotmobTeamRegistry';

type LeagueTab = 'fixtures' | 'table' | 'overview' | 'stats';

type CachedLeague = {
  savedAt: number;
  fixtures?: FotmobFixture[];
  tablePayload?: unknown;
};

let memoryFixtures: FotmobFixture[] | null = null;
let lastReachable = true;

export function isFotmobFootballReachable(): boolean {
  return lastReachable;
}

async function fetchLeagueTab(tab: LeagueTab): Promise<unknown> {
  const url = `${FOTMOB_API_BASE}/leagues?id=${FOTMOB_WC_LEAGUE_ID}&tab=${tab}&season=${FOTMOB_WC_SEASON}`;
  const res = await fetch(url, { headers: FOTMOB_FETCH_HEADERS });
  if (!res.ok) {
    lastReachable = false;
    throw new Error(`FotMob ${tab} (${res.status})`);
  }
  lastReachable = true;
  return res.json() as Promise<unknown>;
}

async function loadCache(): Promise<CachedLeague | null> {
  try {
    const raw = await AsyncStorage.getItem(FOTMOB_FOOTBALL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLeague;
    if (Date.now() - parsed.savedAt > FOTMOB_FOOTBALL_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function saveCache(patch: Partial<CachedLeague>): Promise<void> {
  const prev = (await loadCache()) ?? { savedAt: Date.now() };
  const next: CachedLeague = { ...prev, ...patch, savedAt: Date.now() };
  await AsyncStorage.setItem(FOTMOB_FOOTBALL_CACHE_KEY, JSON.stringify(next)).catch(() => {});
}

export async function loadFotmobFixtures(force = false): Promise<FotmobFixture[]> {
  if (!force && memoryFixtures?.length) return memoryFixtures;

  const cached = await loadCache();
  if (!force && cached?.fixtures?.length) {
    memoryFixtures = cached.fixtures;
    return cached.fixtures;
  }

  const payload = await fetchLeagueTab('fixtures');
  const fixtures = extractFotmobFixtures(payload);
  if (!fixtures.length) throw new Error('FotMob: calendrier CDM vide');

  memoryFixtures = fixtures;
  await saveCache({ fixtures });

  const tablePayload = await fetchLeagueTab('table').catch(() => null);
  if (tablePayload) {
    mergeTeamsIntoRegistry(extractFotmobTableTeams(tablePayload));
    await saveCache({ tablePayload });
  }

  return fixtures;
}

function rowsFromFixtures(fixtures: FotmobFixture[]): Record<string, unknown>[] {
  return fixtures.map(fotmobFixtureToLiveScoreRow);
}

export async function getFotmobFixturesPayload(): Promise<{ data: unknown[] }> {
  const fixtures = await loadFotmobFixtures();
  return wrapRowsAsLiveScorePayload(rowsFromFixtures(fixtures));
}

export async function getFotmobLiveMatchesPayload(): Promise<{ data: unknown[] }> {
  const fixtures = await loadFotmobFixtures();
  const live = fixtures.filter((m) => m.status?.started && !m.status?.finished);
  return wrapRowsAsLiveScorePayload(live.map(fotmobFixtureToLiveScoreRow));
}

export async function getFotmobFixturesForTeamPayload(teamId: string): Promise<{ data: unknown[] }> {
  const fixtures = await loadFotmobFixtures();
  const tid = String(teamId);
  const filtered = fixtures.filter(
    (m) => String(m.home?.id) === tid || String(m.away?.id) === tid
  );
  return wrapRowsAsLiveScorePayload(filtered.map(fotmobFixtureToLiveScoreRow));
}

export async function getFotmobStandingsPayload(): Promise<{ data: unknown[] }> {
  const cached = await loadCache();
  let payload = cached?.tablePayload;
  if (!payload) {
    payload = await fetchLeagueTab('table');
    await saveCache({ tablePayload: payload });
  }

  const root = payload as { table?: FotmobTableSection[] };
  const blocks = root?.table?.[0]?.data?.tables ?? [];
  const rows: Record<string, unknown>[] = [];

  for (const g of blocks) {
    const groupName = g.leagueName ?? '';
    for (const row of g.table?.all ?? []) {
      rows.push({
        team_id: String(row.id ?? ''),
        team: { id: String(row.id ?? ''), name: row.name },
        played: row.played ?? 0,
        won: row.wins ?? 0,
        draw: row.draws ?? 0,
        lost: row.losses ?? 0,
        goals_scored: 0,
        goals_against: 0,
        group_name: groupName,
        _source: 'fotmob',
      });
      if (row.id && row.name) {
        mergeTeamsIntoRegistry([{ id: String(row.id), name: String(row.name) }]);
      }
    }
  }

  return wrapRowsAsLiveScorePayload(rows);
}

export async function getFotmobParticipantsPayload(): Promise<{ data: unknown[] }> {
  await loadFotmobFixtures();
  const reg = getFotmobTeamRegistry();
  const rows = Object.entries(reg.iso2ByTeamId).map(([teamId, iso]) => ({
    id: teamId,
    team_id: teamId,
    iso,
    country_code: iso,
    code: iso,
    name: iso,
    _source: 'fotmob',
  }));
  return wrapRowsAsLiveScorePayload(rows);
}

export async function getFotmobHead2HeadPayload(
  team1: string,
  team2: string
): Promise<{ data: unknown[] }> {
  const fixtures = await loadFotmobFixtures();
  const id1 = resolveFotmobTeamIdFromRef(team1);
  const id2 = resolveFotmobTeamIdFromRef(team2);
  if (!id1 || !id2) return wrapRowsAsLiveScorePayload([]);

  const iso1 = getIso2ForFotmobTeamId(id1);
  const iso2 = getIso2ForFotmobTeamId(id2);

  const h2h = fixtures.filter((m) => {
    const hId = String(m.home?.id ?? '');
    const aId = String(m.away?.id ?? '');
    const byId = (hId === id1 && aId === id2) || (hId === id2 && aId === id1);
    if (byId) return true;
    if (!iso1 || !iso2) return false;
    const hIso = getIso2ForFotmobTeamId(hId);
    const aIso = getIso2ForFotmobTeamId(aId);
    return (hIso === iso1 && aIso === iso2) || (hIso === iso2 && aIso === iso1);
  });

  const finished = h2h
    .filter((m) => m.status?.finished)
    .sort((a, b) => {
      const ta = new Date(a.status?.utcTime ?? 0).getTime();
      const tb = new Date(b.status?.utcTime ?? 0).getTime();
      return tb - ta;
    });

  return wrapRowsAsLiveScorePayload(finished.map(fotmobFixtureToLiveScoreRow));
}

export async function getFotmobMatchHistoryPayload(
  teamId: string
): Promise<{ data: unknown[] }> {
  const fixtures = await loadFotmobFixtures();
  const tid = String(teamId);
  const history = fixtures
    .filter((m) => {
      if (String(m.home?.id) !== tid && String(m.away?.id) !== tid) return false;
      return Boolean(m.status?.finished);
    })
    .sort((a, b) => {
      const ta = new Date(a.status?.utcTime ?? 0).getTime();
      const tb = new Date(b.status?.utcTime ?? 0).getTime();
      return tb - ta;
    });
  return wrapRowsAsLiveScorePayload(history.map(fotmobFixtureToLiveScoreRow));
}

export async function getFotmobTopScorersPayload(): Promise<{ data: unknown[] }> {
  try {
    const overview = await fetchLeagueTab('overview');
    const root = overview as {
      overview?: {
        topPlayers?: {
          byGoals?: {
            players?: {
              id?: number;
              name?: string;
              teamName?: string;
              goals?: number;
              value?: number;
              stat?: number | { value?: number };
            }[];
          };
        };
      };
    };
    const players = root?.overview?.topPlayers?.byGoals?.players;
    if (Array.isArray(players) && players.length) {
      const rows = players.map((p) => {
        const statObj = p.stat && typeof p.stat === 'object' ? p.stat.value : p.stat;
        const goals =
          typeof p.goals === 'number'
            ? p.goals
            : typeof p.value === 'number'
              ? p.value
              : typeof statObj === 'number'
                ? statObj
                : 0;
        return {
          player_name: p.name,
          team_name: p.teamName,
          goals,
          player: {
            name: p.name,
            photo: p.id ? `https://images.fotmob.com/image_resources/playerimages/${p.id}.png` : undefined,
          },
          _source: 'fotmob',
        };
      });
      return wrapRowsAsLiveScorePayload(rows);
    }
  } catch {
    /* stats vide avant CDM — fallback livescore */
  }
  return wrapRowsAsLiveScorePayload([]);
}

/** Test connexion FotMob CDM 2026. */
export async function testFotmobFootballConnection(): Promise<boolean> {
  try {
    await loadFotmobFixtures(true);
    return true;
  } catch {
    return false;
  }
}
