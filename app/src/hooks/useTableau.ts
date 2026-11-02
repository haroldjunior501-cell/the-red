import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadTableau, saveTableau } from '../services/gamesService';
import { clearDownstreamPredictions } from '../utils/bracketState';
import { useUserStore } from '../store/useUserStore';
import type { BracketPrediction, BracketRound } from '../types/games.types';
import { fetchTableauBracketFixtures } from '../utils/tableauFixtures';
import { groupCountriesByLetter, splitBracketFixtures, countBracketPicks } from '../utils/tableauBracket';
import type { BracketRounds } from '../utils/tableauBracket';
import type { GamesFixture } from '../types/games.types';

function roundFromPhase(phase: string): BracketRound {
  const p = phase.toLowerCase();
  if (p.includes('petite') || p.includes('3rd') || p.includes('third')) return 'semi';
  if ((p.includes('final') || p.includes('finale')) && !p.includes('semi') && !p.includes('demi')) return 'final';
  if (p.includes('semi') || p.includes('demi')) return 'semi';
  if (p.includes('quarter') || p.includes('quart')) return 'quarter';
  if (p.includes('16') || p.includes('1/8') || p.includes('huit')) return 'r16';
  return 'groups';
}

export function useTableau() {
  const userId = useUserStore((s) => s.userId);
  const countryCode = useUserStore((s) => s.countryCode) || 'FR';
  const [fixtures, setFixtures] = useState<GamesFixture[]>([]);
  const [predictions, setPredictions] = useState<BracketPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bracket, saved] = await Promise.all([
        fetchTableauBracketFixtures(countryCode),
        userId ? loadTableau(userId) : Promise.resolve(null),
      ]);
      setFixtures(bracket.fixtures);
      if (saved) {
        setPredictions(saved.predictions);
        setSubmittedAt(saved.submittedAt);
      } else {
        setPredictions([]);
        setSubmittedAt(null);
      }
    } catch {
      setError('Impossible de charger le tableau');
    } finally {
      setLoading(false);
    }
  }, [userId, countryCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const bracketMatches = useMemo(
    () =>
      fixtures.filter((f) => {
        const r = roundFromPhase(f.phase);
        return r !== 'groups';
      }),
    [fixtures],
  );

  const bracketRounds: BracketRounds = useMemo(() => splitBracketFixtures(bracketMatches), [bracketMatches]);
  const groups = useMemo(() => groupCountriesByLetter(), []);
  const picksCount = useMemo(() => countBracketPicks(predictions), [predictions]);

  const pickWinner = useCallback(
    (matchId: string, round: BracketRound, winnerCode: string, winnerName: string) => {
      if (!matchId) return;
      setPredictions((prev) => {
        const cleared = clearDownstreamPredictions(prev, matchId, bracketRounds);
        const rest = cleared.filter((p) => p.matchId !== matchId);
        return [...rest, { matchId, round, predictedWinner: winnerName, predictedWinnerCode: winnerCode }];
      });
      setSubmittedAt(null);
    },
    [bracketRounds],
  );

  const validate = useCallback(async () => {
    if (!userId) {
      setError('Connecte-toi pour enregistrer ton tableau');
      return false;
    }
    setSaving(true);
    setError(null);
    try {
      await saveTableau(userId, predictions);
      setSubmittedAt(Date.now());
      return true;
    } catch {
      setError('Enregistrement impossible');
      return false;
    } finally {
      setSaving(false);
    }
  }, [predictions, userId]);

  return {
    countryCode,
    fixtures: bracketMatches,
    bracketRounds,
    groups,
    picksCount,
    predictions,
    loading,
    saving,
    error,
    submittedAt,
    pickWinner,
    validate,
    refetch: load,
  };
}
