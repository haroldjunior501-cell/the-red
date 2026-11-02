import type { GamesFixture } from './games.types';

export type KnockoutPronoPhaseKey = 'r16' | 'qf' | 'sf' | 'final';

/** `opening` = match d’ouverture ; `day-YYYY-MM-DD` = tous les matchs du jour ; puis KO. */
export type PronoPhaseKey = 'opening' | `day-${string}` | KnockoutPronoPhaseKey;

export type PronoMatch = GamesFixture & {
  kickoff_label: string;
};

export type PopularProno = {
  score: string;
  percentage: number;
};

export type PronoDraft = {
  home: number | null;
  away: number | null;
};

export type ScoreSide = 'home' | 'away';
