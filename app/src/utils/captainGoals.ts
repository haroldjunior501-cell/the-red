import type { SimulatorLiveEvent } from '../types/arena.types';

export function countCaptainGoals(events: SimulatorLiveEvent[]): number {
  return events.filter(
    (e) => e.type === 'captain_goal' || (e.type === 'goal' && e.isCaptain === true)
  ).length;
}
