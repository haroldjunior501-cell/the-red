import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FOTMOB_MU_TEAM_ID,
  FOTMOB_MU_WOMEN_TEAM_ID,
} from '../constants/fotmobTheRed';
import type { UnitedFormation } from '../constants/unitedGames';
import { useFirebaseAuthUid } from './useFirebaseAuthUid';
import {
  fetchManchesterUnitedTeam,
  fetchManchesterUnitedWomenTeam,
  pickUnitedNextMatch,
} from '../services/fotmobClubApi';
import { fetchFotmobSquad, type SquadMember } from '../services/fotmobSquad';
import {
  canEditLineup,
  canEditScoreMarkets,
  loadUnitedPrediction,
  minutesUntilLineupLock,
  saveUnitedPrediction,
} from '../services/unitedGamesService';
import type { UnitedMatchPrediction, UnitedTeamSegment } from '../types/unitedGames.types';
import type { WorldCupMatch } from '../services/footballService';

export type UnitedPronoDraft = {
  homeScore: number | null;
  awayScore: number | null;
  firstScorerId: string | null;
  firstScorerName: string | null;
  potmId: string | null;
  potmName: string | null;
  formation: UnitedFormation | null;
  starters: string[];
};

const emptyDraft = (): UnitedPronoDraft => ({
  homeScore: null,
  awayScore: null,
  firstScorerId: null,
  firstScorerName: null,
  potmId: null,
  potmName: null,
  formation: '4-2-3-1',
  starters: [],
});

export function useUnitedPronos() {
  const uid = useFirebaseAuthUid();
  const [segment, setSegment] = useState<UnitedTeamSegment>('men');
  const [match, setMatch] = useState<WorldCupMatch | null>(null);
  const [squad, setSquad] = useState<SquadMember[]>([]);
  const [draft, setDraft] = useState<UnitedPronoDraft>(emptyDraft);
  const [saved, setSaved] = useState<UnitedMatchPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const teamId = segment === 'men' ? FOTMOB_MU_TEAM_ID : FOTMOB_MU_WOMEN_TEAM_ID;
      const payload =
        segment === 'men'
          ? await fetchManchesterUnitedTeam()
          : await fetchManchesterUnitedWomenTeam();
      const next = pickUnitedNextMatch(payload);
      setMatch(next);
      const sq = await fetchFotmobSquad(teamId);
      setSquad(sq.filter((p) => !p.injury));

      if (next && uid) {
        const pred = await loadUnitedPrediction(uid, next.fixtureId);
        setSaved(pred);
        if (pred) {
          setDraft({
            homeScore: pred.homeScore,
            awayScore: pred.awayScore,
            firstScorerId: pred.firstScorerId,
            firstScorerName: pred.firstScorerName ?? null,
            potmId: pred.potmId,
            potmName: pred.potmName ?? null,
            formation: pred.formation,
            starters: pred.starters ?? [],
          });
        } else {
          setDraft(emptyDraft());
        }
      } else {
        setSaved(null);
        setDraft(emptyDraft());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }, [segment, uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const kickoffMs = useMemo(
    () => (match?.date ? new Date(match.date).getTime() : 0),
    [match?.date]
  );

  const lineupOpen = kickoffMs > 0 ? canEditLineup(kickoffMs) : false;
  const marketsOpen = kickoffMs > 0 ? canEditScoreMarkets(kickoffMs) : false;
  const minsToLineupLock = kickoffMs > 0 ? minutesUntilLineupLock(kickoffMs) : 0;
  // tick force recompute timers
  void tick;

  const updateDraft = useCallback((patch: Partial<UnitedPronoDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const toggleStarter = useCallback((playerId: string) => {
    setDraft((d) => {
      const has = d.starters.includes(playerId);
      if (has) return { ...d, starters: d.starters.filter((id) => id !== playerId) };
      if (d.starters.length >= 11) return d;
      return { ...d, starters: [...d.starters, playerId] };
    });
  }, []);

  const submit = useCallback(async () => {
    if (!uid) {
      setError('Connecte-toi pour pronostiquer');
      return false;
    }
    if (!match) return false;
    if (!marketsOpen && !lineupOpen) {
      setError('Pronostics verrouillés');
      return false;
    }
    setSaving(true);
    setError(null);
    try {
      const base: UnitedMatchPrediction = saved ?? {
        matchId: match.fixtureId,
        segment,
        homeScore: null,
        awayScore: null,
        firstScorerId: null,
        potmId: null,
        formation: null,
        starters: [],
        submittedAt: Date.now(),
      };

      const next: UnitedMatchPrediction = {
        ...base,
        matchId: match.fixtureId,
        segment,
        submittedAt: Date.now(),
      };

      if (marketsOpen) {
        next.homeScore = draft.homeScore;
        next.awayScore = draft.awayScore;
        next.firstScorerId = draft.firstScorerId;
        next.firstScorerName = draft.firstScorerName;
        next.potmId = draft.potmId;
        next.potmName = draft.potmName;
        next.marketsLockedAt = kickoffMs;
      }

      if (lineupOpen) {
        next.formation = draft.formation;
        next.starters = draft.starters;
        next.lineupLockedAt = kickoffMs - 90 * 60_000;
      } else if (saved) {
        next.formation = saved.formation;
        next.starters = saved.starters;
      }

      await saveUnitedPrediction(uid, next);
      setSaved(next);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    draft,
    kickoffMs,
    lineupOpen,
    marketsOpen,
    match,
    saved,
    segment,
    uid,
  ]);

  const unitedIsHome = useMemo(() => {
    if (!match) return true;
    const id = segment === 'men' ? String(FOTMOB_MU_TEAM_ID) : String(FOTMOB_MU_WOMEN_TEAM_ID);
    return match.home.id === id;
  }, [match, segment]);

  return {
    uid,
    segment,
    setSegment,
    match,
    squad,
    draft,
    saved,
    loading,
    saving,
    error,
    lineupOpen,
    marketsOpen,
    minsToLineupLock,
    kickoffMs,
    unitedIsHome,
    updateDraft,
    toggleStarter,
    submit,
    refresh,
  };
}
