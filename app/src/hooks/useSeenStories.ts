import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { perUserStorageKey } from '../utils/perUserStorageKey';

async function readSeenSet(storageKey: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

async function writeSeenSet(storageKey: string, ids: Set<string>): Promise<void> {
  await AsyncStorage.setItem(storageKey, JSON.stringify([...ids]));
}

export function useSeenStories() {
  const userId = useUserStore((s) => s.userId);
  const storageKey = perUserStorageKey('seen_stories', userId);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void readSeenSet(storageKey).then((set) => {
      if (!cancelled) {
        setSeenIds(set);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const isSeen = useCallback((id: string) => seenIds.has(id), [seenIds]);

  const markSeen = useCallback(
    async (id: string) => {
      setSeenIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        void writeSeenSet(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  return { isSeen, markSeen, ready };
}
