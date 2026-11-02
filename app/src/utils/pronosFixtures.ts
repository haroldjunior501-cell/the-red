import type { GamesFixture } from '../types/games.types';
import type { PronoMatch, PronoPhaseKey } from '../types/pronos.types';
import { wc2026ToPronoMatches } from '../data/wc2026Matches';
import { fetchGamesFixturesForPronos } from './gamesFixtures';
import { fixtureMatchesPhase } from './pronosPhaseUtils';
import { formatKickoffLabel } from './liveMatchUtils';
import { isLivescoreConfigured } from '../services/livescoreRawApi';

function gamesFixtureToPronoMatch(f: GamesFixture): PronoMatch {
  const kickoff_label =
    f.kickoffMs > 0
      ? formatKickoffLabel(f.kickoffMs)
      : [f.date, f.time].filter(Boolean).join(' · ') || 'Date à confirmer';

  return {
    ...f,
    kickoff_label,
  };
}

/**
 * Calendrier pronos : base FIFA intégrée (72 matchs groupes), enrichie par Live Score si dispo.
 */
export type PronosScheduleSource = 'api' | 'local' | 'hybrid';

function enrichLocalWithApi(local: PronoMatch[], api: GamesFixture[]): PronoMatch[] {
  const apiById = new Map(api.map((row) => [row.id, row]));
  const merged = local.map((m) => {
    const patch = apiById.get(m.id);
    if (!patch) return m;
    return gamesFixtureToPronoMatch({
      ...m,
      homeName: patch.homeName || m.homeName,
      awayName: patch.awayName || m.awayName,
      homeCode: patch.homeCode || m.homeCode,
      awayCode: patch.awayCode || m.awayCode,
      date: patch.date || m.date,
      time: patch.time || m.time,
      phase: patch.phase || m.phase,
      group: patch.group || m.group,
      status: patch.status || m.status,
      kickoffMs: patch.kickoffMs > 0 ? patch.kickoffMs : m.kickoffMs,
    });
  });

  for (const row of api) {
    if (!merged.some((m) => m.id === row.id)) {
      merged.push(gamesFixtureToPronoMatch(row));
    }
  }

  return merged.sort((a, b) => a.kickoffMs - b.kickoffMs || a.id.localeCompare(b.id));
}

export async function fetchAllPronosFixtures(): Promise<{
  matches: PronoMatch[];
  source: PronosScheduleSource;
}> {
  const local = wc2026ToPronoMatches();

  if (!isLivescoreConfigured()) {
    return { source: 'local', matches: local };
  }

  try {
    const fromApi = await fetchGamesFixturesForPronos();
    if (fromApi.length === 0) {
      return { source: 'local', matches: local };
    }
    const merged = enrichLocalWithApi(local, fromApi);
    const source: PronosScheduleSource = fromApi.length >= 40 ? 'api' : 'hybrid';
    return { source, matches: merged };
  } catch {
    return { source: 'local', matches: local };
  }
}

export async function fetchPronosMatchesByPhase(phase: PronoPhaseKey): Promise<PronoMatch[]> {
  const { matches: all } = await fetchAllPronosFixtures();
  return all.filter((f) => fixtureMatchesPhase(f, phase));
}

export function groupMatchesByDate(matches: PronoMatch[]): { dateKey: string; label: string; items: PronoMatch[] }[] {
  const map = new Map<string, PronoMatch[]>();
  for (const m of matches) {
    const key =
      m.kickoffMs > 0
        ? new Date(m.kickoffMs).toISOString().slice(0, 10)
        : m.date || 'unknown';
    const list = map.get(key) ?? [];
    list.push(m);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, items]) => ({
      dateKey,
      label:
        items[0]?.kickoffMs > 0
          ? new Date(items[0].kickoffMs).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })
          : items[0]?.date ?? (dateKey === 'unknown' ? 'Date à confirmer' : dateKey),
      items: items.sort((a, b) => a.kickoffMs - b.kickoffMs),
    }));
}
