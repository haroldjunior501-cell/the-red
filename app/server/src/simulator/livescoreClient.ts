import axios from 'axios';
import { WC_COMPETITION_ID, WC_SEASON } from './constants.js';
import { extractMatchRows, parseMatchEvents } from './eventParser.js';

const BASE_URL = 'https://livescore-api.com/api-client';

function authParams(): Record<string, string> {
  return {
    key: process.env.LIVESCORE_KEY?.trim() || process.env.EXPO_PUBLIC_LIVESCORE_KEY?.trim() || '',
    secret:
      process.env.LIVESCORE_SECRET?.trim() || process.env.EXPO_PUBLIC_LIVESCORE_SECRET?.trim() || '',
    competition_id: WC_COMPETITION_ID,
  };
}

const client = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

async function safeGet(path: string, extra: Record<string, string> = {}): Promise<unknown> {
  const { data } = await client.get<unknown>(path, { params: { ...authParams(), ...extra } });
  return data;
}

export function isLivescoreConfigured(): boolean {
  const p = authParams();
  return Boolean(p.key && p.secret);
}

export async function fetchLiveMatches(): Promise<Record<string, unknown>[]> {
  const payload = await safeGet('/matches/live.json');
  return extractMatchRows(payload);
}

export async function fetchMatchEvents(matchId: string): Promise<ReturnType<typeof parseMatchEvents>> {
  const payload = await safeGet('/scores/events.json', { match_id: matchId });
  return parseMatchEvents(payload);
}

export function matchIdFromRow(row: Record<string, unknown>): string {
  return String(row.id ?? row.match_id ?? row.fixture_id ?? '');
}

export function isRowLive(row: Record<string, unknown>): boolean {
  const status = String(row.status ?? row.time ?? '').toUpperCase();
  const minute = Number(row.minute ?? row.min ?? 0);
  if (status === 'FT' || status === 'FINISHED' || status === 'ENDED') return false;
  if (
    minute > 0 ||
    status.includes('LIVE') ||
    status === '1H' ||
    status === '2H' ||
    status === 'HT' ||
    status.includes('HALF')
  ) {
    return true;
  }
  return false;
}

export async function fetchTodayFixtures(): Promise<Record<string, unknown>[]> {
  const payload = await safeGet('/fixtures/matches.json', { season: WC_SEASON });
  return extractMatchRows(payload);
}
