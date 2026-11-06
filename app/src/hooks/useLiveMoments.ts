import { useEffect, useMemo, useState } from 'react';
import type { LiveMatch, LiveMoment } from '../types/live.types';

function momentFromMatch(match: LiveMatch): LiveMoment[] {
  return match.events.map((e) => {
    const teamName = e.team === 'home' ? match.home_name : match.away_name;
    let label = e.player_name;
    if (e.type === 'goal' || e.type === 'penalty') label = `${e.player_name} marque !`;
    if (e.type === 'redcard') label = `Carton rouge — ${teamName}`;
    if (e.type === 'yellowcard') label = `Carton jaune — ${e.player_name}`;
    if (e.type === 'substitution') label = `Changement — ${teamName}`;
    const minute = parseInt(String(e.minute).split('+')[0], 10) || 0;
    const ts = Date.now() - Math.max(0, 90 - minute) * 60_000;
    return {
      id: `${match.id}-${e.id}`,
      type: e.type === 'penalty' ? 'goal' : e.type,
      label,
      matchLabel: `${match.home_name} vs ${match.away_name}`,
      minute: e.minute,
      timestamp: ts,
      isNew: Date.now() - ts < 5 * 60_000,
    };
  });
}

export function useLiveMoments(matches: LiveMatch[]) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  const moments = useMemo(() => {
    void tick;
    const all: LiveMoment[] = [];
    for (const m of matches.slice(0, 6)) {
      all.push(...momentFromMatch(m));
    }
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [matches, tick]);

  return { moments };
}
