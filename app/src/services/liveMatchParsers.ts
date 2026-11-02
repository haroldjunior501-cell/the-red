import { LIVESCORE_TEAM_ID_BY_ISO } from '../constants/worldCupLiveScore';
import { groupLetterFromName } from '../constants/liveGroups';
import type { LiveMatch, LiveMatchStatus, MatchEvent, MatchEventType, Standing, TopScorerRow } from '../types/live.types';
import { resolveCountryDisplayCode } from '../utils/countryDisplayCode';
import { formatKickoffLabel, kickoffMsFromRow } from '../utils/liveMatchUtils';
import { parseMatchEvents, extractEventRows } from './livescoreEventParsers';
import { premiumEventFromApi } from '../utils/liveMatchEventMap';
import type { PremiumMatchEvent } from '../types/liveMatchEvent';

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
  // FotMob-style stat blobs: { name, value, format, fractions }
  if (v && typeof v === 'object' && 'value' in v) {
    return asNumber((v as { value: unknown }).value, fallback);
  }
  return fallback;
}

export function extractMatchRows(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = root.data;
  if (Array.isArray(data)) {
    return data.map((x) => asRecord(x)).filter((x): x is Record<string, unknown> => x != null);
  }
  const dataObj = asRecord(data);
  if (dataObj) {
    for (const key of ['match', 'matches', 'fixture', 'fixtures'] as const) {
      const arr = dataObj[key];
      if (Array.isArray(arr)) {
        return arr.map((x) => asRecord(x)).filter((x): x is Record<string, unknown> => x != null);
      }
    }
  }
  for (const key of ['match', 'matches'] as const) {
    const arr = root[key];
    if (Array.isArray(arr)) {
      return arr.map((x) => asRecord(x)).filter((x): x is Record<string, unknown> => x != null);
    }
  }
  return [];
}

function countryCodeForTeamId(teamId: string): string {
  const tid = String(teamId);
  for (const [code, id] of Object.entries(LIVESCORE_TEAM_ID_BY_ISO)) {
    if (id === tid) return code.length === 2 ? code : code.slice(0, 3);
  }
  return tid.slice(0, 3).toUpperCase() || 'UNK';
}

function teamSide(row: Record<string, unknown>, side: 'home' | 'away'): Record<string, unknown> | null {
  if (side === 'home') {
    return asRecord(row.home ?? row.team1 ?? row.localteam ?? row.home_team);
  }
  return asRecord(row.away ?? row.team2 ?? row.visitorteam ?? row.away_team);
}

function parseStatus(raw: string, minute: number): LiveMatchStatus {
  const s = raw.toUpperCase().trim();
  if (
    !s ||
    s === 'NS' ||
    s === 'TBD' ||
    s === 'SCHEDULED' ||
    s === 'NOT STARTED' ||
    s === 'TIMED' ||
    s === 'PRE' ||
    s === 'PST'
  ) {
    return 'upcoming';
  }
  if (s.includes('HT') || s.includes('HALF') || s === 'INT' || s === 'BRK') return 'halftime';
  if (s.includes('PEN')) return 'penalties';
  if (s.includes('ET') || s.includes('EXTRA')) return 'extra_time';
  if (s === 'FT' || s === 'AET' || s === 'FINISHED' || s === 'ENDED' || s === 'CANC') return 'finished';
  if (minute > 0 || s.includes('LIVE') || s === '1H' || s === '2H' || s === 'INPLAY' || s === 'IN PLAY') {
    return 'live';
  }
  return 'upcoming';
}

/** Match réellement en cours (pas programmé ni terminé). */
export function isLiveMatchStatus(status: LiveMatchStatus): boolean {
  return status === 'live' || status === 'halftime' || status === 'extra_time' || status === 'penalties';
}

function rowGoals(row: Record<string, unknown>): { home: number; away: number } {
  const ft = asString(row.ft_score ?? row.score ?? row.result);
  if (ft && /^\s*\d+\s*[-:]\s*\d+/.test(ft)) {
    const parts = ft.split(/[-:]/).map((x) => x.trim());
    if (parts.length >= 2) {
      return { home: asNumber(parts[0], 0), away: asNumber(parts[1], 0) };
    }
  }
  const sc = asRecord(row.score) ?? row;
  return {
    home: asNumber(sc.home_score ?? sc.score_home ?? sc.localteam_score, 0),
    away: asNumber(sc.away_score ?? sc.score_away ?? sc.visitorteam_score, 0),
  };
}

function mapEventType(raw: string): MatchEventType {
  const t = raw.toLowerCase();
  if (t.includes('goal') && !t.includes('own')) return 'goal';
  if (t.includes('red')) return 'redcard';
  if (t.includes('yellow')) return 'yellowcard';
  if (t.includes('pen')) return 'penalty';
  return 'substitution';
}

