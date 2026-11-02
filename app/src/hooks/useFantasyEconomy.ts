import { useCallback, useEffect, useMemo, useState } from 'react';
import { BUDGET_CONVERSIONS } from '../constants/fantasyEconomy';
import {
  loadFantasyEconomy,
  recordDailyLogin,
  subscribeFantasyEconomyChanges,
} from '../services/fantasyEconomyService';
import { getPrestige, todayDateKey } from '../utils/fantasyEconomyMath';
import type { FantasyEconomyState } from '../types/fantasyEconomy.types';

export function useFantasyEconomy(userId: string | null | undefined) {
  const [state, setState] = useState<FantasyEconomyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const uid = userId?.trim() ?? '';
  const today = todayDateKey();

  const refresh = useCallback(async () => {
    if (!uid) {
      setState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLastError(null);
    try {
      const data = await loadFantasyEconomy(uid);
      setState(data);
    } catch (e) {
      setLastError(e instanceof Error ? e.message : 'Impossible de charger l’économie Fantasy');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!uid) return undefined;
    return subscribeFantasyEconomyChanges(() => {
      void refresh();
    });
  }, [refresh, uid]);

  useEffect(() => {
    if (!uid) return;
    void recordDailyLogin(uid, today).then((res) => {
      if (res) setState(res);
      else void refresh();
    });
  }, [refresh, today, uid]);

  const prestige = useMemo(
    () => (state ? getPrestige(state.fantasyBudgetM) : null),
    [state]
  );

  return {
    state,
    loading,
    lastError,
    prestige,
    budgetCapM: state?.fantasyBudgetM ?? 100,
    fantasyPoints: state?.fantasyPoints ?? 0,
    loginStreak: state?.loginStreak ?? 0,
    conversions: BUDGET_CONVERSIONS,
    refresh,
    clearError: () => setLastError(null),
  };
}
