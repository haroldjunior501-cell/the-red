import { useCallback, useEffect, useState } from 'react';
import { RANKING_PREVIEW_SIZE } from '../constants/simulator';
import { fetchRankingPage } from '../services/simulatorService';
import type { RankingFilter, SimulatorRankingEntry } from '../types/arena.types';

const EMPTY_FRIEND_IDS: string[] = [];

export function useArenaRanking(
  filter: RankingFilter,
  userId: string,
  userName: string,
  country: string,
  friendIds: string[] = EMPTY_FRIEND_IDS
) {
  const [entries, setEntries] = useState<SimulatorRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchRankingPage(filter, {
        userId,
        userName,
        country,
        friendIds,
        pageSize: RANKING_PREVIEW_SIZE,
      });
      setEntries(page.entries);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filter, userId, userName, country, friendIds]);

  useEffect(() => {
    void load();
  }, [load]);

  return { entries, loading, refresh: load };
}
