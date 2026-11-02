import { limitToLast, off, onValue, orderByChild, query, ref } from 'firebase/database';
import { getFirebaseRtdb } from './firebase';
import type { LiveMatch, MatchEngagement } from '../types/live.types';
import type { NationActivityRow } from './hubRtdbService';

const VIEWER_POLL_MS = 10_000;

function rtdbOrNull() {
  try {
    return getFirebaseRtdb();
  } catch {
    return null;
  }
}

function estimateViewers(homeCode: string, awayCode: string, nations: Record<string, NationActivityRow>): number {
  const h = nations[homeCode.toUpperCase()];
  const a = nations[awayCode.toUpperCase()];
  const base = (h?.supporterCount ?? 0) + (a?.supporterCount ?? 0);
  const activity = (h?.recentActivity ?? 0) + (a?.recentActivity ?? 0);
  return Math.max(base * 120, activity * 800, 12_000);
}

export function computeChaosLevel(messageCount: number, recentActivity: number): number {
  const raw = messageCount * 4 + recentActivity * 0.15;
  return Math.min(100, Math.round(raw));
}

export function engagementForMatch(
  match: LiveMatch,
  nations: Record<string, NationActivityRow>,
  messageCount: number
): MatchEngagement {
  const h = nations[match.home_country_code.toUpperCase()];
  const a = nations[match.away_country_code.toUpperCase()];
  const recentActivity = (h?.recentActivity ?? 0) + (a?.recentActivity ?? 0);
  return {
    viewerCount: estimateViewers(match.home_country_code, match.away_country_code, nations),
    messageCount,
    chaosLevel: computeChaosLevel(messageCount, recentActivity),
  };
}

export function subscribeNationsActivity(cb: (rows: Record<string, NationActivityRow>) => void): () => void {
  const db = rtdbOrNull();
  if (!db) {
    cb({});
    return () => undefined;
  }
  const r = ref(db, 'nations');
  const handler = onValue(r, (snap) => {
    cb((snap.val() as Record<string, NationActivityRow> | null) ?? {});
  });
  return () => off(r, 'value', handler);
}

export function subscribeMatchChatCount(matchId: string, cb: (count: number) => void): () => void {
  const db = rtdbOrNull();
  if (!db || !matchId) {
    cb(0);
    return () => undefined;
  }
  const qy = query(ref(db, `matches/${matchId}/chat`), orderByChild('timestamp'), limitToLast(80));
  const handler = onValue(qy, (snap) => {
    const val = snap.val() as Record<string, { timestamp?: number }> | null;
    if (!val) {
      cb(0);
      return;
    }
    const cutoff = Date.now() - 60_000;
    const recent = Object.values(val).filter((m) => {
      const ts = typeof m.timestamp === 'number' ? m.timestamp : 0;
      return ts >= cutoff;
    });
    cb(recent.length);
  });
  return () => off(qy, 'value', handler);
}

export function subscribeMatchViewerCount(matchId: string, cb: (count: number) => void): () => void {
  const db = rtdbOrNull();
  if (!db || !matchId) {
    cb(0);
    return () => undefined;
  }
  const r = ref(db, `matches/${matchId}/viewerCount`);
  const handler = onValue(r, (snap) => {
    const v = snap.val();
    cb(typeof v === 'number' ? v : 0);
  });
  return () => off(r, 'value', handler);
}

export { VIEWER_POLL_MS };
