import type { UnitedFormation } from '../constants/unitedGames';

export type UnitedTeamSegment = 'men' | 'women';

export type UnitedMatchPrediction = {
  matchId: string;
  /** Hommes / femmes — points combinés au classement. */
  segment: UnitedTeamSegment;
  /** Score final prédit. */
  homeScore: number | null;
  awayScore: number | null;
  /** Premier buteur (player id FotMob). */
  firstScorerId: string | null;
  firstScorerName?: string | null;
  /** Homme du match. */
  potmId: string | null;
  potmName?: string | null;
  /** Formation (4-2-3-1…). */
  formation: UnitedFormation | null;
  /** 11 titularisés (ids). */
  starters: string[];
  submittedAt: number;
  lineupLockedAt?: number;
  marketsLockedAt?: number;
  pointsAwarded?: number;
  pointsBreakdown?: Partial<{
    formation: number;
    starters: number;
    firstScorer: number;
    potm: number;
    result: number;
  }>;
};

export type UnitedPickXiDoc = {
  matchId: string;
  segment: UnitedTeamSegment;
  formation: UnitedFormation;
  starters: string[];
  submittedAt: number;
  pointsAwarded?: number;
};

export type UnitedPlayerRating = {
  matchId: string;
  playerId: string;
  playerName: string;
  rating: number; // 1–10
  submittedAt: number;
};

export type UnitedQuizVote = {
  pollId: string;
  optionId: string;
  submittedAt: number;
  pointsAwarded?: number;
};

export type UnitedFanStanding = {
  userId: string;
  displayName: string;
  monthlyPoints: number;
  seasonPoints: number;
  menPoints: number;
  womenPoints: number;
  updatedAt: number;
};

export type UnitedMatchOutcome = {
  matchId: string;
  homeScore: number;
  awayScore: number;
  firstScorerId?: string | null;
  potmId?: string | null;
  formation?: string | null;
  starterIds?: string[];
  finished: boolean;
};
