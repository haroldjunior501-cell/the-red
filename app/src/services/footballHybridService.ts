/**
 * Système hybride GOALYA — CDM 2026
 *
 * Live Score API : matchs, live, classements, événements, calendrier (source principale)
 * FotMob : visages joueurs, stats avancées, buteurs/passeurs enrichis, pool Fantasy
 */
import { parseTopScorers } from './liveMatchParsers';
import {
  providerGetTopScorers,
  getActiveFootballDataSource,
  isFootballDataConfigured,
} from './footballDataProvider';
import { enrichNamesWithPhotos, getFotmobLeaderboards } from './fotmobPlayerEnrichment';
import type { TopScorerRow } from '../types/live.types';

export type HybridTopScorer = TopScorerRow & {
  photo?: string;
  fotmobId?: number;
  rank?: number;
};

export type HybridTopAssister = {
  name: string;
  team: string;
  assists: number;
  photo?: string;
  fotmobId?: number;
  rank?: number;
};

export type FootballHybridMeta = {
  competitionSource: ReturnType<typeof getActiveFootballDataSource>;
  enrichmentSource: 'fotmob';
};

export function getFootballHybridMeta(): FootballHybridMeta {
  return {
    competitionSource: getActiveFootballDataSource(),
    enrichmentSource: 'fotmob',
  };
}

/** Meilleurs buteurs : classement Live Score + photos / IDs FotMob. */
export async function getHybridTopScorers(limit = 15): Promise<HybridTopScorer[]> {
  let base: TopScorerRow[] = [];

  if (isFootballDataConfigured()) {
    try {
      const payload = await providerGetTopScorers();
      base = parseTopScorers(payload).slice(0, limit);
    } catch {
      base = [];
    }
  }

  if (base.length === 0) {
    const { scorers } = await getFotmobLeaderboards(limit);
    return scorers.map((p, i) => ({
      name: p.name,
      team: p.country ?? '—',
      country_code: '',
      goals: typeof p.goals === 'number' ? p.goals : Number(p.goals) || 0,
      photo: p.photo,
      fotmobId: p.fotmobId,
      rank: i + 1,
    }));
  }

  const enriched = await enrichNamesWithPhotos(
    base.map((r) => ({ name: r.name, team: r.team }))
  );

  return enriched.map((row, i) => ({
    ...base[i],
    photo: row.photo,
    fotmobId: row.fotmobId,
    rank: i + 1,
  }));
}

/** Meilleurs passeurs — FotMob (overview ligue 77), secours vide. */
export async function getHybridTopAssisters(limit = 10): Promise<HybridTopAssister[]> {
  const { assisters } = await getFotmobLeaderboards(limit);
  return assisters.map((p, i) => ({
    name: p.name,
    team: p.country ?? '—',
    assists: typeof p.assists === 'number' ? p.assists : Number(p.assists) || 0,
    photo: p.photo,
    fotmobId: p.fotmobId,
    rank: i + 1,
  }));
}

export type { FotmobPlayerProfile, FotmobPlayerRef } from './fotmobPlayerEnrichment';
export {
  fetchFotmobPlayerProfile,
  resolveFotmobPlayerId,
  resolvePlayerPhoto,
  getFotmobLeaderboards,
} from './fotmobPlayerEnrichment';
