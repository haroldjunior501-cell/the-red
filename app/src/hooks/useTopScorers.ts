import { useCallback, useEffect, useState } from 'react';
import { isFootballDataConfigured } from '../services/footballDataProvider';
import { getHybridTopScorers } from '../services/footballHybridService';
import type { HybridTopScorer } from '../services/footballHybridService';

const POLL_MS = 300_000;

export function useTopScorers(limit = 5) {
  const [rows, setRows] = useState<HybridTopScorer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnce = useCallback(async () => {
    if (!isFootballDataConfigured()) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      setRows(await getHybridTopScorers(limit));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchOnce();
    const id = setInterval(() => void fetchOnce(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchOnce]);

  return { rows, loading };
}
