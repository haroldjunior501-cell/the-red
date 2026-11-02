import { useEffect, useRef } from 'react';
import { nationColor } from '../constants/hubGlobe';
import { fetchMatchEvents, isFootballDataConfigured, type ParsedLiveScore } from '../services/livescoreApi';
import { notificationService } from '../services/notificationService';
import { usePlanetEventStore } from '../store/planetEventStore';
import type { ParsedApiMatchEvent } from '../types/planetEvents';
import { computeWeatherMood } from '../utils/planetMood';

const POLL_MS = 15_000;

type UsePlanetEventsArgs = {
  matchId: string | null;
  live: ParsedLiveScore | null;
  enabled: boolean;
  simulationEnabled: boolean;
};

function mapApiEvent(event: ParsedApiMatchEvent, live: ParsedLiveScore): void {
  const enqueue = usePlanetEventStore.getState().enqueueEvent;
  const home = live.home.code.toUpperCase();
  const away = live.away.code.toUpperCase();
  const team = event.teamCode.toUpperCase();
  const country = team === home || team === away ? team : event.teamCode;
  const color = nationColor(country);

  if (event.type.includes('goal')) {
    enqueue({
      type: 'GOAL',
      country,
      countryColor: color,
      playerName: event.playerName,
      minute: event.minute,
    });
    return;
  }

  if (event.type.includes('penalty') && event.type.includes('miss')) {
    enqueue({ type: 'PENALTY_MISSED', country, countryColor: color, minute: event.minute });
    return;
  }

  if (event.type.includes('penalty')) {
    enqueue({ type: 'PENALTY', country, countryColor: color, minute: event.minute });
    return;
  }

  if (event.type.includes('red') || event.type.includes('yellowred')) {
    enqueue({ type: 'RED_CARD', country, countryColor: color, playerName: event.playerName, minute: event.minute });
  }
}

function syncChaosAndMood(live: ParsedLiveScore | null, recentGoals: number, chaosNotified: { current: boolean }) {
  const store = usePlanetEventStore.getState();
  if (live && live.minute >= 85) {
    if (!store.isChaosMode) {
      store.activateChaosMode();
      store.enqueueEvent({ type: 'CHAOS', minute: live.minute });
      if (!chaosNotified.current) {
        chaosNotified.current = true;
        void notificationService.sendChaosNotif(live.home.name, live.home.score, live.away.name, live.away.score);
      }
    }
  } else if (store.isChaosMode) {
    store.deactivateChaosMode();
    chaosNotified.current = false;
  }
  store.setWeatherMood(computeWeatherMood(live, recentGoals));
}

function teamNameForCode(live: ParsedLiveScore, code: string): string {
  const c = code.toUpperCase();
  if (live.home.code.toUpperCase() === c) return live.home.name;
  if (live.away.code.toUpperCase() === c) return live.away.name;
  return code;
}

export function usePlanetEvents({ matchId, live, enabled, simulationEnabled }: UsePlanetEventsArgs) {
  const processedIds = useRef<Set<string>>(new Set());
  const simMarkers = useRef<Set<number>>(new Set());
  const chaosNotified = useRef(false);

  useEffect(() => {
    if (enabled) void notificationService.requestPermissions();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || simulationEnabled || !matchId || !isFootballDataConfigured()) return undefined;

    const pull = async () => {
      try {
        const events = await fetchMatchEvents(matchId);
        events.forEach((event) => {
          if (processedIds.current.has(event.id)) return;
          processedIds.current.add(event.id);
          if (!live) return;
          mapApiEvent(event, live);
        });
        syncChaosAndMood(live, 0, chaosNotified);
      } catch {
        /* ignore polling errors */
      }
    };

    void pull();
    const id = setInterval(() => {
      void pull();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [enabled, live, matchId, simulationEnabled]);

  useEffect(() => {
    if (!enabled || !simulationEnabled || !live || !matchId) return undefined;
    const minute = live.minute;
    const enqueue = usePlanetEventStore.getState().enqueueEvent;

    if (minute === 80 && !simMarkers.current.has(80)) {
      simMarkers.current.add(80);
      enqueue({ type: 'PENALTY', country: live.away.code, countryColor: nationColor(live.away.code), minute });
    }
    if (minute === 84 && !simMarkers.current.has(84)) {
      simMarkers.current.add(84);
      enqueue({
        type: 'RED_CARD',
        country: live.away.code,
        countryColor: nationColor(live.away.code),
        playerName: 'Casemiro',
        minute,
      });
    }

    syncChaosAndMood(live, 0, chaosNotified);
    return undefined;
  }, [enabled, live, matchId, simulationEnabled]);
}
