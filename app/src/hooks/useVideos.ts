import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchManUtdVideos,
  isMatchSummaryTitle,
  toContentVideo,
} from '../services/manUtdYoutube';
import type { ContentVideo } from '../types/content';

export type VideoZone = 'moments_forts' | 'immanquable';

function isAcademy(title: string): boolean {
  return /\bu1[89]\b|\bu21\b|academy|youth/i.test(title);
}

/**
 * Moments forts = résumés des matchs 1ère équipe déjà joués.
 * Immanquable = contenus @manutd à ne pas manquer (Inside, training, exclus…).
 * Auto-refresh pour publier chaque nouvelle vidéo.
 */
export function useVideos(max = 20, zone?: VideoZone) {
  const query = useQuery({
    queryKey: ['thered', 'youtube', 'home-zones', 'plq5-v1'] as const,
    queryFn: () => fetchManUtdVideos(true),
    staleTime: 45_000,
    refetchInterval: 90_000,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });

  const videos = useMemo(() => {
    const bundle = query.data;
    if (!bundle) return [] as ContentVideo[];

    if (zone === 'moments_forts') {
      const fromApi = bundle.matchSummaries ?? [];
      const fromChannel = bundle.items.filter(
        (v) => isMatchSummaryTitle(v.title) && !isAcademy(v.title)
      );
      const seen = new Set<string>();
      const merged: typeof fromApi = [];
      for (const v of [...fromApi, ...fromChannel]) {
        if (seen.has(v.id) || isAcademy(v.title)) continue;
        seen.add(v.id);
        merged.push(v);
      }
      return merged
        .map((v) => {
          const comp =
            /champions league|ucl/i.test(v.title)
              ? 'UEFA Champions League'
              : /premier league|epl/i.test(v.title)
                ? 'Premier League'
                : /europa|uel/i.test(v.title)
                  ? 'UEFA Europa League'
                  : /fa cup/i.test(v.title)
                    ? 'FA Cup'
                    : /carabao|efl|league cup/i.test(v.title)
                      ? 'Carabao Cup'
                      : 'Résumé de match';
          return toContentVideo(v, 'highlight', comp);
        })
        .slice(0, max);
    }

    if (zone === 'immanquable') {
      const summaryIds = new Set((bundle.matchSummaries ?? []).map((v) => v.id));
      const pool = [
        ...(bundle.sections.inside ?? []),
        ...(bundle.sections.training ?? []),
        ...(bundle.sections.press ?? []),
        ...(bundle.sections.academy ?? []),
        ...(bundle.sections.latest ?? []),
        ...bundle.items,
      ];

      const seen = new Set<string>();
      const unique: typeof pool = [];
      for (const v of pool) {
        if (seen.has(v.id)) continue;
        // Garder un feed riche : on n’exclut que les résumés déjà dans Moments forts
        if (summaryIds.has(v.id)) continue;
        seen.add(v.id);
        unique.push(v);
      }

      return unique
        .map((v) => {
          const chapter =
            v.category === 'inside'
              ? 'Inside Carrington'
              : v.category === 'training'
                ? 'Entraînement'
                : v.category === 'press'
                  ? 'Conférence'
                  : v.category === 'academy'
                    ? 'Académie'
                    : isMatchSummaryTitle(v.title)
                      ? 'Résumé'
                      : 'THE RED';
          return toContentVideo(v, 'immanquable', chapter);
        })
        .slice(0, max);
    }

    return bundle.items
      .map((v) =>
        toContentVideo(
          v,
          isMatchSummaryTitle(v.title) ? 'highlight' : 'immanquable',
          'Manchester United'
        )
      )
      .slice(0, max);
  }, [max, query.data, zone]);

  return {
    videos,
    allVideos: videos,
    loading: query.isPending || (query.isFetching && !query.data),
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
