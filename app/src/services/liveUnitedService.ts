/**
 * Section Live THE RED — matchs Manchester United uniquement (FotMob).
 */
import { fotmobTeamLogoUrl } from '../constants/fotmob';
import { FOTMOB_MU_TEAM_ID } from '../constants/fotmobTheRed';
import type { LiveMatch, LiveMatchStatus, MatchEvent } from '../types/live.types';
import { formatKickoffLabel } from '../utils/liveMatchUtils';
import {
  fetchManchesterUnitedFixtures,
  fetchManchesterUnitedTeam,
  pickUnitedLiveMatch,
  pickUnitedSeasonFixtures,
  type UnitedProgrammeMatch,
} from './fotmobClubApi';
import { fetchFotmobLiveMatchDetails } from './fotmobLiveMatchDetails';

const MU = String(FOTMOB_MU_TEAM_ID);

function statusFromProgramme(m: UnitedProgrammeMatch): LiveMatchStatus {
  if (m.statusShort === 'LIVE') return 'live';
  if (m.statusShort === 'HT') return 'halftime';
  if (m.statusShort === 'FT') return 'finished';
  if (m.statusShort === 'CANC') return 'upcoming';
  if (m.statusShort === 'NS' || m.kickoffMs > Date.now()) return 'upcoming';
  // Kickoff passé sans FT → tenter live
  if (m.kickoffMs <= Date.now() && m.resultVsUnited == null) return 'live';
  return 'finished';
}

function programmeToLive(m: UnitedProgrammeMatch, events: MatchEvent[] = []): LiveMatch {
  const status = statusFromProgramme(m);
  const kickoffAt = m.kickoffMs > 0 ? m.kickoffMs : undefined;
  return {
    id: m.fixtureId,
    home_name: m.home.name,
    away_name: m.away.name,
    home_score: m.goals.home ?? 0,
    away_score: m.goals.away ?? 0,
    minute: status === 'finished' ? 'FT' : status === 'live' ? "'" : '',
    status,
    round: m.competition,
    group: m.competition,
    home_country_code: m.home.id === MU ? 'MU' : 'OPP',
    away_country_code: m.away.id === MU ? 'MU' : 'OPP',
    home_team_id: m.home.id,
    away_team_id: m.away.id,
    home_logo_url: m.home.logo ?? fotmobTeamLogoUrl(m.home.id),
    away_logo_url: m.away.logo ?? fotmobTeamLogoUrl(m.away.id),
    events,
    kickoff_at: kickoffAt,
    kickoff_label: kickoffAt ? formatKickoffLabel(kickoffAt) : m.competition,
  };
}

function competitionBucket(name: string): 'pl' | 'ucl' | 'cups' | 'other' {
  const n = name.toLowerCase();
  if (n.includes('premier')) return 'pl';
  if (n.includes('champions')) return 'ucl';
  if (n.includes('efl') || n.includes('fa cup') || n.includes('carabao') || n.includes('league cup')) {
    return 'cups';
  }
  return 'other';
}

export function unitedCompetitionFilter(
  match: LiveMatch,
  filter: 'all' | 'live' | 'upcoming' | 'played' | 'pl' | 'ucl' | 'cups'
): boolean {
  const bucket = competitionBucket(match.round || match.group);
  switch (filter) {
    case 'live':
      return match.status === 'live' || match.status === 'halftime' || match.status === 'extra_time' || match.status === 'penalties';
    case 'upcoming':
      return match.status === 'upcoming';
    case 'played':
      return match.status === 'finished';
    case 'pl':
      return bucket === 'pl';
    case 'ucl':
      return bucket === 'ucl';
    case 'cups':
      return bucket === 'cups';
    default:
      return true;
  }
}

async function enrichLiveScore(match: LiveMatch): Promise<LiveMatch> {
  try {
    const detail = await fetchFotmobLiveMatchDetails(match.id, true);
    if (!detail) return match;
    return {
      ...match,
      home_score: detail.homeScore,
      away_score: detail.awayScore,
      minute: detail.minute || match.minute,
      status: detail.status === 'upcoming' ? match.status : detail.status,
      events: detail.events.length ? detail.events : match.events,
      round: detail.competition || match.round,
      group: detail.competition || match.group,
    };
  } catch {
    return match;
  }
}

export type UnitedLiveSection = {
  live: LiveMatch[];
  upcoming: LiveMatch[];
  recent: LiveMatch[];
  /** Match à mettre en avant (live > prochain > dernier) */
  featured: LiveMatch | null;
};

/** Calendrier United + détection match en cours. */
export async function fetchUnitedLiveSection(force = false): Promise<UnitedLiveSection> {
  const [fixturesPayload, overviewPayload] = await Promise.all([
    fetchManchesterUnitedFixtures(force),
    fetchManchesterUnitedTeam(force).catch(() => null),
  ]);

  const all = pickUnitedSeasonFixtures(fixturesPayload);
  const now = Date.now();

  let liveIds = new Set<string>();
  const overviewLive = overviewPayload ? pickUnitedLiveMatch(overviewPayload) : null;
  if (overviewLive) liveIds.add(overviewLive.fixtureId);

  for (const m of all) {
    const st = statusFromProgramme(m);
    if (st === 'live' || st === 'halftime') liveIds.add(m.fixtureId);
  }

  const live: LiveMatch[] = [];
  const upcoming: LiveMatch[] = [];
  const recent: LiveMatch[] = [];

  for (const m of all) {
    const row = programmeToLive(m);
    if (liveIds.has(m.fixtureId)) {
      live.push({ ...row, status: row.status === 'upcoming' ? 'live' : row.status });
    } else if (row.status === 'upcoming' || m.kickoffMs >= now - 30 * 60 * 1000) {
      if (row.status !== 'finished') upcoming.push(row);
      else recent.push(row);
    } else if (row.status === 'finished') {
      recent.push(row);
    }
  }

  upcoming.sort((a, b) => (a.kickoff_at ?? 0) - (b.kickoff_at ?? 0));
  recent.sort((a, b) => (b.kickoff_at ?? 0) - (a.kickoff_at ?? 0));

  const enrichedLive = await Promise.all(live.map(enrichLiveScore));

  let featured: LiveMatch | null =
    enrichedLive[0] ?? upcoming[0] ?? recent[0] ?? null;

  return {
    live: enrichedLive,
    upcoming: upcoming.slice(0, 12),
    recent: recent.slice(0, 8),
    featured,
  };
}
