import { useCallback, useEffect, useMemo, useState } from 'react';
import { ALL_SLOT_KEYS, BENCH_SLOT_KEYS, FORMATION_LABEL } from '../constants/fantasyPitch';
import { fotmobPlayerImageUrl } from '../constants/fotmob';
import {
  emptyBench,
  emptySlots,
  loadFantasyTeamForUser,
  saveFantasyTeamDoc,
  type FantasySaveResult,
} from '../services/fantasyService';
import { savePickXi } from '../services/unitedGamesService';
import { useUserStore } from '../store/useUserStore';
import type {
  FantasyBenchSlotKey,
  FantasyBenchState,
  FantasyPitchPlayer,
  FantasySlotKey,
  FantasySlotsState,
  FantasyTeamDoc,
} from '../types/fantasy.types';
import type { UnitedFormation } from '../constants/unitedGames';

function countFilled(slots: FantasySlotsState): number {
  return Object.values(slots).filter(Boolean).length;
}

function countBenchFilled(bench: FantasyBenchState): number {
  return Object.values(bench).filter(Boolean).length;
}

function sumPts(
  slots: FantasySlotsState,
  bench: FantasyBenchState,
  captainSlot: FantasySlotKey | null
): number {
  let total = 0;
  (Object.entries(slots) as [FantasySlotKey, FantasyPitchPlayer | null][]).forEach(
    ([key, p]) => {
      if (!p) return;
      total += p.pts * (key === captainSlot ? 2 : 1);
    }
  );
  Object.values(bench).forEach((p) => {
    if (p) total += p.pts;
  });
  return total;
}

function enrichPlayer(p: FantasyPitchPlayer): FantasyPitchPlayer {
  if (p.photo) return p;
  const fid = p.fotmobId ?? Number(p.id);
  if (Number.isFinite(fid) && fid > 0) {
    return { ...p, photo: fotmobPlayerImageUrl(fid) };
  }
  return p;
}

function enrichSlots(slots: FantasySlotsState): FantasySlotsState {
  const next = { ...slots };
  (Object.keys(next) as FantasySlotKey[]).forEach((key) => {
    const p = next[key];
    if (p) next[key] = enrichPlayer(p);
  });
  return next;
}

function enrichBench(bench: FantasyBenchState): FantasyBenchState {
  const next = { ...bench };
  (Object.keys(next) as FantasyBenchSlotKey[]).forEach((key) => {
    const p = next[key];
    if (p) next[key] = enrichPlayer(p);
  });
  return next;
}