export function parseApiEvents(
  payload: unknown,
  homeId: string,
  awayId: string,
  homeCode = '',
  awayCode = ''
): MatchEvent[] {
  return parsePremiumApiEvents(payload, homeId, awayId, homeCode, awayCode).map((e) => ({
    id: e.id,
    type:
      e.type === 'goal'
        ? 'goal'
        : e.type === 'yellow_card'
          ? 'yellowcard'
          : e.type === 'red_card'
            ? 'redcard'
            : 'substitution',
    minute:
      e.extraMinute != null && e.extraMinute > 0
        ? `${e.minute}+${e.extraMinute}`
        : e.minute > 0
          ? String(e.minute)
          : '',
    player_name: e.playerName,
    team: e.team,
  }));
}

export function parsePremiumApiEvents(
  payload: unknown,
  homeId: string,
  awayId: string,
  homeCode = '',
  awayCode = ''
): PremiumMatchEvent[] {
  const parsed = parseMatchEvents(payload);
  const rows = extractEventRows(payload);
  const rowById = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const id =
      String(row.id ?? row.event_id ?? '') ||
      `${String(row.type)}-${String(row.minute)}-${String(row.player)}`;
    rowById.set(id, row);
  }
  return parsed.map((e) =>
    premiumEventFromApi(e, homeId, awayId, homeCode, awayCode, rowById.get(e.id))
  );
}

export function parseMatchRow(row: Record<string, unknown>, events: MatchEvent[] = []): LiveMatch | null {
  const id = asString(row.id ?? row.match_id ?? row.fixture_id);
  if (!id) return null;

  const home = teamSide(row, 'home');
  const away = teamSide(row, 'away');
  const homeId = asString(home?.id ?? home?.team_id) || 'HOME';
  const awayId = asString(away?.id ?? away?.team_id) || 'AWAY';
  const homeName = asString(home?.name ?? home?.title) || 'Home';
  const awayName = asString(away?.name ?? away?.title) || 'Away';
  const homeLogo = asString(home?.logo ?? home?.image ?? row.home_logo ?? row.home_logo_url) || undefined;
  const awayLogo = asString(away?.logo ?? away?.image ?? row.away_logo ?? row.away_logo_url) || undefined;
  const homeIso = resolveCountryDisplayCode({
    iso: asString(home?.iso ?? home?.country_code ?? home?.code),
    teamId: homeId,
    teamName: homeName,
  });
  const awayIso = resolveCountryDisplayCode({
    iso: asString(away?.iso ?? away?.country_code ?? away?.code),
    teamId: awayId,
    teamName: awayName,
  });

  const goals = rowGoals(row);
  const timeObj = asRecord(row.time);
  const minuteNum = asNumber(row.minute ?? timeObj?.minute, 0);
  const statusRaw = asString(row.status ?? row.match_status ?? row.state ?? row.time_status);
  const status = parseStatus(statusRaw, minuteNum);
  const round = asString(row.stage_name ?? row.round ?? row.phase ?? row.stage ?? '');
  const groupName = asString(row.group_name ?? row.group ?? row.group_id ?? '');

  return {
    id,
    home_name: homeName,
    away_name: awayName,
    home_score: goals.home,
    away_score: goals.away,
    minute: minuteNum > 0 ? String(minuteNum) : asString(row.minute_label ?? timeObj?.label ?? ''),
    status,
    round,
    group: groupName || `Group ${groupLetterFromName(round)}`,
    home_country_code: homeIso,
    away_country_code: awayIso,
    home_team_id: homeId,
    away_team_id: awayId,
    home_logo_url: homeLogo,
    away_logo_url: awayLogo,
    events,
  };
}

export function parseMatchList(payload: unknown, eventsById?: Record<string, MatchEvent[]>): LiveMatch[] {
  return extractMatchRows(payload)
    .map((row) => {
      const id = asString(row.id ?? row.match_id);
      const events = eventsById?.[id] ?? [];
      return parseMatchRow(row, events);
    })
    .filter((m): m is LiveMatch => m != null)
    .filter((m) => isLiveMatchStatus(m.status));
}

