import { useCallback, useEffect, useState } from 'react';
import type { TeamStatKind } from '../constants/homeStats';
import { isFootballDataConfigured } from '../services/footballDataProvider';
import { getTeamStatsRanking, type TeamRankingRow } from '../services/teamStatsRanking';

const POLL_MS = 300_000;

export function useTeamStatsRanking(kind: TeamStatKind, limit = 30) {
  const [rows, setRows] = useState<TeamRankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnce = useCallback(async () => {
    if (!isFootballDataConfigured()) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      setRows(await getTeamStatsRanking(kind, limit));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [kind, limit]);

  useEffect(() => {
    setLoading(true);
    void fetchOnce();
    const id = setInterval(() => void fetchOnce(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchOnce]);

  return { rows, loading, refetch: fetchOnce };
}
