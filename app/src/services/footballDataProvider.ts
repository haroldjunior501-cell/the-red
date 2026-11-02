/**
 * Couche données football CDM 2026 — **hybride**
 *
 * • **Live Score API** (principal) : matchs, live, classements, calendrier, événements, buteurs (stats)
 * • **FotMob** (secours compétition + enrichissement) : calendrier de secours, visages & stats joueurs
 *
 * Enrichissement joueurs : voir `footballHybridService.ts` + `fotmobPlayerEnrichment.ts`
 */
import {
  getFotmobFixturesForTeamPayload,
  getFotmobFixturesPayload,
  getFotmobHead2HeadPayload,
  getFotmobLiveMatchesPayload,
  getFotmobMatchHistoryPayload,
  getFotmobParticipantsPayload,
  getFotmobStandingsPayload,
  isFotmobFootballReachable,
  testFotmobFootballConnection,
} from './fotmobFootballApi';
import {
  isLivescoreConfigured,
  rawGetFixtures,
  rawGetFixturesList,
  rawGetHead2Head,
  rawGetLiveMatches,
  rawGetMatchEvents,
  rawGetMatchHistory,
  rawGetStandings,
  rawGetTopScorers,
  rawGetWorldCupParticipants,
} from './livescoreRawApi';

export type FootballDataSource = 'livescore' | 'fotmob';

let activeSource: FootballDataSource = 'livescore';
let livescoreDisabledUntil = 0;

const LIVESCORE_COOLDOWN_MS = 1000 * 60 * 3;

export function getActiveFootballDataSource(): FootballDataSource {
  return activeSource;
}

export function isFootballDataConfigured(): boolean {
  return isLivescoreConfigured() || isFotmobFootballReachable();
}

export function isPrimaryLiveScore(): boolean {
  return activeSource === 'livescore';
}

async function withLiveScoreFirst(
  livescoreFn: () => Promise<unknown>,
  fotmobFn: () => Promise<{ data: unknown[] }>
): Promise<unknown> {
  if (Date.now() < livescoreDisabledUntil && isFotmobFootballReachable()) {
    activeSource = 'fotmob';
    const payload = await fotmobFn();
    return payload;
  }

  if (isLivescoreConfigured()) {
    try {
      const payload = await livescoreFn();
      activeSource = 'livescore';
      return payload;
    } catch {
      livescoreDisabledUntil = Date.now() + LIVESCORE_COOLDOWN_MS;
    }
  }

  if (isFotmobFootballReachable()) {
    activeSource = 'fotmob';
    return fotmobFn();
  }

  throw new Error(
    'Aucune source football : configure EXPO_PUBLIC_LIVESCORE_KEY/SECRET ou vérifie FotMob.'
  );
}

export async function providerGetLiveMatches(): Promise<unknown> {
  return withLiveScoreFirst(rawGetLiveMatches, getFotmobLiveMatchesPayload);
}

export async function providerGetFixtures(): Promise<unknown> {
  return withLiveScoreFirst(() => rawGetFixtures(), getFotmobFixturesPayload);
}

export async function providerGetFixturesList(extra: Record<string, string> = {}): Promise<unknown> {
  const team = extra.team?.trim();
  if (team) {
    return withLiveScoreFirst(
      () => rawGetFixturesList(extra),
      () => getFotmobFixturesForTeamPayload(team)
    );
  }
  return withLiveScoreFirst(() => rawGetFixturesList(extra), getFotmobFixturesPayload);
}

export async function providerGetWorldCupParticipants(): Promise<unknown> {
  return withLiveScoreFirst(rawGetWorldCupParticipants, getFotmobParticipantsPayload);
}

export async function providerGetStandings(groupId: string): Promise<unknown> {
  return withLiveScoreFirst(() => rawGetStandings(groupId), getFotmobStandingsPayload);
}

/** Classement buteurs brut — Live Score ; photos via `getHybridTopScorers`. */
export async function providerGetTopScorers(): Promise<unknown> {
  return withLiveScoreFirst(rawGetTopScorers, async () => {
    const { getFotmobLeaderboards } = await import('./fotmobPlayerEnrichment');
    const { scorers } = await getFotmobLeaderboards(20);
    return {
      data: scorers.map((p) => ({
        player_name: p.name,
        team_name: p.country,
        goals: p.goals,
        player_photo: p.photo,
        player_id: p.fotmobId,
      })),
    };
  });
}

export async function providerGetHead2Head(team1: string, team2: string): Promise<unknown> {
  const { resolveFotmobTeamIdFromRef } = await import('./fotmobTeamRegistry');
  const f1 = resolveFotmobTeamIdFromRef(team1);
  const f2 = resolveFotmobTeamIdFromRef(team2);
  if (f1 && f2) {
    try {
      const payload = await getFotmobHead2HeadPayload(f1, f2);
      const rows = Array.isArray((payload as { data?: unknown[] })?.data)
        ? (payload as { data: unknown[] }).data
        : [];
      if (rows.length > 0) {
        activeSource = 'fotmob';
        return payload;
      }
    } catch {
      /* secours Live Score */
    }
  }
  return withLiveScoreFirst(
    () => rawGetHead2Head(team1, team2),
    () => getFotmobHead2HeadPayload(team1, team2)
  );
}

export async function providerGetMatchHistory(extra: Record<string, string> = {}): Promise<unknown> {
  const team = extra.team?.trim();
  if (team) {
    return withLiveScoreFirst(
      () => rawGetMatchHistory(extra),
      () => getFotmobMatchHistoryPayload(team)
    );
  }
  return withLiveScoreFirst(() => rawGetMatchHistory(extra), getFotmobFixturesPayload);
}

export async function providerFetchMatchEvents(matchId: string) {
  if (isLivescoreConfigured()) {
    try {
      activeSource = 'livescore';
      const payload = await rawGetMatchEvents(matchId);
      const { parseMatchEvents } = await import('./livescoreEventParsers');
      return parseMatchEvents(payload);
    } catch {
      /* vide */
    }
  }
  return [];
}

export async function providerGetMatchEvents(matchId: string): Promise<unknown> {
  if (isLivescoreConfigured()) {
    activeSource = 'livescore';
    return rawGetMatchEvents(matchId);
  }
  return { data: { event: [] } };
}

export async function initFootballDataSources(): Promise<void> {
  const lsOk = isLivescoreConfigured();
  const fotmobOk = await testFotmobFootballConnection();

  if (lsOk) {
    activeSource = 'livescore';
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(
        '[GOALYA Football] Hybride : Live Score (matchs & live) + FotMob (visages & stats joueurs)'
      );
    }
    return;
  }

  if (fotmobOk) {
    activeSource = 'fotmob';
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[GOALYA Football] Live Score non configuré — FotMob seul pour la compétition');
    }
  }
}
