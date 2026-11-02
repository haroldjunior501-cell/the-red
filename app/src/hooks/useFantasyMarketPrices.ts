import { useEffect, useMemo, useState } from 'react';
import { applyMarketPrices, buildMarketForPlayers } from '../services/fantasyMarketService';
import type { FantasyPitchPlayer } from '../types/fantasy.types';

export function useFantasyMarketPrices(players: FantasyPitchPlayer[]) {
  const [marketPlayers, setMarketPlayers] = useState<FantasyPitchPlayer[]>(players);
  const [loading, setLoading] = useState(false);

  const playerIds = useMemo(
    () => players.map((p) => p.id).join(','),
    [players]
  );

  useEffect(() => {
    if (players.length === 0) {
      setMarketPlayers([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const market = await buildMarketForPlayers(players);
        if (cancelled) return;
        setMarketPlayers(applyMarketPrices(players, market));
      } catch {
        if (!cancelled) setMarketPlayers(players);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [playerIds, players]);

  const getPricedPlayer = useMemo(() => {
    const byId = new Map(marketPlayers.map((p) => [p.id, p]));
    return (id: string, fallback: FantasyPitchPlayer) => byId.get(id) ?? fallback;
  }, [marketPlayers]);

  return { marketPlayers, loading, getPricedPlayer };
}
