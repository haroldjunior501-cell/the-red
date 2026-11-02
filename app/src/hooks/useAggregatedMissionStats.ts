import { useEffect, useMemo, useState } from 'react';
import { ALL_SLOT_KEYS } from '../constants/fantasyPitch';
import { listReferralIds } from '../services/referralService';
import { fetchRankingPage } from '../services/simulatorService';
import type { UserMissionStats } from '../types/fantasyEconomy.types';
import { arenaStreak3ReferenceId, countConsecutiveArenaWins } from '../utils/arenaWinStreak';
import { countCaptainGoals } from '../utils/captainGoals';
import { useFantasyEconomy } from './useFantasyEconomy';
import { useSimulatorHistory } from './useSimulatorHistory';
import { useSimulatorMatch } from './useSimulatorMatch';
import { useSimulatorScore } from './useSimulatorScore';
import { useUserStore } from '../store/useUserStore';
import { loadFantasyTeamForUser } from '../services/fantasyService';
import type { FantasySlotKey, FantasyPitchPlayer } from '../types/fantasy.types';

function countFilled(slots: Record<FantasySlotKey, FantasyPitchPlayer | null> | undefined): number {
  if (!slots) return 0;
  return ALL_SLOT_KEYS.filter((k) => slots[k]).length;
}

const EMPTY_STATS: UserMissionStats = {
  loggedInToday: true,
  loginStreak: 0,
  arenaWinsToday: 0,
  fantasyPointsToday: 0,
  captainGoalsToday: 0,
  filledCount: 0,
  arenaWinStreak: 0,
  arenaStreakReferenceId: null,
  isWeeklyArenaTop1: false,
  pendingReferralIds: [],
};

export function useAggregatedMissionStats(enabled = true) {
  const userId = useUserStore((s) => s.userId) || '';
  const userName = useUserStore((s) => s.name) || 'Joueur';
  const countryCode = useUserStore((s) => s.countryCode) || 'FR';

  const economy = useFantasyEconomy(enabled ? userId : null);
  const { entries: historyEntries } = useSimulatorHistory(
    enabled ? userId : '',
    userName,
    countryCode,
    null
  );
  const { events } = useSimulatorMatch(enabled ? userId : '');
  const score = useSimulatorScore(enabled ? userId : '');

  const [filledCount, setFilledCount] = useState(0);
  const [isWeeklyArenaTop1, setIsWeeklyArenaTop1] = useState(false);
  const [pendingReferralIds, setPendingReferralIds] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || !userId) {
      setFilledCount(0);
      return;
    }
    let cancelled = false;
    void loadFantasyTeamForUser(userId).then((doc) => {
      if (cancelled) return;
      setFilledCount(doc ? countFilled(doc.slots) : 0);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  useEffect(() => {
    if (!enabled || !userId) {
      setIsWeeklyArenaTop1(false);
      return;
    }
    let cancelled = false;
    void fetchRankingPage('week', {
      userId,
      userName,
      country: countryCode,
      pageSize: 5,
    }).then((page) => {
      if (cancelled) return;
      const top = page.entries.find((e) => e.rank === 1);
      setIsWeeklyArenaTop1(top?.userId === userId);
    });
    return () => {
      cancelled = true;
    };
  }, [countryCode, enabled, userId, userName]);

  useEffect(() => {
    if (!enabled || !userId) {
      setPendingReferralIds([]);
      return;
    }
    let cancelled = false;
    void listReferralIds(userId).then((ids) => {
      if (!cancelled) setPendingReferralIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  const stats = useMemo<UserMissionStats>(() => {
    if (!enabled || !userId) return EMPTY_STATS;

    const arenaWinsToday = historyEntries.filter(
      (e) => !e.isLive && e.outcome === 'win'
    ).length;

    return {
      loggedInToday: true,
      loginStreak: economy.loginStreak,
      arenaWinsToday,
      fantasyPointsToday: score.dayGain,
      captainGoalsToday: countCaptainGoals(events),
      filledCount,
      arenaWinStreak: countConsecutiveArenaWins(historyEntries),
      arenaStreakReferenceId: arenaStreak3ReferenceId(historyEntries),
      isWeeklyArenaTop1,
      pendingReferralIds,
    };
  }, [
    enabled,
    userId,
    economy.loginStreak,
    historyEntries,
    score.dayGain,
    events,
    filledCount,
    isWeeklyArenaTop1,
    pendingReferralIds,
  ]);

  return stats;
}
