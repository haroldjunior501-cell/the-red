import { WC_GROUP_ENTRIES } from '../constants/liveGroups';
import type { TeamStatKind } from '../constants/homeStats';
import { getStandings } from './livescoreApi';
import { parseStandings } from './liveMatchParsers';
import type { Standing } from '../types/live.types';

export type TeamRankingRow = {
  teamName: string;
  countryCode: string;
  value: number;
};

function valueForKind(team: Standing, kind: TeamStatKind): number {
  switch (kind) {
    case 'goals':
      return team.goals_for ?? 0;
    case 'possession':
      return team.points;
    case 'passAccuracy':
      return team.goal_difference;
    case 'shots':
      return team.wins;
    default:
      return 0;
  }
}

function dedupeTeams(teams: Standing[]): Standing[] {
  const byCode = new Map<string, Standing>();
  for (const t of teams) {
    const key = (t.country_code || t.team_name).toUpperCase();
    const prev = byCode.get(key);
    if (!prev || t.points > prev.points) {
      byCode.set(key, t);
    }
  }
  return [...byCode.values()];
}

export async function getTeamStatsRanking(kind: TeamStatKind, limit = 50): Promise<TeamRankingRow[]> {
  const merged: Standing[] = [];
  const results = await Promise.all(
    WC_GROUP_ENTRIES.map(async (entry) => {
      try {
        return parseStandings(await getStandings(entry.id));
      } catch {
        return [] as Standing[];
      }
    })
  );
  for (const group of results) {
    merged.push(...group);
  }

  const teams = dedupeTeams(merged);
  const ranked = teams
    .map((t) => ({
      teamName: t.team_name,
      countryCode: t.country_code,
      value: valueForKind(t, kind),
    }))
    .sort((a, b) => b.value - a.value);

  return ranked.slice(0, limit);
}

export function teamStatFootnote(kind: TeamStatKind): string | null {
  switch (kind) {
    case 'possession':
      return 'Classement par points (possession détaillée bientôt disponible).';
    case 'passAccuracy':
      return 'Classement par différence de buts (précision passes bientôt disponible).';
    case 'shots':
      return 'Classement par victoires (tirs détaillés bientôt disponible).';
    default:
      return null;
  }
}
