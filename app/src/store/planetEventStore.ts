import { create } from 'zustand';
import type { PlanetEvent, PlanetEventType, WeatherMood } from '../types/planetEvents';

const HEAVY_EVENTS = new Set<PlanetEventType>(['GOAL', 'RED_CARD', 'HISTORIC', 'PENALTY', 'CHAIN']);

type PlanetEventStore = {
  activeEvent: PlanetEvent | null;
  pendingEvents: PlanetEvent[];
  isChaosMode: boolean;
  weatherMood: WeatherMood;
  enqueueEvent: (event: Omit<PlanetEvent, 'id' | 'timestamp'> & { id?: string }) => void;
  clearActiveEvent: () => void;
  activateChaosMode: () => void;
  deactivateChaosMode: () => void;
  setWeatherMood: (mood: WeatherMood) => void;
};

function nextEventId(type: PlanetEventType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

let lastGoalAt = 0;
let lastGoalCountry = '';

function isDuplicateGoal(country: string | undefined): boolean {
  if (!country) return false;
  const now = Date.now();
  const key = country.toUpperCase();
  if (key === lastGoalCountry && now - lastGoalAt < 4500) return true;
  lastGoalCountry = key;
  lastGoalAt = now;
  return false;
}

export const usePlanetEventStore = create<PlanetEventStore>((set, get) => ({
  activeEvent: null,
  pendingEvents: [],
  isChaosMode: false,
  weatherMood: 'normal',

  enqueueEvent: (event) => {
    if (event.type === 'GOAL' && isDuplicateGoal(event.country)) return;
    const full: PlanetEvent = {
      ...event,
      id: event.id ?? nextEventId(event.type),
      timestamp: Date.now(),
    };
    const { activeEvent, pendingEvents } = get();
    if (!activeEvent) {
      set({ activeEvent: full });
      return;
    }
    if (HEAVY_EVENTS.has(full.type)) {
      if (full.type === 'GOAL' && activeEvent && activeEvent.type !== 'GOAL') {
        set({ activeEvent: full, pendingEvents: [...pendingEvents, activeEvent] });
        return;
      }
      set({ pendingEvents: [...pendingEvents, full] });
      return;
    }
    set({ activeEvent: full });
  },

  clearActiveEvent: () => {
    const { pendingEvents } = get();
    const [next, ...rest] = pendingEvents;
    set({ activeEvent: next ?? null, pendingEvents: rest });
  },

  activateChaosMode: () => set({ isChaosMode: true }),
  deactivateChaosMode: () => set({ isChaosMode: false }),
  setWeatherMood: (mood) => set({ weatherMood: mood }),
}));
