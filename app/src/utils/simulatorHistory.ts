import type { SimulatorDuelOutcome, SimulatorHistoryEntry } from '../types/arena.types';

export function duelOutcome(userScore: number, opponentScore: number): SimulatorDuelOutcome {
  if (userScore > opponentScore) return 'win';
  if (userScore < opponentScore) return 'loss';
  return 'draw';
}

export function summarizeHistory(entries: SimulatorHistoryEntry[]) {
  const finished = entries.filter((e) => !e.isLive);
  let wins = 0;
  let losses = 0;
  let draws = 0;
  for (const e of finished) {
    if (e.outcome === 'win') wins += 1;
    else if (e.outcome === 'loss') losses += 1;
    else draws += 1;
  }

  let streakLabel: string | null = null;
  const recent = finished.slice(0, 5);
  if (recent.length > 0) {
    const first = recent[0].outcome;
    if (first === 'win' || first === 'loss') {
      let count = 0;
      for (const e of recent) {
        if (e.outcome !== first) break;
        count += 1;
      }
      if (count >= 2) {
        streakLabel =
          first === 'win'
            ? `${count} victoires d'affilée`
            : `${count} défaites d'affilée`;
      }
    }
  }

  return {
    wins,
    losses,
    draws,
    totalDuels: entries.length,
    currentStreakLabel: streakLabel,
  };
}
