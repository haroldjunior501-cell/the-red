import { useCallback, useEffect, useState } from 'react';
import { isFootballDataConfigured } from '../services/footballDataProvider';
import { getHybridTopAssisters } from '../services/footballHybridService';
import type { HybridTopAssister } from '../services/footballHybridService';

const POLL_MS = 300_000;

export function useTopAssisters(limit = 5) {
  const [rows, setRows] = useState<HybridTopAssister[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnce = useCallback(async () => {
    if (!isFootballDataConfigured()) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      setRows(await getHybridTopAssisters(limit));
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
