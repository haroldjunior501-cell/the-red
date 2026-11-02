import { useCallback, useEffect, useState } from 'react';
import { fetchHubMatchFeed } from '../services/hubMatchFeed';
import {
  getMatchStats,
  isFootballDataConfigured,
  type ParsedLiveScore,
  type ParsedUpcomingMatch,
} from '../services/livescoreApi';

const LIVE_POLL_MS = 30_000;
const STATS_POLL_MS = 60_000;

export type LiveScoreStatus = 'loading' | 'ready' | 'empty' | 'error' | 'upcoming' | 'disabled';

export function useLiveScore(enabled = true, userCountry = '') {
  const [status, setStatus] = useState<LiveScoreStatus>(enabled ? 'loading' : 'empty');
  const [live, setLive] = useState<ParsedLiveScore | null>(null);
  const [upcoming, setUpcoming] = useState<ParsedUpcomingMatch | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(
    async (silent: boolean) => {
      if (!enabled) {
        setStatus('empty');
        setLive(null);
        setUpcoming(null);
        setErrorMessage(null);
        return;
      }
      if (!silent) {
        setStatus('loading');
        setErrorMessage(null);
      }
      try {
        const feed = await fetchHubMatchFeed(userCountry);
        if (feed.live) {
          setLive(feed.live);
          setUpcoming(feed.upcoming);
          setStatus('ready');
          return;
        }
        if (feed.upcoming) {
          setLive(null);
          setUpcoming(feed.upcoming);
          setStatus('upcoming');
          return;
        }
        setLive(null);
        setUpcoming(null);
        setStatus('empty');
        setErrorMessage(null);
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : 'Erreur chargement match');
        setStatus('error');
      }
    },
    [enabled, userCountry]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    void refresh(false);
    const id = setInterval(() => {
      void refresh(true);
    }, LIVE_POLL_MS);
    return () => clearInterval(id);
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || !live?.matchId || !isFootballDataConfigured()) return undefined;
    const pullStats = async () => {
      try {
        const payload = await getMatchStats(live.matchId);
        const root = payload as {
          data?: {
            possession?: { home?: number; away?: number };
            shots?: { home?: number; away?: number };
            xg?: { home?: number; away?: number };
          };
        };
        const data = root?.data;
        if (!data) return;
        setLive((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            possession: {
              home: data.possession?.home ?? prev.possession.home,
              away: data.possession?.away ?? prev.possession.away,
            },
            shots: {
              home: data.shots?.home ?? prev.shots.home,
              away: data.shots?.away ?? prev.shots.away,
            },
            xg: {
              home: data.xg?.home ?? prev.xg.home,
              away: data.xg?.away ?? prev.xg.away,
            },
          };
        });
      } catch {
        /* stats optionnelles */
      }
    };
    void pullStats();
    const id = setInterval(() => {
      void pullStats();
    }, STATS_POLL_MS);
    return () => clearInterval(id);
  }, [enabled, live?.matchId]);

  return { status, live, upcoming, errorMessage, refresh: () => void refresh(false) };
}
