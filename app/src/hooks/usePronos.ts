import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PronoPhaseDef } from '../constants/pronosPhases';
import {
  POINTS,
  countryMeta,
  loadPopularPronos,
  loadPronos,
  saveProno,
} from '../services/gamesService';
import { useUserStore } from '../store/useUserStore';
import type { Prono } from '../types/games.types';
import type { PopularProno, PronoDraft, PronoMatch, PronoPhaseKey } from '../types/pronos.types';
import { getDefaultPopularPronos, wc2026ToPronoMatches } from '../data/wc2026Matches';
import { canSubmitProno } from '../utils/gamesFixtures';
import { fetchAllPronosFixtures, type PronosScheduleSource } from '../utils/pronosFixtures';
import {
  buildPronoPhasesFromFixtures,
  pickDefaultPronoPhase,
} from '../utils/pronosCalendarPhases';
import { fixtureMatchesPhase, resolveFixturePronoPhase } from '../utils/pronosPhaseUtils';
import { useNationPower } from './useNationPower';

const POPULAR_POLL_MS = 5 * 60 * 1000;

export function usePronos() {
  const userId = useUserStore((s) => s.userId);
  const countryCode = useUserStore((s) => s.countryCode) || 'FR';
  const nation = useNationPower();

  const [activePhase, setActivePhase] = useState<PronoPhaseKey>('opening');
  const [phasesInitialized, setPhasesInitialized] = useState(false);
  const [allFixtures, setAllFixtures] = useState<PronoMatch[]>([]);
  const [saved, setSaved] = useState<Record<string, Prono>>({});
  const [popularByMatchId, setPopularByMatchId] = useState<Record<string, PopularProno[]>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleSource, setScheduleSource] = useState<PronosScheduleSource>('local');

  const loadCore = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPhasesInitialized(false);
    try {
      const [schedule, pronos] = await Promise.all([
        fetchAllPronosFixtures(),
        userId ? loadPronos(userId) : Promise.resolve({}),
      ]);
      const matches =
        schedule.matches.length > 0 ? schedule.matches : wc2026ToPronoMatches();
      setAllFixtures(matches);
      setScheduleSource(schedule.matches.length > 0 ? schedule.source : 'local');
      setSaved(pronos);
    } catch {
      setAllFixtures(wc2026ToPronoMatches());
      setScheduleSource('local');
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  const phases = useMemo((): PronoPhaseDef[] => buildPronoPhasesFromFixtures(allFixtures), [allFixtures]);

  useEffect(() => {
    if (!allFixtures.length || phasesInitialized) return;
    setActivePhase(pickDefaultPronoPhase(phases, allFixtures, saved));
    setPhasesInitialized(true);
  }, [allFixtures, phases, phasesInitialized, saved]);

  useEffect(() => {
    if (!phases.length || loading) return;
    if (!phases.some((p) => p.key === activePhase)) {
      setActivePhase(pickDefaultPronoPhase(phases, allFixtures, saved));
      return;
    }
    const count = allFixtures.filter((f) => fixtureMatchesPhase(f, activePhase)).length;
    if (count === 0) {
      setActivePhase(pickDefaultPronoPhase(phases, allFixtures, saved));
    }
  }, [activePhase, allFixtures, loading, phases, saved]);

  const matches = useMemo(
    () => allFixtures.filter((f) => fixtureMatchesPhase(f, activePhase)),
    [activePhase, allFixtures]
  );

  const phasePoints = useMemo(() => {
    const pts = Object.fromEntries(phases.map((p) => [p.key, 0])) as Record<string, number>;
    for (const [matchId, prono] of Object.entries(saved)) {
      const fx = allFixtures.find((f) => f.id === matchId);
      if (!fx) continue;
      const phase = resolveFixturePronoPhase(fx);
      if (!phase) continue;
      pts[phase] = (pts[phase] ?? 0) + (prono.pointsAwarded ?? 0);
    }
    return pts;
  }, [allFixtures, phases, saved]);

  const loadPopular = useCallback(async (matchIds: string[]) => {
    if (!matchIds.length) return;
    const entries = await Promise.all(
      matchIds.map(async (id) => {
        const rows = await loadPopularPronos(id);
        return [id, rows.length ? rows : getDefaultPopularPronos(id)] as const;
      })
    );
    setPopularByMatchId((prev) => {
      const next = { ...prev };
      for (const [id, rows] of entries) next[id] = rows;
      return next;
    });
  }, []);

  useEffect(() => {
    const ids = matches.map((m) => m.id);
    if (!ids.length) return undefined;
    void loadPopular(ids);
    const timer = setInterval(() => void loadPopular(ids), POPULAR_POLL_MS);
    return () => clearInterval(timer);
  }, [loadPopular, matches]);

  const submitProno = useCallback(
    async (matchId: string, homeScore: number, awayScore: number, predictedScorer?: string) => {
      const fixture = allFixtures.find((f) => f.id === matchId);
      if (!fixture || !canSubmitProno(fixture)) {
        setError('Pronos fermés pour ce match');
        return false;
      }
      const prono: Prono = {
        matchId,
        homeScore,
        awayScore,
        predictedScorer,
        submittedAt: Date.now(),
        country: countryCode,
      };
      if (!userId) {
        setError('Connecte-toi pour pronostiquer');
        return false;
      }
      setSavingId(matchId);
      setError(null);
      try {
        await saveProno(userId, prono, countryCode);
        setSaved((prev) => ({ ...prev, [matchId]: prono }));
        void loadPopular([matchId]);
        return true;
      } catch {
        setError('Enregistrement impossible');
        return false;
      } finally {
        setSavingId(null);
      }
    },
    [allFixtures, countryCode, loadPopular, userId]
  );

  const meta = useMemo(() => countryMeta(countryCode), [countryCode]);

  return {
    phases,
    activePhase,
    setActivePhase,
    phasePoints,
    matches,
    scheduleSource,
    allFixturesCount: allFixtures.length,
    saved,
    popularByMatchId,
    loading,
    savingId,
    error,
    submitProno,
    canSubmit: canSubmitProno,
    refetch: loadCore,
    countryCode,
    nationFlag: meta.flag,
    nationLabel: meta.name,
    nationPower: nation.power?.power ?? 0,
    worldRank: nation.worldRank,
    maxPronoPoints: POINTS.prono_exact_score,
  };
}

export function draftFromProno(prono: Prono | null | undefined): PronoDraft {
  if (!prono) return { home: null, away: null };
  return { home: prono.homeScore, away: prono.awayScore };
}
