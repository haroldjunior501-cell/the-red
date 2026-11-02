import { useEffect, useState } from 'react';
import {
  buildPresencePayload,
  subscribeActiveSupporters,
  upsertActiveSupporter,
  type ActiveSupporter,
} from '../services/hubRtdbService';

const HEARTBEAT_MS = 60_000;

export function useActiveSupporters(
  user: { userId: string; username: string; rank: string; country: string; flag: string },
  enabled = true
) {
  const [supporters, setSupporters] = useState<ActiveSupporter[]>([]);

  useEffect(() => {
    if (!enabled) {
      setSupporters([]);
      return undefined;
    }
    const unsub = subscribeActiveSupporters(setSupporters);
    return unsub;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !user.userId) return undefined;
    const beat = () => {
      const payload = buildPresencePayload(user.country, user.username, user.rank, user.flag);
      void upsertActiveSupporter(user.userId, payload);
    };
    beat();
    const id = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [enabled, user.country, user.flag, user.rank, user.userId, user.username]);

  return { supporters };
}
