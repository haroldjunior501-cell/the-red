import { useCallback, useEffect, useState } from 'react';
import { fetchMatchH2H } from '../services/fotmobClubApi';
import { fetchFotmobLiveMatchDetails } from '../services/fotmobLiveMatchDetails';
import type { H2HDetail } from '../services/footballService';
import { mergePremiumEvents } from '../utils/liveMatchEventMap';
import type { PremiumMatchEvent } from '../types/liveMatchEvent';
import type { LiveMatch, MatchDetailBundle } from '../types/live.types';
import { h2hDetailToParsedSummary, type ParsedLiveMatchStats } from '../utils/liveMatchStatsParse';

const POLL_MS = 12_000;

export function useMatchDetails(match: LiveMatch | null) {
  const [bundle, setBundle] = useState<MatchDetailBundle>({
    stats: null,
    events: [],
    lineups: null,
    commentary: [],
    h2h: null,
  });
  const [parsedStats, setParsedStats] = useState<ParsedLiveMatchStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [h2hDetail, setH2hDetail] = useState<H2HDetail | null>(null);
  const [h2hLoading, setH2hLoading] = useState(false);
  const [premiumEvents, setPremiumEvents] = useState<PremiumMatchEvent[]>(() =>
    match ? mergePremiumEvents([], match.events) : []
  );
  const [liveScore, setLiveScore] = useState<{
    home: number;
    away: number;
    minute: string;
    status: LiveMatch['status'];
  } | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!match?.id) return;
    setLoading(true);
    try {
      const detail = await fetchFotmobLiveMatchDetails(match.id, true);
      if (!detail) {
        setError('Détails indisponibles');
        return;
      }
      setPremiumEvents(mergePremiumEvents(detail.premiumEvents, [...match.events, ...detail.events]));
      setParsedStats(detail.stats);
      setLiveScore({
        home: detail.homeScore,
        away: detail.awayScore,
        minute: detail.minute,
        status: detail.status,
      });
      setBundle({
        stats: detail.stats as unknown as Record<string, unknown> | null,
        events: detail.events,
        lineups: detail.lineups,
        commentary: [],
        h2h: null,
      });
      setError(null);
    } catch {
      setError('Détails indisponibles');
    } finally {
      setLoading(false);
    }
  }, [match]);

  const fetchH2h = useCallback(async () => {
    if (!match?.id) {
      setH2hDetail(null);
      return;
    }
    setH2hLoading(true);
    try {
      const detail = await fetchMatchH2H(match.id);
      setH2hDetail(detail);
    } catch {
      setH2hDetail(null);
    } finally {
      setH2hLoading(false);
    }
  }, [match?.id]);

  useEffect(() => {
    if (match) {
      setPremiumEvents((prev) => mergePremiumEvents(prev, match.events));
    }
  }, [match?.id, match?.events]);

  useEffect(() => {
    void fetchDetails();
    if (!match) return undefined;
    const live =
      match.status === 'live' ||
      match.status === 'halftime' ||
      match.status === 'extra_time' ||
      match.status === 'penalties';
    if (!live) return undefined;
    const id = setInterval(() => void fetchDetails(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchDetails, match?.id, match?.status]);

  useEffect(() => {
    void fetchH2h();
  }, [fetchH2h]);

  const parsedH2H = h2hDetailToParsedSummary(h2hDetail);

  return {
    bundle,
    premiumEvents,
    parsedStats,
    parsedH2H,
    h2hDetail,
    h2hLoading,
    liveScore,
    loading,
    error,
    refetch: fetchDetails,
    refetchH2h: fetchH2h,
  };
}
