import { useCallback, useEffect, useRef, useState } from 'react';
import type { DocumentSnapshot } from 'firebase/firestore';
import { fetchRankingPage, fetchUserRanking } from '../services/simulatorService';
import type { RankingFilter, SimulatorRankingEntry } from '../types/arena.types';

const EMPTY_FRIEND_IDS: string[] = [];

export function useFullRanking(
  filter: RankingFilter,
  userId: string,
  userName: string,
  country: string,
  friendIds: string[] = EMPTY_FRIEND_IDS
) {
  const [entries, setEntries] = useState<SimulatorRankingEntry[]>([]);
  const [myRanking, setMyRanking] = useState<SimulatorRankingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);

  const loadMyRank = useCallback(async () => {
    if (!userId) return;
    const mine = await fetchUserRanking(userId);
    setMyRanking(mine);
  }, [userId]);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    lastDocRef.current = null;
    try {
      const [page, mine] = await Promise.all([
        fetchRankingPage(filter, { userId, userName, country, friendIds }),
        fetchUserRanking(userId),
      ]);
      setEntries(page.entries);
      setHasMore(page.hasMore);
      lastDocRef.current = page.lastDoc;
      setMyRanking(mine);
    } catch {
      setError('Impossible de charger le classement.');
      setEntries([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filter, userId, userName, country, friendIds]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const page = await fetchRankingPage(filter, {
        userId,
        userName,
        country,
        friendIds,
        lastDoc: lastDocRef.current,
      });
      setEntries((prev) => {
        const ids = new Set(prev.map((e) => e.userId));
        const fresh = page.entries.filter((e) => !ids.has(e.userId));
        return [...prev, ...fresh];
      });
      setHasMore(page.hasMore);
      lastDocRef.current = page.lastDoc;
    } catch {
      setError('Erreur lors du chargement.');
    } finally {
      setLoadingMore(false);
    }
  }, [filter, userId, userName, country, friendIds, hasMore, loadingMore, loading]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  return {
    entries,
    myRanking,
    loading,
    loadingMore,
    hasMore,
    error,
    refresh: loadFirstPage,
    loadMore,
    reloadMyRank: loadMyRank,
  };
}
