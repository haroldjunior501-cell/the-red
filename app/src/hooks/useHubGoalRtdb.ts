import { useEffect, useRef } from 'react';
import { limitToLast, off, onChildAdded, orderByChild, query, ref } from 'firebase/database';
import { nationColor } from '../constants/hubGlobe';
import { resolveGlobeCountryKey } from '../data/countryGlobeCoordinates';
import { getFirebaseRtdb } from '../services/firebase';
import { usePlanetEventStore } from '../store/planetEventStore';
import type { HubGoalNotifData } from '../types/hubGoal';

export type HubRtdbGoalRow = {
  matchId: string;
  scoringCountry: string;
  scorerName?: string;
  minute?: number;
  timestamp: number;
};

type OnGoal = (payload: HubGoalNotifData) => void;

/**
 * Écoute les buts poussés par le serveur GOALYA (`liveEvents/goals`).
 */
export function useHubGoalRtdb(enabled: boolean, onGoal: OnGoal) {
  const seen = useRef<Set<string>>(new Set());
  const onGoalRef = useRef(onGoal);
  onGoalRef.current = onGoal;

  useEffect(() => {
    if (!enabled) return undefined;
    let db: ReturnType<typeof getFirebaseRtdb>;
    try {
      db = getFirebaseRtdb();
    } catch {
      return undefined;
    }

    const qy = query(ref(db, 'liveEvents/goals'), orderByChild('timestamp'), limitToLast(30));
    const handler = onChildAdded(qy, (snap) => {
      const key = snap.key ?? '';
      if (!key || seen.current.has(key)) return;
      seen.current.add(key);
      if (seen.current.size > 80) {
        const arr = [...seen.current];
        seen.current = new Set(arr.slice(-40));
      }

      const row = snap.val() as HubRtdbGoalRow | null;
      if (!row?.scoringCountry) return;

      const country = resolveGlobeCountryKey(row.scoringCountry);
      const color = nationColor(country);
      usePlanetEventStore.getState().enqueueEvent({
        type: 'GOAL',
        country,
        countryColor: color,
        minute: row.minute,
        playerName: row.scorerName ?? 'BUT',
      });

      onGoalRef.current({
        playerName: row.scorerName ?? 'BUT',
        teamName: country,
        teamColor: color,
        minute: String(row.minute ?? ''),
        country,
        homeScore: 0,
        awayScore: 0,
      });
    });

    return () => off(qy, 'child_added', handler);
  }, [enabled]);
}
