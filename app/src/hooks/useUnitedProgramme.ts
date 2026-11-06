import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  fetchManchesterUnitedFixtures,
  pickUnitedSeasonFixtures,
  type UnitedProgrammeMatch,
} from '../services/fotmobClubApi';

const STALE_MS = 5 * 60 * 1000;

export type ProgrammeFilter = 'all' | 'upcoming' | 'played';

export function useUnitedProgramme() {
  const query = useQuery({
    queryKey: ['thered', 'mu', 'fixtures'] as const,
    queryFn: () => fetchManchesterUnitedFixtures(),
    staleTime: STALE_MS,
    retry: 2,
  });

  const fixtures: UnitedProgrammeMatch[] = useMemo(
    () => (query.data ? pickUnitedSeasonFixtures(query.data) : []),
    [query.data]
  );

  const competitions = useMemo(() => {
    const set = new Set<string>();
    for (const m of fixtures) {
      if (m.competition) set.add(m.competition);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [fixtures]);

  const nextUpcomingId = useMemo(() => {
    const now = Date.now();
    const next = fixtures.find(
      (m) => m.kickoffMs >= now - 3 * 60 * 60 * 1000 && m.statusShort !== 'FT' && m.statusShort !== 'CANC'
    );
    return next?.fixtureId ?? null;
  }, [fixtures]);

  return {
    fixtures,
    competitions,
    nextUpcomingId,
    loading: query.isLoading && fixtures.length === 0,
    refreshing: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refresh: () => query.refetch(),
  };
}

export function filterProgramme(
  fixtures: UnitedProgrammeMatch[],
  status: ProgrammeFilter,
  competition: string | null
): UnitedProgrammeMatch[] {
  const now = Date.now();
  return fixtures.filter((m) => {
    if (competition && m.competition !== competition) return false;
    const played = m.statusShort === 'FT' || m.resultVsUnited != null;
    if (status === 'played') return played;
    if (status === 'upcoming') return !played && m.statusShort !== 'CANC' && m.kickoffMs >= now - 2 * 60 * 60 * 1000;
    return true;
  });
}
