import { useCallback, useEffect, useMemo, useState } from 'react';
import { UNITED_SQUAD_SEED } from '../constants/unitedSquadSeed';
import {
  groupPlayersByPosition,
  loadUnitedFantasyPlayerPool,
} from '../services/unitedFantasyPool';
import type { FantasyListPosition, FantasyPitchPlayer } from '../types/fantasy.types';

/** Pool Fantasy = effectif Manchester United uniquement. */
export function useFantasyPlayerPool() {
  const [players, setPlayers] = useState<FantasyPitchPlayer[]>(UNITED_SQUAD_SEED);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'cache' | 'network' | 'seed'>('seed');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await loadUnitedFantasyPlayerPool();
        if (cancelled) return;
        if (result.players.length > 0) {
          setPlayers(result.players);
          setSource(result.source);
        }
      } catch {
        if (!cancelled) {
          setPlayers(UNITED_SQUAD_SEED);
          setSource('seed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pool = useMemo(() => groupPlayersByPosition(players), [players]);

  const getPool = useCallback(
    (position: FantasyListPosition) => pool[position] ?? [],
    [pool]
  );

  return { players, pool, loading, source, getPool };
}
