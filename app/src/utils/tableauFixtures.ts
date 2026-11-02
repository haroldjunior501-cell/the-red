import { WC2026_KNOCKOUT_FIXTURES, mergeKnockoutWithCountryPath } from '../data/wc2026Knockout';
import type { GamesFixture } from '../types/games.types';
import { fetchGamesFixtures } from './gamesFixtures';
import { isLivescoreConfigured } from '../services/livescoreRawApi';

export type TableauScheduleSource = 'api' | 'local' | 'hybrid';

function isBracketPhase(phase: string): boolean {
  const p = phase.toLowerCase();
  return (
    p.includes('32') ||
    p.includes('16') ||
    p.includes('1/8') ||
    p.includes('huit') ||
    p.includes('quart') ||
    p.includes('semi') ||
    p.includes('demi') ||
    (p.includes('final') || p.includes('finale')) ||
    p.includes('3rd') ||
    p.includes('third') ||
    p.includes('petite')
  );
}

function mergeApiLocal(api: GamesFixture[], local: GamesFixture[]): GamesFixture[] {
  const byId = new Map<string, GamesFixture>();
  for (const row of local) byId.set(row.id, row);
  for (const row of api) {
    if (isBracketPhase(row.phase)) byId.set(row.id, row);
  }
  return [...byId.values()].sort((a, b) => a.kickoffMs - b.kickoffMs || a.id.localeCompare(b.id));
}

/**
 * Matchs KO pour le Tableau : calendrier FIFA intégré + enrichissement Live Score si dispo.
 */
export async function fetchTableauBracketFixtures(countryCode = ''): Promise<{
  fixtures: GamesFixture[];
  source: TableauScheduleSource;
}> {
  const local = mergeKnockoutWithCountryPath(WC2026_KNOCKOUT_FIXTURES, countryCode);

  if (!isLivescoreConfigured()) {
    return { source: 'local', fixtures: local };
  }

  try {
    const fromApi = await fetchGamesFixtures({ bracket: true });
    if (fromApi.length === 0) {
      return { source: 'local', fixtures: local };
    }
    const merged = mergeKnockoutWithCountryPath(mergeApiLocal(fromApi, WC2026_KNOCKOUT_FIXTURES), countryCode);
    const source: TableauScheduleSource = fromApi.length >= 8 ? 'api' : 'hybrid';
    return { source, fixtures: merged };
  } catch {
    return { source: 'local', fixtures: local };
  }
}
