import { useEffect, useMemo } from 'react';
import { checkAndCompleteMissions } from '../services/fantasyMissionEngine';
import type { UserMissionStats } from '../types/fantasyEconomy.types';

export function useFantasyMissionTracker(
  userId: string | null | undefined,
  stats: UserMissionStats
) {
  const key = useMemo(
    () =>
      [
        stats.loggedInToday,
        stats.loginStreak,
        stats.arenaWinsToday,
        stats.fantasyPointsToday,
        stats.captainGoalsToday,
        stats.filledCount,
        stats.arenaWinStreak,
        stats.arenaStreakReferenceId,
        stats.isWeeklyArenaTop1,
        stats.pendingReferralIds.join(','),
      ].join('|'),
    [stats]
  );

  useEffect(() => {
    const uid = userId?.trim();
    if (!uid) return;
    void checkAndCompleteMissions(uid, stats);
  }, [userId, key, stats]);
}
