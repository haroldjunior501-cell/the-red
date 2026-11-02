import { fotmobTeamLogoUrl } from '../constants/fotmob';
import { formatKickoffLabel, kickoffMsFromRow } from '../utils/liveMatchUtils';
import { loadFotmobFixtures } from './fotmobFootballApi';
import { fotmobFixtureToLiveScoreRow, type FotmobFixture } from './fotmobFootballMappers';
import { parseMatchList, parseMatchRow, parseUpcomingMatchList } from './liveMatchParsers';
import { getIso2ForFotmobTeamId } from './fotmobTeamRegistry';
import { resolveCountryDisplayCode } from '../utils/countryDisplayCode';
import type { LiveMatch } from '../types/live.types';

function wrapFotmobPayload(fixtures: FotmobFixture[]): { data: unknown[] } {
  return { data: fixtures.map(fotmobFixtureToLiveScoreRow) };
}

function enrichLogos(match: LiveMatch): LiveMatch {
  const homeLogo =
    match.home_logo_url ?? fotmobTeamLogoUrl(match.home_team_id);
  const awayLogo =
    match.away_logo_url ?? fotmobTeamLogoUrl(match.away_team_id);
  let home_country_code = match.home_country_code;
  let away_country_code = match.away_country_code;
  const homeIso2 = getIso2ForFotmobTeamId(match.home_team_id);
  const awayIso2 = getIso2ForFotmobTeamId(match.away_team_id);
  if (homeIso2) {
    home_country_code = resolveCountryDisplayCode({
      iso: homeIso2,
      teamId: match.home_team_id,
      teamName: match.home_name,
    });
  }
  if (awayIso2) {
    away_country_code = resolveCountryDisplayCode({
      iso: awayIso2,
      teamId: match.away_team_id,
      teamName: match.away_name,
    });
  }
  return {
    ...match,
    home_logo_url: homeLogo,
    away_logo_url: awayLogo,
    home_country_code,
    away_country_code,
  };
}

function isFotmobLiveFixture(f: FotmobFixture): boolean {
  const st = f.status;
  return !!(st?.started && !st?.finished && !st?.cancelled);
}

function isFotmobUpcomingFixture(f: FotmobFixture): boolean {
  const st = f.status;
  if (st?.finished || st?.cancelled) return false;
  return !st?.started;
}

function fotmobFixtureToUpcoming(f: FotmobFixture): LiveMatch | null {
  const row = fotmobFixtureToLiveScoreRow(f);
  const kickoffAt = kickoffMsFromRow(row);
  const base = parseMatchRow(row, []);
  if (!base) return null;
  return enrichLogos({
    ...base,
    status: 'upcoming',
    home_score: 0,
    away_score: 0,
    minute: '',
    kickoff_at: kickoffAt > 0 ? kickoffAt : undefined,
    kickoff_label: kickoffAt > 0 ? formatKickoffLabel(kickoffAt) : base.round,
    events: [],
  });
}

function buildUpcomingMatches(fixtures: FotmobFixture[]): LiveMatch[] {
  const upcomingFixtures = fixtures.filter(isFotmobUpcomingFixture);
  const fromParser = parseUpcomingMatchList(wrapFotmobPayload(upcomingFixtures)).map(enrichLogos);
  if (fromParser.length > 0) return fromParser;
  return upcomingFixtures
    .map(fotmobFixtureToUpcoming)
    .filter((m): m is LiveMatch => m != null)
    .sort((a, b) => (a.kickoff_at ?? 0) - (b.kickoff_at ?? 0));
}

/** Calendrier + live CDM depuis FotMob (section Live). */
export async function fetchLiveSectionFromFotmob(): Promise<{
  live: LiveMatch[];
  upcoming: LiveMatch[];
}> {
  const fixtures = await loadFotmobFixtures();
  const liveFixtures = fixtures.filter(isFotmobLiveFixture);
  const live = parseMatchList(wrapFotmobPayload(liveFixtures)).map(enrichLogos);
  const upcoming = buildUpcomingMatches(fixtures);
  return { live, upcoming };
}

export async function fetchFotmobUpcomingMatches(): Promise<LiveMatch[]> {
  const fixtures = await loadFotmobFixtures();
  return buildUpcomingMatches(fixtures);
}

export async function fetchFotmobLiveMatches(): Promise<LiveMatch[]> {
  const fixtures = await loadFotmobFixtures();
  const liveFixtures = fixtures.filter(isFotmobLiveFixture);
  return parseMatchList(wrapFotmobPayload(liveFixtures)).map(enrichLogos);
}
