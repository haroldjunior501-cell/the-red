/**
 * Client FotMob partagé — porté depuis FootballIntelligence `lib/fotmob/http.ts`.
 * Compatible React Native / Expo (pas de cache Next.js).
 */
import { FOTMOB_API_BASE } from '../constants/fotmobWorldCup';
import { fotmobPlayerImageUrl, fotmobTeamLogoUrl } from '../constants/fotmob';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const FOTMOB_FETCH_HEADERS: Record<string, string> = {
  'User-Agent': UA,
  Accept: 'application/json',
  Referer: 'https://www.fotmob.com/',
  Origin: 'https://www.fotmob.com',
};

const mem = new Map<string, { at: number; body: unknown }>();
const DEFAULT_TTL = 1000 * 60 * 5;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fotmobGet(
  path: string,
  opts?: { ttlMs?: number; force?: boolean }
): Promise<unknown> {
  const url = path.startsWith('http')
    ? path
    : `${FOTMOB_API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const now = Date.now();
  const ttl = opts?.ttlMs ?? DEFAULT_TTL;
  const hit = mem.get(url);
  if (!opts?.force && hit && now - hit.at < ttl) return hit.body;

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: FOTMOB_FETCH_HEADERS });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`FotMob ${res.status}`);
        await sleep(400 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`FotMob ${res.status}`);
      const body = await res.json();
      mem.set(url, { at: now, body });
      return body;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error('FotMob réseau');
      await sleep(350 * (attempt + 1));
    }
  }
  throw lastErr ?? new Error('FotMob indisponible');
}

export function rec(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

export function num(v: unknown, fallback: number | null = null): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.replace('%', '').replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : v != null ? String(v) : fallback;
}

export function teamLogo(id: number | string | undefined): string | undefined {
  if (id == null || id === '' || id === '0') return undefined;
  return fotmobTeamLogoUrl(id);
}

export function playerPhoto(id: number | string | null | undefined): string | undefined {
  if (id == null || id === '' || id === '0') return undefined;
  return fotmobPlayerImageUrl(id);
}

export function clearFotmobHttpCache() {
  mem.clear();
}
