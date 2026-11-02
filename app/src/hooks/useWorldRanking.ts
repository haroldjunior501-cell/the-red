import { useEffect, useMemo, useState } from 'react';
import { COUNTRIES } from '../constants/countries';
import { subscribeAllNations } from '../services/gamesService';
import type { NationPower } from '../types/games.types';
import type { NationRank } from '../types/games.types';

export function useWorldRanking(limit = 12) {
  const [rows, setRows] = useState<Record<string, NationPower>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    return subscribeAllNations((nations) => {
      setRows(nations);
      setLoading(false);
    });
  }, []);

  const ranking = useMemo((): NationRank[] => {
    const fromDb = Object.entries(rows).map(([code, val]) => {
      const c = COUNTRIES.find((x) => x.code.toUpperCase() === code.toUpperCase());
      return {
        code,
        flag: c?.flag ?? '🏳️',
        name: c?.name ?? code,
        power: val.power,
        rank: 0,
        dailyGain: val.dailyGain,
        supporterCount: val.supporterCount,
      };
    });

    const knownCodes = new Set(fromDb.map((n) => n.code));
    const placeholders = COUNTRIES.filter((c) => !knownCodes.has(c.code)).map((c) => ({
      code: c.code,
      flag: c.flag,
      name: c.name,
      power: 0,
      rank: 0,
    }));

    return [...fromDb, ...placeholders]
      .sort((a, b) => b.power - a.power)
      .slice(0, limit)
      .map((row, idx) => ({ ...row, rank: idx + 1 }));
  }, [limit, rows]);

  return { ranking, loading };
}
