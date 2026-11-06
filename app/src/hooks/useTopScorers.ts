import { useCallback, useEffect, useState } from 'react';
import {
  getUnitedTopScorers,
  type UnitedPlayerStatRow,
} from '../services/unitedPlayerStats';

const POLL_MS = 300_000;

export type HybridTopScorer = {
  name: string;
  team: string;
  goals: number;
  photo?: string;
  fotmobId?: number;
};

/** Meilleurs buteurs Manchester United (saison en cours). */
export function useTopScorers(limit = 5) {
  const [rows, setRows] = useState<HybridTopScorer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnce = useCallback(async () => {
    try {
      const list: UnitedPlayerStatRow[] = await getUnitedTopScorers(limit);
      setRows(
        list.map((r) => ({
          name: r.name,
          team: r.team,
          goals: r.value,
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
