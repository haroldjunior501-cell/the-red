import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { syncClubNewsNotifications } from '../services/clubNewsWatch';

const POLL_MS = 3 * 60 * 1000;

/** Poll les actus Man United et envoie une notif locale pour chaque nouveauté. */
export function useClubNewsWatch(enabled = true) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let alive = true;
    const tick = async (force = false) => {
      if (!alive) return;
      try {
        await syncClubNewsNotifications({ forceFetch: force });
      } catch (e) {
        console.warn('[ClubNewsWatch]', e);
      }
    };

    void tick(true);
    timer.current = setInterval(() => void tick(true), POLL_MS);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void tick(true);
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      alive = false;
      if (timer.current) clearInterval(timer.current);
      sub.remove();
    };
  }, [enabled]);
}
