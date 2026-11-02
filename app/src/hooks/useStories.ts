import { useEffect, useState } from 'react';
import { limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { mapStoryDoc, storiesCollection } from '../services/contentService';
import type { ContentStory } from '../types/content';

export function useStories(max = 20) {
  const [stories, setStories] = useState<ContentStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const q = query(
        storiesCollection(),
        where('isActive', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(max)
      );

      const unsub = onSnapshot(
        q,
        (snap) => {
          setStories(snap.docs.map((d) => mapStoryDoc(d.id, d.data())));
          setLoading(false);
          setError(null);
        },
        (err) => {
          setStories([]);
          setLoading(false);
          setError(err.message);
        }
      );

      return () => unsub();
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : 'Stories indisponibles');
      return undefined;
    }
  }, [max]);

  return { stories, loading, error };
}
