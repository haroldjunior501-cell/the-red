import { useEffect, useMemo, useState } from 'react';
import { loadPronos } from '../services/gamesService';
import { useNationPower } from './useNationPower';
import { useUserStore } from '../store/useUserStore';

export type ProfileStats = {
  nationPoints: number;
  worldRank: number;
  goodPronos: number;
  accuracyPct: number;
  loading: boolean;
};

export function useProfileStats(): ProfileStats {
  const userId = useUserStore((s) => s.userId);
  const { power, worldRank } = useNationPower();
  const [goodPronos, setGoodPronos] = useState(0);
  const [accuracyPct, setAccuracyPct] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setGoodPronos(0);
      setAccuracyPct(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    void loadPronos(userId).then((pronos) => {
      if (cancelled) return;
      const list = Object.values(pronos);
      const awarded = list.filter((p) => (p.pointsAwarded ?? 0) > 0);
      const total = list.length;
      setGoodPronos(awarded.length);
      setAccuracyPct(total > 0 ? Math.round((awarded.length / total) * 100) : 0);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return useMemo(
    () => ({
      nationPoints: power?.power ?? 0,
      worldRank,
      goodPronos,
      accuracyPct,
      loading,
    }),
    [power?.power, worldRank, goodPronos, accuracyPct, loading]
  );
}
