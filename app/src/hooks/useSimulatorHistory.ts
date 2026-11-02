import { useEffect, useState } from 'react';
import { subscribeSimulatorHistory } from '../services/simulatorRtdbService';
import type {
  SimulatorCurrentMatch,
  SimulatorHistoryEntry,
  SimulatorSeasonStats,
} from '../types/arena.types';
import { summarizeHistory } from '../utils/simulatorHistory';

const EMPTY_STATS: SimulatorSeasonStats = {
  wins: 0,
  losses: 0,
  draws: 0,
  totalDuels: 0,
  currentStreakLabel: null,
};

export function useSimulatorHistory(
  userId: string,
  userName: string,
  country: string,
  currentMatch: SimulatorCurrentMatch | null
) {
  const [entries, setEntries] = useState<SimulatorHistoryEntry[]>([]);
  const [stats, setStats] = useState<SimulatorSeasonStats>(EMPTY_STATS);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setStats(EMPTY_STATS);
      return;
    }
    return subscribeSimulatorHistory(userId, userName, country, currentMatch, (next) => {
      setEntries(next.entries);
      setStats(next.stats);
    });
  }, [
    userId,
    userName,
    country,
    currentMatch?.opponentUserId,
    currentMatch?.userScore,
    currentMatch?.opponentScore,
    currentMatch?.isLive,
    currentMatch?.matchdayLabel,
  ]);

  return { entries, stats };
}
