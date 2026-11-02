import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMatchEvents, getLiveMatches, isFootballDataConfigured } from '../services/livescoreApi';
import {
  engagementForMatch,
  subscribeMatchChatCount,
  subscribeNationsActivity,
} from '../services/liveFirebaseService';
import { parseApiEvents, parseMatchList } from '../services/liveMatchParsers';
import {
  fetchFotmobLiveMatches,
  fetchFotmobUpcomingMatches,
  fetchLiveSectionFromFotmob,
} from '../services/liveFotmobService';
import { isFotmobFootballReachable } from '../services/fotmobFootballApi';
import type { LiveFilterKey, LiveMatch, MatchEngagement } from '../types/live.types';
import { filterMatchByPhase, pickFeaturedMatch } from '../utils/liveMatchUtils';
import { mergeWithLocalWorldCupCalendar } from '../utils/wc2026LiveFallback';
import type { NationActivityRow } from '../services/hubRtdbService';

const POLL_MS = 30_000;

export type LiveMatchesStatus = 'loading' | 'ready' | 'upcoming' | 'empty' | 'error' | 'disabled';

function liveSectionEnabled(): boolean {
  return isFotmobFootballReachable() || isFootballDataConfigured();
}

export function useLiveMatches(filter: LiveFilterKey = 'all') {
  const [status, setStatus] = useState<LiveMatchesStatus>('loading');
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<LiveMatch[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nations, setNations] = useState<Record<string, NationActivityRow>>({});
  const [chatCounts, setChatCounts] = useState<Record<string, number>>({});

  const fetchUpcoming = useCallback(async (): Promise<number> => {
    setUpcomingLoading(true);
    try {
      const fixtures = await fetchFotmobUpcomingMatches();
      setUpcomingMatches(fixtures);
      return fixtures.length;
    } catch {
      setUpcomingMatches([]);
      return 0;
    } finally {
      setUpcomingLoading(false);
    }
  }, []);

  const enrichLiveEvents = useCallback(async (base: LiveMatch[]): Promise<LiveMatch[]> => {
    if (!isFootballDataConfigured()) return base;
    return Promise.all(
      base.map(async (m) => {
        try {
          const evPayload = await getMatchEvents(m.id);
          const events = parseApiEvents(
            evPayload,
            m.home_team_id,
            m.away_team_id,
            m.home_country_code,
            m.away_country_code
          );
          return { ...m, events };
        } catch {
          return m;
        }
      })
    );
  }, []);

  const fetchMatches = useCallback(
    async (silent: boolean) => {
      if (!silent) setStatus('loading');
      try {
        let base: LiveMatch[] = [];
        let upcoming: LiveMatch[] = [];

        if (liveSectionEnabled() && isFotmobFootballReachable()) {
          try {
            const fotmob = await fetchLiveSectionFromFotmob();
            base = fotmob.live;
            upcoming = fotmob.upcoming;
          } catch {
            const [live, up] = await Promise.all([
              fetchFotmobLiveMatches().catch(() => [] as LiveMatch[]),
              fetchFotmobUpcomingMatches().catch(() => [] as LiveMatch[]),
            ]);
            base = live;
            upcoming = up;
          }
        } else if (liveSectionEnabled()) {
          upcoming = await fetchFotmobUpcomingMatches().catch(() => []);
        }

        if (!base.length && isFootballDataConfigured()) {
          const res = await getLiveMatches();
          base = parseMatchList(res);
        }

        const merged = mergeWithLocalWorldCupCalendar(base, upcoming);
        base = merged.live;
        upcoming = merged.upcoming;
        setUpcomingMatches(upcoming);

        const enriched = await enrichLiveEvents(base);
        setMatches(enriched);
        setError(null);

        if (enriched.length) {
          setStatus('ready');
        } else if (upcoming.length) {
          setStatus('upcoming');
        } else {
          const upcomingCount = await fetchUpcoming();
          if (upcomingCount > 0) {
            setStatus('upcoming');
          } else {
            const local = mergeWithLocalWorldCupCalendar([], []);
            setUpcomingMatches(local.upcoming);
            setMatches(local.live);
            setStatus(local.live.length ? 'ready' : local.upcoming.length ? 'upcoming' : 'empty');
          }
        }
      } catch {
        const local = mergeWithLocalWorldCupCalendar([], []);
        setMatches(local.live);
        setUpcomingMatches(local.upcoming);
        setError(local.upcoming.length || local.live.length ? null : 'Impossible de charger les matchs');
        setStatus(local.live.length ? 'ready' : local.upcoming.length ? 'upcoming' : 'error');
      }
    },
    [enrichLiveEvents, fetchUpcoming]
  );

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
    for (const m of matches) {
      map[m.id] = engagementForMatch(m, nations, chatCounts[m.id] ?? 0);
    }
    return map;
  }, [matches, nations, chatCounts]);

  const filtered = useMemo(
    () => matches.filter((m) => filterMatchByPhase(m, filter)),
    [matches, filter]
  );

  const filteredUpcoming = useMemo(
    () => upcomingMatches.filter((m) => filterMatchByPhase(m, filter)),
    [upcomingMatches, filter]
  );

  const featuredMatch = useMemo(
    () => pickFeaturedMatch(filtered, engagementById),
    [filtered, engagementById]
  );

  const otherMatches = useMemo(() => {
    if (!featuredMatch) return filtered;
    return filtered.filter((m) => m.id !== featuredMatch.id);
  }, [filtered, featuredMatch]);

  return {
    matches: filtered,
    upcomingMatches: filteredUpcoming,
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
