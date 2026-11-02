/**
 * API football GOALYA — hybride Live Score (compétition) + FotMob (enrichissement joueurs).
 */
import type { ParsedApiMatchEvent } from '../types/planetEvents';
import {
  providerFetchMatchEvents,
  providerGetFixtures,
  providerGetFixturesList,
  providerGetHead2Head,
  providerGetLiveMatches,
  providerGetMatchEvents,
  providerGetMatchHistory,
  providerGetStandings,
  providerGetTopScorers,
  providerGetWorldCupParticipants,
} from './footballDataProvider';
import {
  isLivescoreConfigured,
  rawGetLiveCommentary,
  rawGetLiveOdds,
  rawGetLiveStandings,
  rawGetMatchLineups,
  rawGetMatchStats,
  rawGetStandingsLive,
} from './livescoreRawApi';

export {
  isFootballDataConfigured,
  getActiveFootballDataSource,
  initFootballDataSources,
  isPrimaryLiveScore,
} from './footballDataProvider';
export { isLivescoreConfigured } from './livescoreRawApi';
export { parseMatchEvents } from './livescoreEventParsers';

export async function getLiveMatches(): Promise<unknown> {
  return providerGetLiveMatches();
}

export async function getFixtures(groupId?: string): Promise<unknown> {
  void groupId;
  return providerGetFixtures();
}

export async function getFixturesList(extra: Record<string, string> = {}): Promise<unknown> {
  return providerGetFixturesList(extra);
}

export async function getWorldCupParticipants(): Promise<unknown> {
  return providerGetWorldCupParticipants();
}

export async function getStandings(groupId: string): Promise<unknown> {
  return providerGetStandings(groupId);
}

export async function getTopScorers(): Promise<unknown> {
  return providerGetTopScorers();
}

export async function getHead2Head(team1: string, team2: string): Promise<unknown> {
  return providerGetHead2Head(team1, team2);
}

export async function getMatchHistory(extra: Record<string, string> = {}): Promise<unknown> {
  return providerGetMatchHistory(extra);
}

/** Stats / compos / commentaires — Live Score uniquement (FotMob matchDetails protégé). */
export async function getMatchStats(matchId: string): Promise<unknown> {
  return rawGetMatchStats(matchId);
}

export async function getMatchEvents(matchId: string): Promise<unknown> {
  return providerGetMatchEvents(matchId);
}

export async function getMatchLineups(matchId: string): Promise<unknown> {
  return rawGetMatchLineups(matchId);
}

export async function getLiveCommentary(matchId: string): Promise<unknown> {
  return rawGetLiveCommentary(matchId);
}

export async function getLiveStandings(groupId: string): Promise<unknown> {
  return rawGetLiveStandings(groupId);
}

export async function getLiveOdds(matchId: string): Promise<unknown> {
  return rawGetLiveOdds(matchId);
}

export async function getStandingsLive(extra: Record<string, string> = {}): Promise<unknown> {
  return rawGetStandingsLive(extra);
}

export const livescoreClient = {
  getLiveMatches,
  getFixtures,
  getFixturesList,
  getMatchStats,
  getMatchEvents,
  getMatchLineups,
  getLiveCommentary,
  getLiveStandings,
  getStandings,
  getLiveOdds,
  getStandingsLive,
  getHead2Head,
  getTopScorers,
  getMatchHistory,
  getWorldCupParticipants,
};

export const livescoreApi = livescoreClient;

export type ParsedTeam = { name: string; flag: string; score: number; code: string };

export type ParsedLiveScore = {
  matchId: string;
  isLive: boolean;
  minute: number;
  home: ParsedTeam;
  away: ParsedTeam;
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  xg: { home: number; away: number };
};

export type ParsedUpcomingMatch = {
  matchId: string;
  home: ParsedTeam;
  away: ParsedTeam;
  kickoff: Date;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function teamFromUnknown(v: unknown, fallbackCode: string): ParsedTeam {
  const o = asRecord(v);
  const name = asString(o?.name) || fallbackCode;
  const code = asString(o?.code) || asString(o?.iso) || fallbackCode;
  const score = asNumber(o?.score, 0);
  const flag = asString(o?.flag) || asString(o?.emoji) || '';
  return { name, flag, score, code };
}

function extractMatchList(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = asRecord(root.data);
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(data?.match)) return data.match as unknown[];
  if (Array.isArray(data?.matches)) return data.matches as unknown[];
  if (Array.isArray(root.match)) return root.match as unknown[];
  return [];
}

export function parseLivePayload(payload: unknown): ParsedLiveScore | null {
  const list = extractMatchList(payload);
  const raw = list[0];
  const m = asRecord(raw);
  if (!m) return null;
  const home = teamFromUnknown(m.home ?? m.team1, 'HOME');
  const away = teamFromUnknown(m.away ?? m.team2, 'AWAY');
  const matchId = asString(m.id) || asString(m.match_id) || 'live';
  const minute = asNumber(m.minute, asNumber(m.time, 0));
  const possessionHome = asNumber(asRecord(m.possession)?.home, 50);
  const possessionAway = asNumber(asRecord(m.possession)?.away, 100 - possessionHome);
  const shotsHome = asNumber(asRecord(m.shots)?.home, 0);
  const shotsAway = asNumber(asRecord(m.shots)?.away, 0);
  const xgHome = asNumber(asRecord(m.xg)?.home, 0);
  const xgAway = asNumber(asRecord(m.xg)?.away, 0);
  return {
    matchId,
    isLive: true,
    minute,
    home,
    away,
    possession: { home: possessionHome, away: possessionAway },
    shots: { home: shotsHome, away: shotsAway },
    xg: { home: xgHome, away: xgAway },
  };
}

export function parseUpcomingFixture(payload: unknown): ParsedUpcomingMatch | null {
  const list = extractMatchList(payload);
  const now = Date.now();
  for (const raw of list) {
    const m = asRecord(raw);
    if (!m) continue;
    const dateStr = asString(m.date) || asString(m.kickoff);
    const timeStr = asString(m.time);
    const kickoff = new Date(dateStr && timeStr ? `${dateStr}T${timeStr}` : dateStr);
    if (Number.isNaN(kickoff.getTime()) || kickoff.getTime() <= now) continue;
    const home = teamFromUnknown(m.home ?? m.team1, 'HOME');
    const away = teamFromUnknown(m.away ?? m.team2, 'AWAY');
    return {
      matchId: asString(m.id) || asString(m.match_id) || 'upcoming',
      home,
      away,
      kickoff,
    };
  }
  return null;
}

export async function fetchCurrentLiveMatch(): Promise<ParsedLiveScore | null> {
  const payload = await getLiveMatches();
  return parseLivePayload(payload);
}

export async function fetchNextFixture(): Promise<ParsedUpcomingMatch | null> {
  const payload = await getFixtures();
  return parseUpcomingFixture(payload);
}

export async function fetchMatchEvents(matchId: string): Promise<ParsedApiMatchEvent[]> {
  return providerFetchMatchEvents(matchId);
}
