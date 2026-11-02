import { useCallback, useEffect, useState } from 'react';
import { getH2HDetail } from '../services/footballService';
import {
  getLiveCommentary,
  getMatchEvents,
  getMatchLineups,
  getMatchStats,
  isFootballDataConfigured,
} from '../services/livescoreApi';
import type { H2HDetail } from '../services/footballService';
import { parseApiEvents, parsePremiumApiEvents } from '../services/liveMatchParsers';
import { mergePremiumEvents } from '../utils/liveMatchEventMap';
import type { PremiumMatchEvent } from '../types/liveMatchEvent';
import type { LiveMatch, MatchDetailBundle, MatchEvent } from '../types/live.types';
import { h2hDetailToParsedSummary, parseLiveMatchStats } from '../utils/liveMatchStatsParse';

const POLL_MS = 12_000;

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function parseCommentary(payload: unknown): string[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = asRecord(root.data) ?? root;
  const lines: string[] = [];
  for (const key of ['commentary', 'comment', 'line'] as const) {
    const v = data[key];
    if (Array.isArray(v)) {
      for (const row of v) {
        const o = asRecord(row);
        const text = typeof row === 'string' ? row : String(o?.text ?? o?.comment ?? '');
        if (text.trim()) lines.push(text.trim());
      }
      break;
    }
  }
  return lines.slice(-40);
}

export function useMatchDetails(match: LiveMatch | null) {
  const [bundle, setBundle] = useState<MatchDetailBundle>({
    stats: null,
    events: [],
    lineups: null,
    commentary: [],
    h2h: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [h2hDetail, setH2hDetail] = useState<H2HDetail | null>(null);
  const [h2hLoading, setH2hLoading] = useState(false);
  const [premiumEvents, setPremiumEvents] = useState<PremiumMatchEvent[]>(() =>
    match ? mergePremiumEvents([], match.events) : []
  );

  const fetchDetails = useCallback(async () => {
    if (!match || !isFootballDataConfigured()) return;
    setLoading(true);
    try {
      const [statsRes, eventsRes, lineupsRes, commentaryRes] = await Promise.all([
        getMatchStats(match.id),
        getMatchEvents(match.id),
        getMatchLineups(match.id),
        getLiveCommentary(match.id),
      ]);
      const events: MatchEvent[] = parseApiEvents(
        eventsRes,
        match.home_team_id,
        match.away_team_id,
        match.home_country_code,
        match.away_country_code
      );
      const apiPremium = parsePremiumApiEvents(
        eventsRes,
        match.home_team_id,
        match.away_team_id,
        match.home_country_code,
        match.away_country_code
      );
      setPremiumEvents(mergePremiumEvents(apiPremium, [...match.events, ...events]));
      setBundle({
        stats: asRecord(statsRes),
        events,
        lineups: asRecord(lineupsRes),
        commentary: parseCommentary(commentaryRes),
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
    if (!match?.home_country_code || !match?.away_country_code) {
      setH2hDetail(null);
      return;
    }
    setH2hLoading(true);
    try {
      const detail = await getH2HDetail(match.home_country_code, match.away_country_code);
      setH2hDetail(detail);
    } catch {
      setH2hDetail(null);
    } finally {
      setH2hLoading(false);
    }
  }, [match?.away_country_code, match?.home_country_code]);

  useEffect(() => {
    if (match) {
      setPremiumEvents((prev) => mergePremiumEvents(prev, match.events));
    }
  }, [match?.id, match?.events]);

  useEffect(() => {
    void fetchDetails();
    if (!match) return undefined;
    const id = setInterval(() => void fetchDetails(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchDetails, match?.id]);

  useEffect(() => {
    void fetchH2h();
  }, [fetchH2h]);

  const parsedStats = parseLiveMatchStats(bundle.stats);
  const parsedH2H = h2hDetailToParsedSummary(h2hDetail);

  return {
    bundle,
    premiumEvents,
    parsedStats,
    parsedH2H,
    h2hDetail,
    h2hLoading,
    loading,
    error,
    refetch: fetchDetails,
    refetchH2h: fetchH2h,
  };
}
