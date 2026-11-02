export type MatchmakingPlayer = {
  userId: string;
  displayName: string;
  country: string;
  profilePhotoUrl: string | null;
  totalPoints: number;
  rank: number;
  recentOpponentIds?: string[];
  teamComplete?: boolean;
};

export type DailyDuelPair = {
  userAId: string;
  userBId: string;
  scoreA: number;
  scoreB: number;
};

export type DailyDuelAssignment = {
  userId: string;
  opponentUserId: string;
  opponentName: string;
  opponentCountry: string;
  opponentProfilePhotoUrl: string | null;
  userDayScore: number;
  opponentDayScore: number;
  matchdayId: string;
  matchdayLabel: string;
  pairingReason: 'chase_above' | 'chase_below' | 'swiss_tier' | 'rematch_fallback' | 'bye_tier';
};

export type MatchdayPairingResult = {
  matchdayId: string;
  matchdayLabel: string;
  assignments: DailyDuelAssignment[];
  byUserId: Map<string, DailyDuelAssignment>;
  pairs: DailyDuelPair[];
  unpairedUserIds: string[];
  stats: {
    eligibleCount: number;
    pairedCount: number;
    averageRankGap: number;
    rematchAvoided: number;
  };
};

export type MatchmakingOptions = {
  recentOpponentWindow?: number;
  maxRankDistance?: number;
  matchdayLabel?: string;
  preferSameNation?: boolean;
};
