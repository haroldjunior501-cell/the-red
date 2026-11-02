import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { setVideoLike, subscribeVideoLikes } from '../services/contentService';
import { useUserStore } from '../store/useUserStore';
import { perUserStorageKey } from '../utils/perUserStorageKey';
import { useFirebaseAuthUid } from './useFirebaseAuthUid';

async function readLocalLiked(storageKey: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

async function writeLocalLiked(storageKey: string, ids: Set<string>): Promise<void> {
  await AsyncStorage.setItem(storageKey, JSON.stringify([...ids]));
}

/**
 * Likes Immanquable : Firestore (`content_videos/{id}/likes/{uid}`) si connecté,
 * sinon repli AsyncStorage sur le téléphone (par compte).
 */
export function useVideoLikes(videoId: string, baseLikes = 0) {
  const authUid = useFirebaseAuthUid();
  const storeUserId = useUserStore((s) => s.userId)?.trim() || '';
  const accountId = authUid ?? storeUserId;
  const storageKey = perUserStorageKey('liked_videos', accountId);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(baseLikes);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLikeCount(baseLikes);
  }, [baseLikes, videoId]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    const finishReady = () => {
      if (!cancelled) setReady(true);
    };

    const timeout = setTimeout(finishReady, 400);

    void readLocalLiked(storageKey).then((local) => {
      if (!cancelled && local.has(videoId)) setLiked(true);
    });

    if (!accountId) {
      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }

    let unsubFirestore: (() => void) | undefined;
    try {
      unsubFirestore = subscribeVideoLikes(videoId, authUid, {
        onCount: (count) => {
          if (!cancelled) setLikeCount(Math.max(baseLikes, count));
        },
        onUserLiked: (cloudLiked) => {
          if (!cancelled && authUid) setLiked(cloudLiked);
        },
      });
    } catch {
      /* Firebase indisponible → local uniquement */
    }

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      unsubFirestore?.();
    };
  }, [accountId, authUid, baseLikes, storageKey, videoId]);

  const toggleLike = useCallback(async () => {
    if (!ready || !accountId) return;

    const next = !liked;
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));

    const local = await readLocalLiked(storageKey);
    if (next) local.add(videoId);
    else local.delete(videoId);
    await writeLocalLiked(storageKey, local);

    if (!authUid) return;

    try {
      await setVideoLike(videoId, authUid, next);
    } catch {
      /* Garde l’état local ; déploie firestore.rules si permission refusée */
    }
  }, [accountId, authUid, liked, ready, storageKey, videoId]);

  return { liked, likeCount, toggleLike, ready: ready && Boolean(accountId) };
}
