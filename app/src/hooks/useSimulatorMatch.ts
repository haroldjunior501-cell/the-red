import { useEffect, useState } from 'react';
import { SIMULATOR_MATCHDAY_ID } from '../constants/simulator';
import {
  subscribeSimulatorEvents,
  subscribeSimulatorMatch,
} from '../services/simulatorRtdbService';
import type { SimulatorCurrentMatch, SimulatorLiveEvent } from '../types/arena.types';

export function useSimulatorMatch(userId: string) {
  const [match, setMatch] = useState<SimulatorCurrentMatch | null>(null);
  const [events, setEvents] = useState<SimulatorLiveEvent[]>([]);

  useEffect(() => {
    if (!userId) {
      setMatch(null);
      setEvents([]);
      return;
    }
    const unsubMatch = subscribeSimulatorMatch(userId, setMatch);
    const unsubEv = subscribeSimulatorEvents(userId, SIMULATOR_MATCHDAY_ID, (next) => {
      setEvents((prev) => {
        if (
          prev.length === next.length &&
          prev.every((e, i) => e.id === next[i]?.id && e.points === next[i]?.points)
        ) {
          return prev;
        }
        return next;
      });
    });
    return () => {
      unsubMatch();
      unsubEv();
    };
  }, [userId]);

  return { match, events };
}
