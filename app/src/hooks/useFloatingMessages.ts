import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorldChatMessage } from '../services/hubRtdbService';

export type FloatingMsg = {
  id: string;
  flag: string;
  username: string;
  rank: string;
  text: string;
  position: { top: number; left: number };
  countryColor: string;
};

const MAX_VISIBLE = 5;
const SLOT_TOP = [18, 32, 46, 60, 74];
const SLOT_LEFT = [8, 28, 48, 20, 58];

function slotForId(id: string): { top: number; left: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * 17) % 997;
  const top = SLOT_TOP[hash % SLOT_TOP.length];
  const left = SLOT_LEFT[(hash >> 2) % SLOT_LEFT.length];
  return { top, left };
}

export function useFloatingMessages(messages: WorldChatMessage[]) {
  const [floatingMessages, setFloatingMessages] = useState<FloatingMsg[]>([]);
  const seen = useRef<Set<string>>(new Set());

  const addMessage = useCallback((msg: WorldChatMessage) => {
    if (seen.current.has(msg.id)) return;
    seen.current.add(msg.id);
    const bubble: FloatingMsg = {
      id: msg.id,
      flag: msg.flag,
      username: msg.username,
      rank: msg.rank,
      text: msg.message,
      countryColor: msg.countryColor,
      position: slotForId(msg.id),
    };
    setFloatingMessages((prev) => [...prev, bubble].slice(-MAX_VISIBLE));
  }, []);

  const removeMessage = useCallback((id: string) => {
    setFloatingMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    addMessage(last);
  }, [messages, addMessage]);

  return { floatingMessages, activeCount: floatingMessages.length, addMessage, removeMessage };
}
