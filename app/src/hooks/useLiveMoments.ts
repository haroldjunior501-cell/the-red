import { useCallback, useEffect, useState } from 'react';
import { getMatchEvents } from '../services/livescoreApi';
import { parseApiEvents } from '../services/liveMatchParsers';
import type { LiveMatch, LiveMoment } from '../types/live.types';

const POLL_MS = 15_000;

function momentFromEvent(
  match: LiveMatch,
  e: ReturnType<typeof parseApiEvents>[number]
): LiveMoment {
  const teamName = e.team === 'home' ? match.home_name : match.away_name;
  let label = e.player_name;
  if (e.type === 'goal') label = `${e.player_name} marque !`;
  if (e.type === 'redcard') label = `Carton rouge — ${teamName}`;
  if (e.type === 'penalty') label = `Penalty — ${teamName}`;
  const ts = Date.now() - (90 - (parseInt(e.minute, 10) || 0)) * 60_000;
  return {
    id: `${match.id}-${e.id}`,
    type: e.type,
    label,
    matchLabel: `${match.home_name} vs ${match.away_name}`,
    minute: e.minute,
    timestamp: ts,
    isNew: Date.now() - ts < 5 * 60_000,
  };
}

export function useLiveMoments(matches: LiveMatch[]) {
  const [moments, setMoments] = useState<LiveMoment[]>([]);

  const fetchMoments = useCallback(async () => {
    if (!matches.length) {
      setMoments([]);
      return;
    }
    const slice = matches.slice(0, 6);
    const all: LiveMoment[] = [];
    await Promise.all(
      slice.map(async (m) => {
        try {
          const payload = await getMatchEvents(m.id);
          const events = parseApiEvents(
            payload,
            m.home_team_id,
            m.away_team_id,
            m.home_country_code,
            m.away_country_code
          );
          events.forEach((e) => all.push(momentFromEvent(m, e)));
        } catch {
          /* ignore */
        }
      })
    );
    all.sort((a, b) => b.timestamp - a.timestamp);
    setMoments(all.slice(0, 12));
  }, [matches]);

  useEffect(() => {
    void fetchMoments();
    const id = setInterval(() => void fetchMoments(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchMoments]);

  return { moments };
}
