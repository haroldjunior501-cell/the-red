import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getMatchEvents,
  getMatchStats,
  getLiveMatches,
  isFootballDataConfigured,
} from '../services/livescoreApi';
import {
  subscribeToLiveEvents,
  sendGlobalGiftEvent,
  type LiveEventRow,
} from '../services/mapService';
import { useUserStore } from '../store/useUserStore';

export type MatchScore = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  isLive: boolean;
};

export type MatchStat = {
  label: string;
  home: string | number;
  away: string | number;
};

export type MatchEvent = {
  id: string;
  minute: string;
  type: string;
  team: string;
  player: string;
};

export type ArenaDataState = {
  score: MatchScore | null;
  stats: MatchStat[];
  events: MatchEvent[];
  lineups: { home: string[]; away: string[] };
  recentGifts: LiveEventRow[];
  loading: boolean;
  apiConfigured: boolean;
  sendGift: (gift: string, team: string) => Promise<void>;
};

export function useArenaData(stadiumId: string | null, matchId?: string): ArenaDataState {
  const userName = useUserStore((s) => s.name);
  const apiOk = isFootballDataConfigured();

  const [score,       setScore]       = useState<MatchScore | null>(null);
  const [stats,       setStats]       = useState<MatchStat[]>([]);
  const [events,      setEvents]      = useState<MatchEvent[]>([]);
  const [lineups,     setLineups]     = useState<{ home: string[]; away: string[] }>({ home: [], away: [] });
  const [recentGifts, setRecentGifts] = useState<LiveEventRow[]>([]);
  const [loading,     setLoading]     = useState(false);

  // Polling matchs live (30s)
  const fetchLive = useCallback(async () => {
    if (!apiOk || !stadiumId) return;
    setLoading(true);
    try {
      await getLiveMatches();
      // Future: map response to MatchScore
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [apiOk, stadiumId]);

  // Polling stats (60s)
  const fetchStats = useCallback(async () => {
    if (!apiOk || !matchId) return;
    try {
      await getMatchStats(matchId);
      // Future: map response to MatchStat[]
    } catch { /* silent */ }
  }, [apiOk, matchId]);

  // Polling events (15s)
  const fetchEvents = useCallback(async () => {
    if (!apiOk || !matchId) return;
    try {
      await getMatchEvents(matchId);
      // Future: map response to MatchEvent[]
    } catch { /* silent */ }
  }, [apiOk, matchId]);

  useEffect(() => {
    if (!stadiumId) return;
    void fetchLive();
    void fetchStats();
    void fetchEvents();
    const t1 = setInterval(() => void fetchLive(),   30_000);
    const t2 = setInterval(() => void fetchStats(),  60_000);
    const t3 = setInterval(() => void fetchEvents(), 15_000);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, [stadiumId, fetchLive, fetchStats, fetchEvents]);

  // Cadeaux récents depuis Firebase
  useEffect(() => {
    const unsub = subscribeToLiveEvents((evts) => {
      setRecentGifts(evts.filter((e) => e.type === 'gift').slice(0, 5));
    });
    return () => unsub();
  }, []);

  const sendGift = async (gift: string, team: string) => {
    await sendGlobalGiftEvent({
      userName: userName || 'Supporter',
      gift, team, power: 5,
    });
  };

  return { score, stats, events, lineups, recentGifts, loading, apiConfigured: apiOk, sendGift };
}

// Unused refs suppression
void useRef;
