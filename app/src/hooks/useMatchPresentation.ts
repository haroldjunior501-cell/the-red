import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { findWc2026MatchById } from '../data/wc2026Matches';
import {
  getH2HDetail,
  getTeamFormDetail,
  hasFootballApiKey,
  isFootballApiQuotaExceeded,
  type FormMatchDetail,
  type H2HDetail,
} from '../services/footballService';
import {
  getLiveCommentary,
  getMatchLineups,
  isFootballDataConfigured,
} from '../services/livescoreApi';

export type MatchPresentationParams = {
  fixtureId?: string;
  selfCode?: string;
  oppCode?: string;
  homeName?: string;
  awayName?: string;
  homeId?: string;
  awayId?: string;
  homeLogo?: string;
  awayLogo?: string;
  date?: string;
  venue?: string;
  phase?: string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function parseCommentary(payload: unknown): string[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = asRecord(root.data) ?? root;
  const lines: string[] = [];
  for (const key of ['commentary', 'comment', 'line'] as const) {
    const v = data[key];
    if (Array.isArray(v)) {
      for (const row of v) {
        const o = asRecord(row);
        const text = typeof row === 'string' ? row : String(o?.text ?? o?.comment ?? '');
        if (text.trim()) lines.push(text.trim());
      }
      break;
    }
  }
  return lines.slice(-12);
}

function formatKickoffFr(isoOrMs: string | number): string {
  const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function apiEnabled(code: string): boolean {
  return !!code && hasFootballApiKey() && !isFootballApiQuotaExceeded();
}

export function useMatchPresentation(params: MatchPresentationParams) {
  const fixtureId = params.fixtureId?.trim() ?? '';
  const selfCode = params.selfCode?.trim() ?? '';
  const oppCode = params.oppCode?.trim() ?? '';
  const homeName = params.homeName?.trim() || '—';
  const awayName = params.awayName?.trim() || '—';

  const wc = useMemo(
    () => (fixtureId ? findWc2026MatchById(fixtureId) : undefined),
    [fixtureId]
  );

  const kickoffLabel = useMemo(() => {
    if (wc?.kickoffMs) return formatKickoffFr(wc.kickoffMs);
    if (params.date) return formatKickoffFr(params.date);
    return '';
  }, [params.date, wc?.kickoffMs]);

  const phaseLabel = params.phase?.trim() || wc?.group || 'Coupe du monde 2026';
  const venueLabel =
    params.venue?.trim() ||
    (wc ? `${wc.group} · ${wc.date} · ${wc.time}` : '');

  const h2hQuery = useQuery({
    queryKey: ['matchPresentation', 'h2h', selfCode, oppCode] as const,
    queryFn: () => getH2HDetail(selfCode, oppCode),
    enabled: apiEnabled(selfCode) && !!oppCode,
    staleTime: 5 * 60 * 1000,
  });

  const formSelfQuery = useQuery({
    queryKey: ['matchPresentation', 'form', selfCode] as const,
    queryFn: () => getTeamFormDetail(selfCode),
    enabled: apiEnabled(selfCode),
    staleTime: 5 * 60 * 1000,
  });

  const formOppQuery = useQuery({
    queryKey: ['matchPresentation', 'form', 'opp', oppCode] as const,
    queryFn: () => getTeamFormDetail(oppCode),
    enabled: apiEnabled(selfCode) && !!oppCode,
    staleTime: 5 * 60 * 1000,
  });

  const lineupsQuery = useQuery({
    queryKey: ['matchPresentation', 'lineups', fixtureId] as const,
    queryFn: () => getMatchLineups(fixtureId),
    enabled: !!fixtureId && isFootballDataConfigured(),
    staleTime: 2 * 60 * 1000,
  });

  const commentaryQuery = useQuery({
    queryKey: ['matchPresentation', 'commentary', fixtureId] as const,
    queryFn: () => getLiveCommentary(fixtureId),
    enabled: !!fixtureId && isFootballDataConfigured(),
    staleTime: 60 * 1000,
  });

  const loading =
    h2hQuery.isPending ||
    formSelfQuery.isPending ||
    (!!oppCode && formOppQuery.isPending);

  return {
    fixtureId,
    homeName,
    awayName,
    homeLogo: params.homeLogo,
    awayLogo: params.awayLogo,
    kickoffLabel,
    phaseLabel,
    venueLabel,
    wc,
    h2h: (h2hQuery.data ?? null) as H2HDetail | null,
    h2hLoading: h2hQuery.isPending,
    formSelf: (formSelfQuery.data ?? []) as FormMatchDetail[],
    formOpp: (formOppQuery.data ?? []) as FormMatchDetail[],
    formLoading: formSelfQuery.isPending || (!!oppCode && formOppQuery.isPending),
    lineups: asRecord(lineupsQuery.data),
    lineupsLoading: lineupsQuery.isPending,
    commentary: parseCommentary(commentaryQuery.data),
    commentaryLoading: commentaryQuery.isPending,
    loading,
    dataConfigured: hasFootballApiKey(),
  };
}
