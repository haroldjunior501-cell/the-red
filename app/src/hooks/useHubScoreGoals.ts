import { useEffect, useRef } from 'react';
import { nationColor } from '../constants/hubGlobe';
import { resolveGlobeCountryKey } from '../data/countryGlobeCoordinates';
import type { ParsedLiveScore } from '../services/livescoreApi';
import { usePlanetEventStore } from '../store/planetEventStore';
import type { HubGoalNotifData } from '../types/hubGoal';

type OnGoal = (payload: HubGoalNotifData) => void;

/**
 * Détecte un changement de score sur le match Hub affiché
 * et déclenche l’effet but (store planète + UI).
 */
export function useHubScoreGoals(
  live: ParsedLiveScore | null,
  enabled: boolean,
  onGoal: OnGoal
) {
  const prev = useRef<{ matchId: string; home: number; away: number } | null>(null);
  const onGoalRef = useRef(onGoal);
  onGoalRef.current = onGoal;

  useEffect(() => {
    if (!enabled || !live?.isLive) {
      prev.current = null;
      return;
    }

    const snap = {
      matchId: live.matchId,
      home: live.home.score,
      away: live.away.score,
    };

    const prior = prev.current;
    prev.current = snap;

    if (!prior || prior.matchId !== snap.matchId) return;

    const enqueue = usePlanetEventStore.getState().enqueueEvent;

    if (snap.home > prior.home) {
      const country = resolveGlobeCountryKey(live.home.code);
      const color = nationColor(country);
      enqueue({
        type: 'GOAL',
        country,
        countryColor: color,
        minute: live.minute,
        playerName: 'BUT',
      });
      onGoalRef.current({
        playerName: 'BUT',
        teamName: live.home.name,
        teamColor: color,
        minute: String(live.minute),
        country,
        homeScore: snap.home,
        awayScore: snap.away,
      });
    }

    if (snap.away > prior.away) {
      const country = resolveGlobeCountryKey(live.away.code);
      const color = nationColor(country);
      enqueue({
        type: 'GOAL',
        country,
        countryColor: color,
        minute: live.minute,
        playerName: 'BUT',
      });
      onGoalRef.current({
        playerName: 'BUT',
        teamName: live.away.name,
        teamColor: color,
        minute: String(live.minute),
        country,
        homeScore: snap.home,
        awayScore: snap.away,
      });
    }
  }, [enabled, live]);
}
