import { useCallback, useEffect, useState } from 'react';
import { centroidForCountry, nationColor } from '../constants/hubGlobe';
import { flagEmoji } from '../constants/mapHub';
import {
  sendMatchChatMessage,
  subscribeMatchChat,
  type WorldChatMessage,
} from '../services/hubRtdbService';

export function useWorldChat(
  matchId: string | null,
  user: { userId: string; username: string; rank: string; country: string },
  enabled = true
) {
  const [messages, setMessages] = useState<WorldChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !matchId?.trim()) {
      setMessages([]);
      setIsConnected(false);
      return undefined;
    }
    const unsub = subscribeMatchChat(matchId, (rows) => {
      setMessages(rows);
      setIsConnected(true);
    });
    return unsub;
  }, [enabled, matchId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!enabled || !matchId || text.trim() === '') return;
      const country = user.country.toUpperCase();
      const [lng, lat] = centroidForCountry(country);
      const authorId = user.userId || `guest-${country}`;
      await sendMatchChatMessage(matchId, {
        userId: authorId,
        username: user.username || 'Supporter',
        flag: flagEmoji(country),
        country,
        countryColor: nationColor(country),
        rank: user.rank,
        message: text.trim(),
        lat,
        lng,
      });
    },
    [enabled, matchId, user.country, user.rank, user.userId, user.username]
  );

  return { messages, sendMessage, isConnected };
}
