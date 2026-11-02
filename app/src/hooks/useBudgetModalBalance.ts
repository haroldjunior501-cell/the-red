import { useCallback, useEffect, useState } from 'react';
import { loadFantasyEconomy } from '../services/fantasyEconomyService';

export function useBudgetModalBalance(userId: string | undefined, visible: boolean) {
  const [fantasyPoints, setFantasyPoints] = useState(0);
  const [budgetCapM, setBudgetCapM] = useState(100);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const uid = userId?.trim();
    if (!uid) return;
    setSyncing(true);
    try {
      const state = await loadFantasyEconomy(uid);
      setFantasyPoints(state.fantasyPoints);
      setBudgetCapM(state.fantasyBudgetM);
    } finally {
      setSyncing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (visible) void refresh();
  }, [visible, refresh]);

  const applyBalances = useCallback((fp: number, budget: number) => {
    setFantasyPoints(fp);
    setBudgetCapM(budget);
  }, []);

  return { fantasyPoints, budgetCapM, syncing, refresh, applyBalances };
}
