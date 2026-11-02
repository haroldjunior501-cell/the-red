/** Joueur éligible au pairing « duel du jour » Simulator */
export type MatchmakingPlayer = {
  userId: string;
  displayName: string;
  country: string;
  profilePhotoUrl: string | null;
  totalPoints: number;
  rank: number;
  /** Derniers adversaires (ids) — évite les rematches trop fréquents */
  recentOpponentIds?: string[];
  /** Équipe Fantasy complète (11 joueurs) */
  teamComplete?: boolean;
};

export type DailyDuelPair = {
  userAId: string;
  userBId: string;
  /** Score du jour (live) — rempli par le backend pendant les matchs */
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
  /** Raison lisible (debug / UI optionnelle) */
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
  /** Nombre de journées sans revoir le même adversaire si possible */
  recentOpponentWindow?: number;
  /** Distance de rang max pour un duel équitable */
  maxRankDistance?: number;
  /** Taille des poules pour la rotation suisse (grands classements) */
  tierBucketSize?: number;
  /** Libellé affiché (ex. « Journée 12 · CdM 2026 ») */
  matchdayLabel?: string;
  /** Favoriser un adversaire du même pays (30 % de poids) — désactivé par défaut */
  preferSameNation?: boolean;
};
