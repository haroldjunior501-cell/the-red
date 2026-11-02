import { useEffect, useMemo, useState } from 'react';
import { limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { isImmanquableType, isMomentsFortsType } from '../constants/videoZones';
import { mapVideoDoc, videosCollection } from '../services/contentService';
import type { ContentVideo } from '../types/content';

export type VideoZone = 'moments_forts' | 'immanquable';

function filterByZone(videos: ContentVideo[], zone?: VideoZone): ContentVideo[] {
  if (zone === 'immanquable') return videos.filter((v) => isImmanquableType(v.type));
  if (zone === 'moments_forts') return videos.filter((v) => isMomentsFortsType(v.type));
  return videos;
}

export function useVideos(max = 20, zone?: VideoZone) {
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const q = query(
        videosCollection(),
        where('isActive', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(max)
      );

      const unsub = onSnapshot(
        q,
        (snap) => {
          setVideos(snap.docs.map((d) => mapVideoDoc(d.id, d.data())));
          setLoading(false);
          setError(null);
        },
        (err) => {
          setVideos([]);
          setLoading(false);
          setError(err.message);
        }
      );

      return () => unsub();
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : 'Vidéos indisponibles');
      return undefined;
    }
  }, [max]);

  const filtered = useMemo(() => filterByZone(videos, zone), [videos, zone]);

  return { videos: filtered, allVideos: videos, loading, error };
}
