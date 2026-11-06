import { useCallback, useEffect, useState } from 'react';
import {
  getUnitedTopAssisters,
  type UnitedPlayerStatRow,
} from '../services/unitedPlayerStats';

const POLL_MS = 300_000;

export type HybridTopAssister = {
  name: string;
  team: string;
  assists: number;
  photo?: string;
  fotmobId?: number;
};

/** Meilleurs passeurs Manchester United (saison en cours). */
export function useTopAssisters(limit = 5) {
  const [rows, setRows] = useState<HybridTopAssister[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnce = useCallback(async () => {
    try {
      const list: UnitedPlayerStatRow[] = await getUnitedTopAssisters(limit);
      setRows(
        list.map((r) => ({
          name: r.name,
          team: r.team,
          assists: r.value,
          photo: r.photo,
          fotmobId: r.fotmobId,
        }))
      );
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
