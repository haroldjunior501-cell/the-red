import { useCallback, useEffect, useState } from 'react';
import { buildInitialGroupStandings } from '../data/wc2026Groups';
import { WC_GROUP_ENTRIES } from '../constants/liveGroups';
import { getFixtures, getStandings, getWorldCupParticipants, isFootballDataConfigured } from '../services/livescoreApi';
import { parseStandings, parseTeamsByGroupId } from '../services/liveMatchParsers';
import { resolveCountryDisplayCode } from '../utils/countryDisplayCode';
import type { LiveGroupStandings, Standing } from '../types/live.types';

const POLL_MS = 120_000;
const INITIAL = buildInitialGroupStandings();

function mergeWithInitial(apiGroups: LiveGroupStandings[]): LiveGroupStandings[] {
  return INITIAL.map((base) => {
    const fromApi = apiGroups.find((g) => g.letter === base.letter || g.id === base.id);
    if (!fromApi?.teams.length) return base;
    const byCode = new Map(fromApi.teams.map((t) => [t.country_code.toUpperCase(), t]));
    const teams: Standing[] = base.teams.map((row) => {
      const live = byCode.get(row.country_code.toUpperCase());
      if (!live) return row;
      return {
        ...row,
        points: live.points,
        goal_difference: live.goal_difference,
        played: live.played,
        wins: live.wins,
        draws: live.draws ?? 0,
        losses: live.losses ?? 0,
        goals_for: live.goals_for ?? 0,
        goals_against: live.goals_against ?? 0,
        position: live.position,
      };
    });
    return { ...base, teams };
  });
}

export function useLiveAllGroups(enabled: boolean) {
  const [groups, setGroups] = useState<LiveGroupStandings[]>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllGroups = useCallback(async (silent: boolean) => {
    if (!enabled) {
      setGroups(INITIAL);
      setLoading(false);
      return;
    }

    if (!isFootballDataConfigured()) {
      setGroups(INITIAL);
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    try {
      let fallbackByGroup: Record<string, Standing[]> = {};
      try {
        const [participantsRes, fixturesRes] = await Promise.all([
          getWorldCupParticipants(),
          getFixtures(),
        ]);
        const fromParticipants = parseTeamsByGroupId(participantsRes);
        const fromFixtures = parseTeamsByGroupId(fixturesRes);
        fallbackByGroup = { ...fromFixtures, ...fromParticipants };
      } catch {
        /* garde tableaux à 0 */
      }

      const results = await Promise.all(
        WC_GROUP_ENTRIES.map(async (entry) => {
          try {
            const res = await getStandings(entry.id);
            const teams = parseStandings(res);
            const fallback = fallbackByGroup[entry.id] ?? [];
            const base = INITIAL.find((g) => g.letter === entry.letter);
            if (teams.length) {
              return {
                name: entry.name,
                id: entry.id,
                letter: entry.letter,
                teams: teams.map((t) => ({
                  ...t,
                  country_code: resolveCountryDisplayCode({
                    iso: t.country_code,
                    teamName: t.team_name,
                  }),
                })),
              };
            }
            if (fallback.length && base) {
              return {
                name: entry.name,
                id: entry.id,
                letter: entry.letter,
                teams: base.teams,
              };
            }
            return base ?? { name: entry.name, id: entry.id, letter: entry.letter, teams: [] };
          } catch {
            const base = INITIAL.find((g) => g.letter === entry.letter);
            return base ?? { name: entry.name, id: entry.id, letter: entry.letter, teams: [] };
          }
        })
      );
      setGroups(mergeWithInitial(results));
      setError(null);
    } catch {
      setError('Groupes indisponibles');
      setGroups(INITIAL);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void fetchAllGroups(false);
    if (!enabled) return undefined;
    const id = setInterval(() => void fetchAllGroups(true), POLL_MS);
    return () => clearInterval(id);
  }, [enabled, fetchAllGroups]);

  return { groups, loading, error, refetch: () => void fetchAllGroups(false) };
}
