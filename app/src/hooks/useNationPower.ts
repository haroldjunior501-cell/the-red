import { useEffect, useMemo, useState } from 'react';
import { countryMeta, subscribeAllNations, subscribeNationPower } from '../services/gamesService';
import { useUserStore } from '../store/useUserStore';
import type { NationPower } from '../types/games.types';

export function useNationPower() {
  const countryCode = useUserStore((s) => s.countryCode) || 'FR';
  const [power, setPower] = useState<NationPower | null>(null);
  const [allNations, setAllNations] = useState<Record<string, NationPower>>({});

  useEffect(() => subscribeNationPower(countryCode, setPower), [countryCode]);

  useEffect(() => subscribeAllNations(setAllNations), []);

  const worldRank = useMemo(() => {
    const sorted = Object.entries(allNations)
      .map(([code, row]) => ({ code, power: row.power }))
      .sort((a, b) => b.power - a.power);
    const idx = sorted.findIndex((n) => n.code.toUpperCase() === countryCode.toUpperCase());
    return idx >= 0 ? idx + 1 : sorted.length + 1;
  }, [allNations, countryCode]);

  const meta = useMemo(() => countryMeta(countryCode), [countryCode]);

  return { power, worldRank, countryCode, flag: meta.flag, nationLabel: meta.name };
}
