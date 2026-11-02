import { useQuery } from '@tanstack/react-query';
import {
  getH2HDetail,
  getTeamFormDetail,
  hasFootballApiKey,
  isFootballApiQuotaExceeded,
  type FormMatchDetail,
  type H2HDetail,
} from '../services/footballService';

export type PreMatchModalKind = 'h2h' | 'form' | 'injuries' | null;

function enabled(code: string): boolean {
  return !!code && hasFootballApiKey() && !isFootballApiQuotaExceeded();
}

export function usePreMatchInsights(
  modal: PreMatchModalKind,
  selfCode: string,
  oppCode: string | null
) {
  const h2hQuery = useQuery({
    queryKey: ['wc', 'h2hDetail', selfCode, oppCode ?? ''] as const,
    queryFn: () => getH2HDetail(selfCode, oppCode!),
    enabled: modal === 'h2h' && enabled(selfCode) && !!oppCode,
    staleTime: 5 * 60 * 1000,
  });

  const formSelfQuery = useQuery({
    queryKey: ['wc', 'formDetail', selfCode] as const,
    queryFn: () => getTeamFormDetail(selfCode),
    enabled: modal === 'form' && enabled(selfCode),
    staleTime: 5 * 60 * 1000,
  });

  const formOppQuery = useQuery({
    queryKey: ['wc', 'formDetail', 'opp', oppCode ?? ''] as const,
    queryFn: () => getTeamFormDetail(oppCode!),
    enabled: modal === 'form' && enabled(selfCode) && !!oppCode,
    staleTime: 5 * 60 * 1000,
  });

  return {
    h2hDetail: (h2hQuery.data ?? null) as H2HDetail | null,
    h2hLoading: h2hQuery.isPending,
    h2hError: h2hQuery.error,
    formSelf: (formSelfQuery.data ?? []) as FormMatchDetail[],
    formOpp: (formOppQuery.data ?? []) as FormMatchDetail[],
    formLoading: formSelfQuery.isPending || (!!oppCode && formOppQuery.isPending),
    formError: formSelfQuery.error ?? formOppQuery.error,
  };
}
