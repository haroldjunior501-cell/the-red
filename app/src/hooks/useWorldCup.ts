import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getH2H,
  getInjuries,
  getLiveMatch,
  getTeamForm,
  getTeamStats,
  getTopScorers,
  getWorldCupNextContext,
  isFootballApiQuotaExceeded,
  liveResultToWorldCupMatch,
  nextResultToWorldCupMatch,
  resolveCountryCodeForTeamId,
  type FormChar,
  type H2HSummary,
  type Injury,
  type LiveMatchResult,
  type TeamStats,
  type TopScorer,
  type WorldCupMatch,
} from '../services/footballService';

function errMsg(e: unknown): string | null {
  if (!e) return null;
  if (e instanceof Error) return e.message;
  return String(e);
}

const STALE_MS = 5 * 60 * 1000;
const LIVE_MS = 30_000;

function wcQueriesEnabled(code: string): boolean {
  return !!code.trim() && !isFootballApiQuotaExceeded();
}

function wcRetry(failureCount: number, error: unknown): boolean {
  if (isFootballApiQuotaExceeded() || failureCount >= 2) return false;
  if (error instanceof Error && error.message.toLowerCase().includes('limit')) return false;
  return true;
}

export function useWorldCup(countryCode: string) {
  const code = countryCode.trim().toUpperCase();
  const qc = useQueryClient();

  const nextCtxQuery = useQuery({
    queryKey: ['wc', 'nextCtx', code] as const,
    queryFn: () => getWorldCupNextContext(code),
    enabled: wcQueriesEnabled(code),
    staleTime: STALE_MS,
    retry: wcRetry,
  });

  const nextMatch: WorldCupMatch | null = useMemo(() => {
    const n = nextCtxQuery.data?.next;
    return n ? nextResultToWorldCupMatch(n) : null;
  }, [nextCtxQuery.data?.next]);

  const userTeamId = nextCtxQuery.data?.userTeamId;

  const oppTeamId = useMemo(() => {
    if (!nextMatch || userTeamId == null) return null;
    if (nextMatch.home.id === userTeamId) return nextMatch.away.id;
    if (nextMatch.away.id === userTeamId) return nextMatch.home.id;
    return null;
  }, [nextMatch, userTeamId]);

  const oppCode = useMemo(() => {
    if (oppTeamId == null) return null;
    return resolveCountryCodeForTeamId(oppTeamId, code);
  }, [oppTeamId, code]);

  const liveQuery = useQuery({
    queryKey: ['wc', 'live', code] as const,
    queryFn: () => getLiveMatch(code),
    enabled: wcQueriesEnabled(code),
    staleTime: 0,
    refetchInterval: isFootballApiQuotaExceeded() ? false : LIVE_MS,
    retry: wcRetry,
  });

  const liveDetail: LiveMatchResult | null = liveQuery.data ?? null;
  const liveMatch: WorldCupMatch | null = useMemo(
    () => (liveDetail ? liveResultToWorldCupMatch(liveDetail) : null),
    [liveDetail]
  );

  const topScorersQuery = useQuery({
    queryKey: ['wc', 'topScorers'] as const,
    queryFn: () => getTopScorers(),
    enabled: wcQueriesEnabled(code),
    staleTime: STALE_MS,
    retry: wcRetry,
  });

  const teamStatsQuery = useQuery({
    queryKey: ['wc', 'stats', code] as const,
    queryFn: () => getTeamStats(code),
    enabled: wcQueriesEnabled(code),
    staleTime: STALE_MS,
    retry: wcRetry,
  });

  const formSelfQuery = useQuery({
    queryKey: ['wc', 'form', code] as const,
    queryFn: () => getTeamForm(code),
    enabled: wcQueriesEnabled(code),
    staleTime: STALE_MS,
    retry: wcRetry,
  });

  const formOppQuery = useQuery({
    queryKey: ['wc', 'formOpp', oppCode ?? ''] as const,
    queryFn: () => getTeamForm(oppCode!),
    enabled: wcQueriesEnabled(code) && !!oppCode,
    staleTime: STALE_MS,
    retry: wcRetry,
  });

  const injuriesQuery = useQuery({
    queryKey: ['wc', 'injuries', code] as const,
    queryFn: () => getInjuries(code),
    enabled: wcQueriesEnabled(code),
    staleTime: STALE_MS,
    retry: wcRetry,
  });

  const h2hQuery = useQuery({
    queryKey: ['wc', 'h2h', code, oppCode ?? ''] as const,
    queryFn: () => getH2H(code, oppCode!),
    enabled: wcQueriesEnabled(code) && !!oppCode,
    staleTime: STALE_MS,
    retry: wcRetry,
  });

  const loadingStatic =
    !!code &&
    (nextCtxQuery.isPending ||
      topScorersQuery.isPending ||
      teamStatsQuery.isPending ||
      formSelfQuery.isPending ||
      injuriesQuery.isPending ||
      (oppCode ? formOppQuery.isPending || h2hQuery.isPending : false));

  const error = useMemo(
    () =>
      errMsg(nextCtxQuery.error) ??
      errMsg(liveQuery.error) ??
      errMsg(topScorersQuery.error) ??
      errMsg(teamStatsQuery.error) ??
      errMsg(formSelfQuery.error) ??
      errMsg(formOppQuery.error) ??
      errMsg(injuriesQuery.error) ??
      errMsg(h2hQuery.error),
    [
      nextCtxQuery.error,
      liveQuery.error,
      topScorersQuery.error,
      teamStatsQuery.error,
      formSelfQuery.error,
      formOppQuery.error,
      injuriesQuery.error,
      h2hQuery.error,
    ]
  );

  const emptyData = useMemo(() => {
    if (!code || loadingStatic) return false;
    const noNext = !nextMatch;
    const noLive = !liveMatch;
    const noScorers = (topScorersQuery.data?.length ?? 0) === 0;
    return noNext && noLive && noScorers;
  }, [code, loadingStatic, nextMatch, liveMatch, topScorersQuery.data?.length]);

  return {
    nextMatch,
    liveMatch,
    liveDetail,
    topScorers: (topScorersQuery.data ?? []) as TopScorer[],
    teamStats: (teamStatsQuery.data ?? null) as TeamStats | null,
    formSelf: (formSelfQuery.data ?? []) as FormChar[],
    formOpp: (formOppQuery.data ?? []) as FormChar[],
    injuries: (injuriesQuery.data ?? []) as Injury[],
    h2h: (h2hQuery.data ?? null) as H2HSummary | null,
    oppCode: oppCode ?? null,
    loadingStatic,
    loadingLive: !!code && liveQuery.isFetching,
    error,
    emptyData,
    refetchStatic: async () => {
      if (!code) return;
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['wc', 'nextCtx', code] }),
        qc.invalidateQueries({ queryKey: ['wc', 'live', code] }),
        qc.invalidateQueries({ queryKey: ['wc', 'topScorers'] }),
        qc.invalidateQueries({ queryKey: ['wc', 'stats', code] }),
        qc.invalidateQueries({ queryKey: ['wc', 'form', code] }),
        qc.invalidateQueries({ queryKey: ['wc', 'formOpp'] }),
        qc.invalidateQueries({ queryKey: ['wc', 'injuries', code] }),
        qc.invalidateQueries({ queryKey: ['wc', 'h2h'] }),
      ]);
    },
  };
}
