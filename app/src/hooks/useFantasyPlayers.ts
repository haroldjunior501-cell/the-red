import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWorldCupParticipants, isFootballDataConfigured } from '../services/livescoreApi';
import type { FantasyPlayer, FantasyPosition } from '../types/games.types';
import { parseFantasyPlayersFromParticipants } from '../utils/fantasyPlayerParsers';

export type FantasySortKey = 'price' | 'points' | 'goals' | 'rating';

function sortPlayers(list: FantasyPlayer[], sort: FantasySortKey): FantasyPlayer[] {
  const copy = [...list];
  switch (sort) {
    case 'price':
      return copy.sort((a, b) => b.price - a.price);
    case 'goals':
      return copy.sort((a, b) => b.goals - a.goals);
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating);
    case 'points':
    default:
      return copy.sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  }
}

export function useFantasyPlayers() {
  const [pool, setPool] = useState<FantasyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<FantasySortKey>('points');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFootballDataConfigured()) {
        setPool([]);
        setError('API joueurs non configurée');
        return;
      }
      const payload = await getWorldCupParticipants();
      const parsed = parseFantasyPlayersFromParticipants(payload);
      setPool(parsed);
      if (!parsed.length) {
        setError('Aucun joueur disponible pour le moment');
      }
    } catch {
      setError('Impossible de charger les joueurs');
      setPool([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredByPosition = useCallback(
    (position: FantasyPosition | null) => {
      let list = position ? pool.filter((p) => p.position === position) : pool;
      const q = search.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.shortName.toLowerCase().includes(q) ||
            p.country.toLowerCase().includes(q)
        );
      }
      return sortPlayers(list, sort);
    },
    [pool, search, sort]
  );

  const byPosition = useMemo(() => {
    const gk = filteredByPosition('GK');
    const def = filteredByPosition('DEF');
    const mid = filteredByPosition('MID');
    const att = filteredByPosition('ATT');
    return { GK: gk, DEF: def, MID: mid, ATT: att };
  }, [filteredByPosition]);

  return {
    pool,
    loading,
    error,
    search,
    setSearch,
    sort,
    setSort,
    filteredByPosition,
    byPosition,
    refetch: load,
  };
}
