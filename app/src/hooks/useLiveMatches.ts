import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { engagementForMatch, subscribeMatchChatCount, subscribeNationsActivity } from '../services/liveFirebaseService';
import { fetchUnitedLiveSection } from '../services/liveUnitedService';
import type { LiveFilterKey, LiveMatch, MatchEngagement } from '../types/live.types';
import { filterMatchByPhase, pickFeaturedMatch } from '../utils/liveMatchUtils';
import type { NationActivityRow } from '../services/hubRtdbService';

const POLL_MS = 20_000;

export type LiveMatchesStatus = 'loading' | 'ready' | 'upcoming' | 'empty' | 'error' | 'disabled';

export function useLiveMatches(filter: LiveFilterKey = 'all') {
  const [status, setStatus] = useState<LiveMatchesStatus>('loading');
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<LiveMatch[]>([]);
  const [recentMatches, setRecentMatches] = useState<LiveMatch[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nations, setNations] = useState<Record<string, NationActivityRow>>({});
  const [chatCounts, setChatCounts] = useState<Record<string, number>>({});
  const featuredFallback = useRef<LiveMatch | null>(null);

  const fetchMatches = useCallback(async (silent: boolean) => {
    if (!silent) setStatus('loading');
    setUpcomingLoading(true);
    try {
      const section = await fetchUnitedLiveSection(!silent);
      setMatches(section.live);
      setUpcomingMatches(section.upcoming);
      setRecentMatches(section.recent);
      featuredFallback.current = section.featured;
      setError(null);

      if (section.live.length) {
        setStatus('ready');
      } else if (section.upcoming.length || section.recent.length) {
        setStatus(section.upcoming.length ? 'upcoming' : 'ready');
      } else {
        setStatus('empty');
      }
    } catch {
      setError('Impossible de charger les matchs United');
      setStatus('error');
    } finally {
      setUpcomingLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMatches(false);
    const id = setInterval(() => void fetchMatches(true), POLL_MS);
    return () => clearInterval(id);
  }, [fetchMatches]);

  useEffect(() => subscribeNationsActivity(setNations), []);

  useEffect(() => {
    const unsubs = matches.slice(0, 10).map((m) =>
      subscribeMatchChatCount(m.id, (count) => {
        setChatCounts((prev) => ({ ...prev, [m.id]: count }));
      })
    );
    return () => {
      unsubs.forEach((u) => u());
    };
  }, [matches]);

  const engagementById = useMemo(() => {
    const map: Record<string, MatchEngagement> = {};
    for (const m of [...matches, ...upcomingMatches, ...recentMatches]) {
      map[m.id] = engagementForMatch(m, nations, chatCounts[m.id] ?? 0);
    }
    return map;
  }, [matches, upcomingMatches, recentMatches, nations, chatCounts]);

  const pool = useMemo(() => {
    if (filter === 'upcoming') return upcomingMatches;
    if (filter === 'played') return recentMatches;
    if (filter === 'live') return matches;
    // all / comps : live + upcoming + récents
    const seen = new Set<string>();
    const out: LiveMatch[] = [];
    for (const m of [...matches, ...upcomingMatches, ...recentMatches]) {
      if (seen.has(m.id)) continue;
      if (!filterMatchByPhase(m, filter)) continue;
      seen.add(m.id);
      out.push(m);
    }
    return out;
  }, [filter, matches, upcomingMatches, recentMatches]);

  const filteredUpcoming = useMemo(
    () => upcomingMatches.filter((m) => filter === 'all' || filter === 'upcoming' || filterMatchByPhase(m, filter)),
    [upcomingMatches, filter]
  );

  const featuredMatch = useMemo(() => {
    const liveFeatured = pickFeaturedMatch(
      matches.filter((m) => filter === 'all' || filter === 'live' || filterMatchByPhase(m, filter)),
      engagementById
    );
    if (liveFeatured) return liveFeatured;
    if (filter === 'played') return pool[0] ?? null;
    if (filter === 'upcoming') return filteredUpcoming[0] ?? null;
    return featuredFallback.current;
  }, [matches, filter, engagementById, pool, filteredUpcoming]);

  const otherMatches = useMemo(() => {
    if (!featuredMatch) return pool;
    return pool.filter((m) => m.id !== featuredMatch.id);
  }, [pool, featuredMatch]);

  return {
    matches: pool,
    upcomingMatches: filteredUpcoming,
    recentMatches,
    featuredMatch,
    otherMatches,
    engagementById,
    loading: status === 'loading',
    upcomingLoading,
    status,
    error,
    refetch: () => void fetchMatches(false),
  };
}

/** Détecte un nouveau but pour animation carte. */
export function useGoalFlashDetector(match: LiveMatch | null): boolean {
  const prev = useRef<{ h: number; a: number } | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!match || match.status === 'upcoming') return;
    const cur = { h: match.home_score, a: match.away_score };
    if (prev.current && (cur.h > prev.current.h || cur.a > prev.current.a)) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1200);
      prev.current = cur;
      return () => clearTimeout(t);
    }
    prev.current = cur;
  }, [match?.away_score, match?.home_score, match?.id, match?.status]);

  return flash;
}
