import type { SimulatorHistoryEntry } from '../types/arena.types';

/** Victoires consécutives (duels terminés les plus récents en premier). */
export function countConsecutiveArenaWins(entries: SimulatorHistoryEntry[]): number {
  const finished = entries.filter((e) => !e.isLive);
  let count = 0;
  for (const e of finished) {
    if (e.outcome !== 'win') break;
    count += 1;
  }
  return count;
}

/** Référence idempotente quand la série atteint 3 victoires. */
export function arenaStreak3ReferenceId(entries: SimulatorHistoryEntry[]): string | null {
  const finished = entries.filter((e) => !e.isLive);
  let count = 0;
  for (const e of finished) {
    if (e.outcome !== 'win') break;
    count += 1;
    if (count === 3) return `simulator_streak_3_${e.id}`;
  }
  return null;
}
