import { isCupStarted } from './constants.js';
import type { ParsedApiMatchEvent } from './eventParser.js';
import { buildFantasyIndex } from './fantasyIndex.js';
import {
  fetchLiveMatches,
  fetchMatchEvents,
  fetchTodayFixtures,
  isLivescoreConfigured,
  isRowLive,
  matchIdFromRow,
} from './livescoreClient.js';
import { ensurePlayerIndex, resolveFotmobPlayerId } from './playerResolver.js';
import {
  applyLiveEventToUser,
  buildLiveEvent,
  markEventProcessed,
  refreshGlobalRanks,
} from './rankingStore.js';
import { eventIdForMatch, mapApiEventType, pointsForEvent } from './scoring.js';

export type LivePollResult = {
  ok: boolean;
  matchesScanned: number;
  eventsProcessed: number;
  usersScored: number;
  skippedReason?: string;
};

export async function pollSimulatorLiveScores(): Promise<LivePollResult> {
  if (!isCupStarted()) {
    return { ok: false, matchesScanned: 0, eventsProcessed: 0, usersScored: 0, skippedReason: 'cup_not_started' };
  }
  if (!isLivescoreConfigured()) {
    return { ok: false, matchesScanned: 0, eventsProcessed: 0, usersScored: 0, skippedReason: 'livescore_not_configured' };
  }

  const [liveRows, fixtureRows, fantasyIndex, playerIndex] = await Promise.all([
    fetchLiveMatches(),
    fetchTodayFixtures(),
    buildFantasyIndex(),
    ensurePlayerIndex(),
  ]);

  const matchIds = new Set<string>();
  for (const row of [...liveRows, ...fixtureRows]) {
    if (!isRowLive(row)) continue;
    const id = matchIdFromRow(row);
    if (id) matchIds.add(id);
  }

  let eventsProcessed = 0;
  let usersScored = 0;

  for (const matchId of matchIds) {
    let apiEvents: ParsedApiMatchEvent[];
    try {
      apiEvents = await fetchMatchEvents(matchId);
    } catch {
      continue;
    }

    for (const apiEv of apiEvents) {
      const scorable = mapApiEventType(apiEv.type);
      if (!scorable) continue;

      const eventKey = eventIdForMatch(matchId, apiEv);
      const isNew = await markEventProcessed(eventKey);
      if (!isNew) continue;

      const fotmobId = resolveFotmobPlayerId(playerIndex, {
        playerId: apiEv.playerId,
        playerName: apiEv.playerName,
      });
      if (!fotmobId) continue;

      const owners = fantasyIndex.byPlayerId.get(fotmobId) ?? [];
      if (owners.length === 0) continue;

      for (const roster of owners) {
        if (!roster.startingPlayerIds.has(fotmobId)) continue;

        const isCaptain = roster.captainPlayerId === fotmobId;
        const pts = pointsForEvent(scorable, undefined, isCaptain);
        if (pts === 0) continue;

        const liveEv = buildLiveEvent({
          id: eventKey,
          minute: apiEv.minute ?? 0,
          fotmobId,
          playerName: roster.playerNames.get(fotmobId) ?? apiEv.playerName ?? 'Joueur',
          type: scorable === 'goal' && isCaptain ? 'captain_goal' : scorable,
          points: pts,
          isCaptain,
        });

        await applyLiveEventToUser(roster.userId, liveEv, pts);
        usersScored += 1;
      }
      eventsProcessed += 1;
    }
  }

  if (usersScored > 0) {
    await refreshGlobalRanks();
  }

  return {
    ok: true,
    matchesScanned: matchIds.size,
    eventsProcessed,
    usersScored,
  };
}
