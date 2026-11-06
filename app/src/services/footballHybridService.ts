/**
 * THE RED — Premier League / Manchester United
 * Buteurs & passeurs : overview FotMob ligue 47.
 */
import {
  getActiveFootballDataSource,
} from './footballDataProvider';
import { getPremierLeagueTopAssisters, getPremierLeagueTopScorers } from './fotmobClubApi';
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

/** Meilleurs buteurs Premier League (FotMob). */
export async function getHybridTopScorers(limit = 15): Promise<HybridTopScorer[]> {
  const rows = await getPremierLeagueTopScorers(limit);
  return rows.map((p, i) => ({
    name: p.name,
    team: p.team,
    country_code: '',
    goals: p.goals,
    photo: p.photo,
    fotmobId: p.fotmobId,
    rank: i + 1,
  }));
}

/** Meilleurs passeurs Premier League (FotMob). */
export async function getHybridTopAssisters(limit = 10): Promise<HybridTopAssister[]> {
  const rows = await getPremierLeagueTopAssisters(limit);
  return rows.map((p, i) => ({
    name: p.name,
    team: p.team,
    assists: p.assists,
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
