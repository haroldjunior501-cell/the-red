import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { FOTMOB_MU_TEAM_ID } from '../constants/fotmobTheRed';
import type {
  FormChar,
  FormMatchDetail,
  H2HDetail,
  H2HSummary,
  Injury,
  TeamStats,
  TopScorer,
  WorldCupMatch,
} from '../services/footballService';
import type { LiveMatchResult } from '../types/footballHome.types';
import {
  fetchManchesterUnitedTeam,
  pickUnitedForm,
  pickUnitedFormDetail,
  pickUnitedInjuries,
  pickUnitedLiveMatch,
  pickUnitedNextMatch,
  unitedLiveDetail,
} from '../services/fotmobClubApi';
import { fetchPremierLeagueTable, pickTeamStanding } from '../services/fotmobLeague';
import { fetchFotmobMatchPrep } from '../services/fotmobMatchPrep';
import { fetchFotmobSquad } from '../services/fotmobSquad';
import { getUnitedTopScorers } from '../services/unitedPlayerStats';

const STALE_MS = 5 * 60 * 1000;
const LIVE_MS = 30_000;

export function useTheRedHome() {
  const qc = useQueryClient();

  const teamQuery = useQuery({
    queryKey: ['thered', 'mu', 'team'] as const,
    queryFn: () => fetchManchesterUnitedTeam(),
    staleTime: STALE_MS,
    refetchInterval: LIVE_MS,
    retry: 2,
  });

  const scorersQuery = useQuery({
    queryKey: ['thered', 'mu', 'topScorers'] as const,
    queryFn: async () => {
      const rows = await getUnitedTopScorers(15);
      return rows.map(
        (r): TopScorer => ({
          name: r.name,
          team: r.team,
          goals: r.value,
          photo: r.photo,
          fotmobId: r.fotmobId,
        })
      );
    },
    staleTime: STALE_MS,
    retry: 2,
  });

  const tableQuery = useQuery({
    queryKey: ['thered', 'pl', 'table'] as const,
    queryFn: () => fetchPremierLeagueTable(),
    staleTime: STALE_MS,
    retry: 2,
  });

  const squadQuery = useQuery({
    queryKey: ['thered', 'mu', 'squad'] as const,
    queryFn: () => fetchFotmobSquad(FOTMOB_MU_TEAM_ID),
    staleTime: STALE_MS * 2,
    retry: 1,
  });

  const nextMatch: WorldCupMatch | null = useMemo(
    () => (teamQuery.data ? pickUnitedNextMatch(teamQuery.data) : null),
    [teamQuery.data]
  );

  const liveMatch: WorldCupMatch | null = useMemo(
    () => (teamQuery.data ? pickUnitedLiveMatch(teamQuery.data) : null),
    [teamQuery.data]
  );

  const liveDetail: LiveMatchResult | null = useMemo(
    () => (liveMatch ? unitedLiveDetail(liveMatch) : null),
    [liveMatch]
  );

  const fixtureId = nextMatch?.fixtureId ?? liveMatch?.fixtureId ?? null;
  const mu = String(FOTMOB_MU_TEAM_ID);

  const oppId = useMemo(() => {
    const m = nextMatch ?? liveMatch;
    if (!m) return null;
    if (m.home.id === mu) return m.away.id;
    if (m.away.id === mu) return m.home.id;
    return null;
  }, [liveMatch, mu, nextMatch]);

  /** Parseur FootballIntelligence — matchDetails (forme, H2H, absents 2 clubs). */
  const prepQuery = useQuery({
    queryKey: ['thered', 'matchPrep', fixtureId ?? ''] as const,
    queryFn: () => fetchFotmobMatchPrep(fixtureId!),
    enabled: !!fixtureId,
    staleTime: STALE_MS,
    retry: 2,
  });

  const prep = prepQuery.data;

  const muIsHome = useMemo(() => {
    if (!prep) {
      const m = nextMatch ?? liveMatch;
      return m?.home.id === mu;
    }
    return String(prep.home.id) === mu;
  }, [liveMatch, mu, nextMatch, prep]);

  const formSelf: FormChar[] = useMemo(() => {
    if (prep) {
      const rows = muIsHome ? prep.homeForm : prep.awayForm;
      return rows.map((r) => r.result).slice(0, 5);
    }
    return teamQuery.data ? pickUnitedForm(teamQuery.data) : [];
  }, [muIsHome, prep, teamQuery.data]);

  const formOpp: FormChar[] = useMemo(() => {
    if (prep) {
      const rows = muIsHome ? prep.awayForm : prep.homeForm;
      return rows.map((r) => r.result).slice(0, 5);
    }
    return [];
  }, [muIsHome, prep]);

  const formSelfDetail: FormMatchDetail[] = useMemo(() => {
    if (prep) {
      const rows = muIsHome ? prep.homeForm : prep.awayForm;
      return rows.map(({ result, label, subtitle }) => ({ result, label, subtitle }));
    }
    return teamQuery.data ? pickUnitedFormDetail(teamQuery.data) : [];
  }, [muIsHome, prep, teamQuery.data]);

  const formOppDetail: FormMatchDetail[] = useMemo(() => {
    if (!prep) return [];
    const rows = muIsHome ? prep.awayForm : prep.homeForm;
    return rows.map(({ result, label, subtitle }) => ({ result, label, subtitle }));
  }, [muIsHome, prep]);

  const injuries: Injury[] = useMemo(() => {
    if (prep?.unavailable.length) {
      return prep.unavailable
        .filter((u) => u.isHome === muIsHome)
        .map(({ name, reason, photo }) => ({ name, reason, photo }));
    }
    return teamQuery.data ? pickUnitedInjuries(teamQuery.data) : [];
  }, [muIsHome, prep, teamQuery.data]);

  const injuriesOpp: Injury[] = useMemo(() => {
    if (prep?.unavailable.length) {
      return prep.unavailable
        .filter((u) => u.isHome !== muIsHome)
        .map(({ name, reason, photo }) => ({ name, reason, photo }));
    }
    return [];
  }, [muIsHome, prep]);

  /** H2H : winsTeam1 = MU, winsTeam2 = adversaire (même convention HomeScreen). */
  const h2hDetail: H2HDetail | null = useMemo(() => {
    if (!prep) return null;
    const raw = prep.h2h;
    if (muIsHome) return raw;
    return {
      winsTeam1: raw.winsTeam2,
      draws: raw.draws,
      winsTeam2: raw.winsTeam1,
      goalsTeam1: raw.goalsTeam2,
      goalsTeam2: raw.goalsTeam1,
      matches: raw.matches,
    };
  }, [muIsHome, prep]);

  const h2h: H2HSummary | null = h2hDetail
    ? {
        winsTeam1: h2hDetail.winsTeam1,
        draws: h2hDetail.draws,
        winsTeam2: h2hDetail.winsTeam2,
      }
    : null;

  const muStanding = useMemo(
    () => (tableQuery.data ? pickTeamStanding(tableQuery.data, FOTMOB_MU_TEAM_ID) : null),
    [tableQuery.data]
  );

  const loadingStatic = teamQuery.isPending;
  const emptyData =
    !loadingStatic && !nextMatch && !liveMatch && (scorersQuery.data?.length ?? 0) === 0;

  return {
    nextMatch,
    liveMatch,
    liveDetail,
    topScorers: (scorersQuery.data ?? []) as TopScorer[],
    teamStats: null as TeamStats | null,
    formSelf,
    formOpp,
    formSelfDetail,
    formOppDetail,
    injuries,
    injuriesOpp,
    h2h,
    h2hDetail,
    h2hLoading: prepQuery.isPending,
    formLoading: teamQuery.isPending || (!!fixtureId && prepQuery.isPending),
    matchInsights: prep?.insights ?? [],
    matchStadium: prep?.stadium ?? null,
    matchLeague: prep?.leagueName ?? null,
    leagueTable: tableQuery.data ?? [],
    muStanding,
    squad: squadQuery.data ?? [],
    oppCode: oppId,
    loadingStatic,
    loadingLive: teamQuery.isFetching,
    error: teamQuery.error instanceof Error ? teamQuery.error.message : null,
    emptyData,
    refetchStatic: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['thered', 'mu', 'team'] }),
        qc.invalidateQueries({ queryKey: ['thered', 'mu', 'topScorers'] }),
        qc.invalidateQueries({ queryKey: ['thered', 'pl', 'table'] }),
        qc.invalidateQueries({ queryKey: ['thered', 'mu', 'squad'] }),
        qc.invalidateQueries({ queryKey: ['thered', 'matchPrep'] }),
      ]);
    },
  };
}
