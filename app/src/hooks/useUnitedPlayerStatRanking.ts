import { useCallback, useEffect, useState } from 'react';
import type { PlayerStatKind } from '../constants/homeStats';
import {
  getUnitedPlayerStats,
  type UnitedPlayerStatRow,
} from '../services/unitedPlayerStats';

const POLL_MS = 300_000;

export function useUnitedPlayerStatRanking(kind: PlayerStatKind, limit = 20) {
  const [rows, setRows] = useState<UnitedPlayerStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnce = useCallback(async () => {
    try {
      setRows(await getUnitedPlayerStats(kind, limit));
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

  return { rows, loading };
}
