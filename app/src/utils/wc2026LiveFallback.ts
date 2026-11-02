import { WC2026_KNOCKOUT_FIXTURES } from '../data/wc2026Knockout';
import { WC2026_MATCHES, getMatchScheduleStatus } from '../data/wc2026Matches';
import type { GamesFixture } from '../types/games.types';
import type { LiveMatch, LiveMatchStatus } from '../types/live.types';
import { formatKickoffLabel } from './liveMatchUtils';

function statusFromKickoff(kickoffMs: number, durationHours = 2): LiveMatchStatus {
  const now = Date.now();
  const endMs = kickoffMs + durationHours * 60 * 60 * 1000;
  if (now < kickoffMs) return 'upcoming';
  if (now >= endMs) return 'finished';
  return 'live';
}

function groupMatchToLive(id: string, homeCode: string, homeName: string, awayCode: string, awayName: string, group: string, round: string, kickoffMs: number, status: LiveMatchStatus): LiveMatch {
  return {
    id,
    home_name: homeName,
    away_name: awayName,
    home_score: 0,
    away_score: 0,
    minute: status === 'live' ? '45' : '',
    status,
    round,
    group,
    home_country_code: homeCode,
    away_country_code: awayCode,
    home_team_id: homeCode,
    away_team_id: awayCode,
    events: [],
    kickoff_at: kickoffMs,
    kickoff_label: formatKickoffLabel(kickoffMs),
  };
}

function fixtureToLive(f: GamesFixture): LiveMatch {
  return groupMatchToLive(
    f.id,
    f.homeCode,
    f.homeName,
    f.awayCode,
    f.awayName,
    f.group || f.phase,
    f.phase,
    f.kickoffMs,
    statusFromKickoff(f.kickoffMs)
  );
}

/** Calendrier FIFA intégré (groupes + KO) pour le Live si FotMob / Live Score sont vides. */
export function localWorldCupLiveMatches(): LiveMatch[] {
  const groups = WC2026_MATCHES.map((m) => {
    const schedule = getMatchScheduleStatus(m);
    const status: LiveMatchStatus =
      schedule === 'live' ? 'live' : schedule === 'finished' ? 'finished' : 'upcoming';
    return groupMatchToLive(
      m.id,
      m.home.code,
      m.home.name,
      m.away.code,
      m.away.name,
      m.group,
      m.group,
      m.kickoffMs,
      status
    );
  });
  const knockout = WC2026_KNOCKOUT_FIXTURES.map(fixtureToLive);
  return [...groups, ...knockout].sort((a, b) => (a.kickoff_at ?? 0) - (b.kickoff_at ?? 0));
}

export function mergeWithLocalWorldCupCalendar(live: LiveMatch[], upcoming: LiveMatch[]): {
  live: LiveMatch[];
  upcoming: LiveMatch[];
} {
  if (live.length > 0 || upcoming.length > 0) {
    return { live, upcoming };
  }
  const local = localWorldCupLiveMatches();
  return {
    live: local.filter((m) => m.status === 'live' || m.status === 'halftime'),
    upcoming: local.filter((m) => m.status !== 'live'),
  };
}
