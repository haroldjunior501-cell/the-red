import { COUNTRIES } from '../constants/countries';
import { WC_GROUP_ENTRIES } from '../constants/liveGroups';
import type { LiveGroupStandings, Standing } from '../types/live.types';

/** Classement initial : toutes les équipes à 0 pt en attendant les vrais résultats. */
export function buildInitialGroupStandings(): LiveGroupStandings[] {
  return WC_GROUP_ENTRIES.map((entry) => {
    const teams: Standing[] = COUNTRIES.filter((c) => c.group === entry.letter)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      .map((c, idx) => ({
        position: idx + 1,
        team_name: c.name,
        country_code: c.code,
        points: 0,
        goal_difference: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
      }));

    return {
      name: entry.name,
      id: entry.id,
      letter: entry.letter,
      teams,
    };
  });
}