/** Fantasy United = Pick Your XI — pas de budget / pas d’achat. */
export function useFantasyTeam(_budgetCapMIgnored?: number) {
  const userId = useUserStore((s) => s.userId);
  const countryCode = useUserStore((s) => s.countryCode);
  const [slots, setSlots] = useState<FantasySlotsState>(() => emptySlots());
  const [bench, setBench] = useState<FantasyBenchState>(() => emptyBench());
  const [captainSlot, setCaptainSlot] = useState<FantasySlotKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId) {
        if (!cancelled) {
          setSlots(emptySlots());
          setBench(emptyBench());
          setCaptainSlot(null);
        }
        return;
      }

      try {
        const doc = await loadFantasyTeamForUser(userId);
        if (cancelled) return;
        if (doc && countFilled(doc.slots) > 0) {
          setSlots(enrichSlots(doc.slots));
          setBench(enrichBench(doc.bench ?? emptyBench()));
          setCaptainSlot(doc.captainSlot);
        } else {
          setSlots(emptySlots());
          setBench(emptyBench());
          setCaptainSlot(null);
        }
      } catch {
        if (!cancelled) {
          setSlots(emptySlots());
          setBench(emptyBench());
          setCaptainSlot(null);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const spent = 0;
  const remaining = 0;
  const filledCount = useMemo(() => countFilled(slots), [slots]);
  const benchCount = useMemo(() => countBenchFilled(bench), [bench]);
  const totalPoints = useMemo(() => sumPts(slots, bench, captainSlot), [slots, bench, captainSlot]);

  const captainPlayer = useMemo(
    () => (captainSlot ? slots[captainSlot] : null),
    [captainSlot, slots]
  );

  const benchArray = useMemo(
    () => BENCH_SLOT_KEYS.map((key) => bench[key]),
    [bench]
  );

  const playerUsedInTeam = useCallback(
    (
      playerId: string,
      opts?: { exceptSlot?: FantasySlotKey; exceptBench?: FantasyBenchSlotKey }
    ) => {
      const inXi = Object.entries(slots).some(
        ([key, p]) => p?.id === playerId && key !== opts?.exceptSlot
      );
      const inBench = Object.entries(bench).some(
        ([key, p]) => p?.id === playerId && key !== opts?.exceptBench
      );
      return inXi || inBench;
    },
    [bench, slots]
  );

  const assignPlayer = useCallback(
    (slotKey: FantasySlotKey, player: FantasyPitchPlayer): boolean => {
      const row = player.position;
      const slotPos = slotKey.startsWith('ATT')
        ? 'ATT'
        : slotKey.startsWith('MID')
          ? 'MID'
          : slotKey.startsWith('DEF')
            ? 'DEF'
            : 'GK';
      if (row !== slotPos) {
        setError('Poste incompatible');
        return false;
      }
      if (playerUsedInTeam(player.id, { exceptSlot: slotKey })) {
        setError('Joueur déjà dans l\'équipe');
        return false;
      }
      setSlots((prev) => ({ ...prev, [slotKey]: player }));
      setError(null);
      return true;
    },
    [playerUsedInTeam]
  );

  const assignBenchPlayer = useCallback(
    (benchKey: FantasyBenchSlotKey, player: FantasyPitchPlayer): boolean => {
      if (playerUsedInTeam(player.id, { exceptBench: benchKey })) {
        setError('Joueur déjà dans l\'équipe');
        return false;
      }
      setBench((prev) => ({ ...prev, [benchKey]: player }));
      setError(null);
      return true;
    },
    [playerUsedInTeam]
  );

  const clearBenchSlot = useCallback((benchKey: FantasyBenchSlotKey) => {
    setBench((prev) => ({ ...prev, [benchKey]: null }));
    setError(null);
  }, []);

  const clearSlot = useCallback((slotKey: FantasySlotKey) => {
    setSlots((prev) => ({ ...prev, [slotKey]: null }));
    setCaptainSlot((cap) => (cap === slotKey ? null : cap));
    setError(null);
  }, []);

  const setCaptain = useCallback((slotKey: FantasySlotKey) => {
    if (!slots[slotKey]) return;
    setCaptainSlot(slotKey);
    setError(null);
  }, [slots]);

  const saveTeam = useCallback(async (): Promise<boolean> => {
    if (filledCount < 11) {
      setError('Complète les 11 postes du terrain');
      setSaveSuccess(null);
      return false;
    }
    setSaving(true);
    setError(null);
    setSaveSuccess(null);
    try {
      const team: FantasyTeamDoc = {
        formation: FORMATION_LABEL,
        slots,
        bench,
        captainSlot,
        totalPoints,
        budget: 0,
        spent: 0,
      };
      const result: FantasySaveResult = await saveFantasyTeamDoc(userId, team, countryCode);
      if (!result.ok) {
        setError('Sauvegarde impossible');
        return false;
      }

      // Sync Pick Your XI (même onze United)
      if (userId) {
        const starters = ALL_SLOT_KEYS.map((k) => slots[k]?.id).filter(
          (id): id is string => Boolean(id)
        );
        await savePickXi(userId, {
          matchId: 'current',
          segment: 'men',
          formation: FORMATION_LABEL as UnitedFormation,
          starters,
          submittedAt: Date.now(),
        }).catch(() => undefined);
      }

      if (result.mode === 'cloud') {
        setSaveSuccess('XI United enregistré (Fantasy + Pick Your XI)');
      } else if (result.cloudError) {
        setError(`Synchronisation cloud impossible : ${result.cloudError}`);
      } else {
        setSaveSuccess('XI enregistré sur cet appareil');
      }
      return true;
    } catch {
      setError('Sauvegarde impossible — réessaie');
      return false;
    } finally {
      setSaving(false);
    }
  }, [bench, captainSlot, countryCode, filledCount, slots, totalPoints, userId]);

  return {
    slots,
    bench,
    benchArray,
    benchCount,
    captainSlot,
    captainPlayer,
    spent,
    remaining,
    filledCount,
    totalPoints,
    saving,
    error,
    saveSuccess,
    assignPlayer,
    assignBenchPlayer,
    clearBenchSlot,
    clearSlot,
    setCaptain,
    saveTeam,
    setError,
  };
};
