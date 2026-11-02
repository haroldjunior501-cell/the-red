/**
 * Appels HTTP bruts Live Score API (secours) — ne pas importer depuis les écrans.
 */
import axios, { type AxiosInstance } from 'axios';
import { WC_COMPETITION_ID, WC_SEASON } from '../constants/worldCupLiveScore';

const BASE_URL = 'https://livescore-api.com/api-client';

function authParams(): Record<string, string> {
  return {
    key: process.env.EXPO_PUBLIC_LIVESCORE_KEY ?? '',
    secret: process.env.EXPO_PUBLIC_LIVESCORE_SECRET ?? '',
    competition_id: WC_COMPETITION_ID,
  };
}

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 12_000,
});

async function safeGet(path: string, extra: Record<string, string> = {}): Promise<unknown> {
  const { data } = await client.get<unknown>(path, { params: { ...authParams(), ...extra } });
  return data;
}

export function isLivescoreConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_LIVESCORE_KEY?.trim() && process.env.EXPO_PUBLIC_LIVESCORE_SECRET?.trim());
}

export async function rawGetLiveMatches(): Promise<unknown> {
  return safeGet('/matches/live.json');
}

export async function rawGetFixtures(groupId?: string): Promise<unknown> {
  const extra: Record<string, string> = { season: WC_SEASON };
  if (groupId != null && groupId !== '') extra.group_id = groupId;
  return safeGet('/fixtures/matches.json', extra);
}

export async function rawGetMatchStats(matchId: string): Promise<unknown> {
  return safeGet('/scores/statistics.json', { match_id: matchId });
}

export async function rawGetMatchEvents(matchId: string): Promise<unknown> {
  return safeGet('/scores/events.json', { match_id: matchId });
}

export async function rawGetMatchLineups(matchId: string): Promise<unknown> {
  return safeGet('/scores/lineups.json', { match_id: matchId });
}

export async function rawGetLiveCommentary(matchId: string): Promise<unknown> {
  return safeGet('/scores/commentary.json', { match_id: matchId });
}

export async function rawGetLiveOdds(matchId: string): Promise<unknown> {
  return safeGet('/odds/live.json', { match_id: matchId });
}

export async function rawGetLiveStandings(groupId: string): Promise<unknown> {
  return safeGet('/standings/live.json', { group_id: groupId });
}

export async function rawGetGroupStandings(groupId: string): Promise<unknown> {
  return safeGet('/groups/table.json', { group_id: groupId });
}

export async function rawGetHead2Head(team1: string, team2: string): Promise<unknown> {
  return safeGet('/matches/head2head.json', { team1, team2 });
}

export async function rawGetTopScorers(): Promise<unknown> {
  return safeGet('/competitions/goalscorers.json');
}

export async function rawGetMatchHistory(extra: Record<string, string> = {}): Promise<unknown> {
  return safeGet('/matches/history.json', extra);
}

export async function rawGetWorldCupParticipants(): Promise<unknown> {
  return safeGet('/competitions/participants.json', { season: WC_SEASON });
}

export async function rawGetFixturesList(extra: Record<string, string> = {}): Promise<unknown> {
  return safeGet('/fixtures/list.json', { season: WC_SEASON, ...extra });
}

export async function rawGetStandingsLive(extra: Record<string, string> = {}): Promise<unknown> {
  return safeGet('/standings/live.json', extra);
}

export async function rawGetStandings(groupId: string): Promise<unknown> {
  try {
    return await rawGetGroupStandings(groupId);
  } catch {
    return rawGetLiveStandings(groupId);
  }
}
