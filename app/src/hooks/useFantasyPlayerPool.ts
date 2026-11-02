import { useCallback, useEffect, useMemo, useState } from 'react';
import { groupPlayersByPosition, loadFantasyPlayerPool } from '../services/fotmobService';
import type { FantasyListPosition, FantasyPitchPlayer } from '../types/fantasy.types';

export function useFantasyPlayerPool() {
  const [players, setPlayers] = useState<FantasyPitchPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'cache' | 'network'>('network');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await loadFantasyPlayerPool();
        if (cancelled) return;
        setPlayers(result.players);
        setSource(result.source === 'demo' ? 'network' : result.source);
      } catch {
        if (!cancelled) {
          setPlayers([]);
          setSource('network');
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
