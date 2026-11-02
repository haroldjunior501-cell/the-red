import { useEffect, useRef } from 'react';
import { nationColor } from '../constants/hubGlobe';
import type { WorldChatMessage } from '../services/hubRtdbService';
import { usePlanetEventStore } from '../store/planetEventStore';

const EMOJI_RE = /(\p{Extended_Pictographic})/u;

function leadingEmoji(text: string): string | null {
  const match = text.match(EMOJI_RE);
  return match?.[1] ?? null;
}

export function useReactionChain(messages: WorldChatMessage[], enabled: boolean) {
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || messages.length < 3) return;
    const last = messages[messages.length - 1];
    const key = `chain-${last.id}`;
    if (seen.current.has(key)) return;

    const now = Date.now();
    const recent = messages.filter((m) => now - m.timestamp < 5000);
    const emoji = leadingEmoji(last.message);
    if (!emoji) return;

    const sameEmoji = recent.filter((m) => leadingEmoji(m.message) === emoji);
    const countries = [...new Set(sameEmoji.map((m) => m.country.toUpperCase()))];
    if (countries.length < 3) return;

    seen.current.add(key);
    usePlanetEventStore.getState().enqueueEvent({
      type: 'CHAIN',
      emoji,
      countries,
      countryColor: nationColor(countries[0]),
    });
  }, [enabled, messages]);
}