/** Fixtures / matchs programmés à venir. */
/** Équipes par group_id (participants ou fixtures) — stats à 0 si pas encore joué. */
export function parseTeamsByGroupId(payload: unknown): Record<string, Standing[]> {
  const out: Record<string, Standing[]> = {};
  const rows = extractMatchRows(payload);
  const addTeam = (groupId: string, name: string, code: string) => {
    if (!groupId) return;
    const list = out[groupId] ?? [];
    if (list.some((t) => t.country_code === code)) return;
    list.push({
      position: list.length + 1,
      team_name: name,
      country_code: code,
      points: 0,
      goal_difference: 0,
      played: 0,
      wins: 0,
    });
    out[groupId] = list;
  };

  for (const row of rows) {
    const groupId = asString(row.group_id ?? row.group);
    const team = asRecord(row.team ?? row);
    const name = asString(team?.name ?? row.name ?? row.team_name);
    const teamId = asString(team?.id ?? row.team_id ?? row.id);
    const iso =
      asString(team?.iso ?? team?.country_code ?? row.country_code).toUpperCase() ||
      countryCodeForTeamId(teamId);
    if (groupId && name) {
      addTeam(
        groupId,
        name,
        resolveCountryDisplayCode({
          iso,
          teamId: asString(team?.id ?? row.team_id),
          teamName: name,
        })
      );
    }
    const home = teamSide(row, 'home');
    const away = teamSide(row, 'away');
    const gid = asString(row.group_id ?? row.group);
    if (home && gid) {
      addTeam(
        gid,
        asString(home.name),
        resolveCountryDisplayCode({
          iso: asString(home.iso ?? home.country_code),
          teamId: asString(home.id),
          teamName: asString(home.name),
        })
      );
    }
    if (away && gid) {
      addTeam(
        gid,
        asString(away.name),
        resolveCountryDisplayCode({
          iso: asString(away.iso ?? away.country_code),
          teamId: asString(away.id),
          teamName: asString(away.name),
        })
      );
    }
  }
  return out;
}

export function parseUpcomingMatchList(payload: unknown): LiveMatch[] {
  const now = Date.now();
  return extractMatchRows(payload)
    .map((row) => {
      const kickoffAt = kickoffMsFromRow(row);
      if (kickoffAt <= now) return null;
      const base = parseMatchRow(row, []);
      if (!base) return null;
      const groupRaw = asString(row.group_name ?? row.group ?? '');
      const group =
        groupRaw ||
        (asString(row.group_id)
          ? `Groupe ${groupLetterFromName(asString(row.group_id))}`
          : base.group);
      const upcoming: LiveMatch = {
        ...base,
        status: 'upcoming',
        home_score: 0,
        away_score: 0,
        minute: '',
        group,
        kickoff_at: kickoffAt,
        kickoff_label: formatKickoffLabel(kickoffAt),
        events: [],
      };
      return upcoming;
    })
    .filter((m): m is LiveMatch => m != null)
    .sort((a, b) => (a.kickoff_at ?? 0) - (b.kickoff_at ?? 0));
}

export function parseStandings(payload: unknown): Standing[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = asRecord(root.data) ?? root;
  let rows: unknown[] = [];
  for (const key of ['standing', 'standings', 'table', 'team'] as const) {
    const v = data[key];
    if (Array.isArray(v)) {
      rows = v;
      break;
    }
  }
  if (!rows.length && Array.isArray(data)) rows = data;

  const parsed: Standing[] = [];
  rows.forEach((raw, idx) => {
    const row = asRecord(raw);
    if (!row) return;
    const team = asRecord(row.team ?? row);
    const name = asString(team?.name ?? row.name ?? row.team_name);
    const teamId = asString(team?.id ?? row.team_id ?? row.id);
    const iso = resolveCountryDisplayCode({
      iso: asString(team?.iso ?? team?.country_code ?? row.country_code),
      teamId,
      teamName: name,
    });
    parsed.push({
      position: asNumber(row.position ?? row.rank ?? row.place, idx + 1),
      team_name: name,
      country_code: iso,
      points: asNumber(row.points ?? row.pts, 0),
      goal_difference: asNumber(row.goal_difference ?? row.gd ?? row.diff, 0),
      played: asNumber(row.played ?? row.mp ?? row.matches, 0),
      wins: asNumber(row.wins ?? row.w, 0),
      goals_for: asNumber(row.goals_scored ?? row.goalsfor ?? row.gf ?? row.goals_for, 0),
      goals_against: asNumber(row.goals_against ?? row.goalsagainst ?? row.ga, 0),
      draws: asNumber(row.draw ?? row.d ?? row.drawn, 0),
      losses: asNumber(row.lost ?? row.loss ?? row.l, 0),
    });
  });
  return parsed.sort((a, b) => a.position - b.position);
}

export function parseTopScorers(payload: unknown): TopScorerRow[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = asRecord(root.data) ?? root;
  let rows: unknown[] = [];
  for (const key of ['goalscorer', 'goalscorers', 'scorer', 'player'] as const) {
    const v = data[key];
    if (Array.isArray(v)) {
      rows = v;
      break;
    }
  }

  return rows
    .map((raw) => {
      const row = asRecord(raw);
      if (!row) return null;
      const team = asRecord(row.team);
      const teamId = asString(team?.id ?? row.team_id);
      const teamName = asString(team?.name ?? row.team_name);
      const iso = resolveCountryDisplayCode({
        iso: asString(team?.iso ?? team?.country_code),
        teamId,
        teamName,
      });
      return {
        name: asString(row.name ?? row.player_name ?? asRecord(row.player)?.name),
        team: teamName,
        country_code: iso,
        goals: asNumber(row.goals ?? row.goal ?? row.score, 0),
      };
    })
    .filter((x): x is TopScorerRow => x != null && x.name.length > 0)
    .sort((a, b) => b.goals - a.goals);
}
