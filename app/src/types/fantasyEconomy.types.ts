export type FpRewardKey =
  | 'simulator_win'
  | 'simulator_streak_3'
  | 'simulator_top_week'
  | 'fantasy_100pts_day'
  | 'fantasy_200pts_day'
  | 'fantasy_weekly_reward'
  | 'login_daily'
  | 'login_7days_streak'
  | 'invite_friend'
  | 'complete_team'
  | 'captain_goal_daily';

export type FantasyTransactionType = 'purchase' | 'spend' | 'earn';

export type FantasyTransaction = {
  id: string;
  type: FantasyTransactionType;
  amount: number;
  description: string;
  source: string;
  referenceId: string;
  timestamp: number;
};

export type FantasyEconomyState = {
  fantasyPoints: number;
  fantasyBudgetM: number;
  prestigeName: string;
  loginStreak: number;
  lastLoginDate: string | null;
  lastFreeUpgradeDate: string | null;
};

export type UserMissionStats = {
  loggedInToday: boolean;
  loginStreak: number;
  arenaWinsToday: number;
  fantasyPointsToday: number;
  captainGoalsToday: number;
  /** Joueurs titulaires Fantasy (11/11). */
  filledCount: number;
  /** Série de victoires Arena en cours. */
  arenaWinStreak: number;
  /** Référence idempotente si série ≥ 3 victoires. */
  arenaStreakReferenceId: string | null;
  /** #1 du classement Arena sur la semaine en cours. */
  isWeeklyArenaTop1: boolean;
  /** IDs des filleuls déjà enregistrés (récompense par filleul). */
  pendingReferralIds: string[];
};

export type PrestigeLevel = {
  minBudget: number;
  name: string;
  color: string;
};

export type PlayerMarketSnapshot = {
  playerId: string;
  basePrice: number;
  currentPrice: number;
  previousPrice: number;
  purchaseCount: number;
  performanceScore: number;
  priceTrend: 'up' | 'down' | 'stable';
  lastUpdated: number;
};

export type DailyMissionDef = {
  id: string;
  label: string;
  target: number;
  rewardKey: FpRewardKey;
  rewardAmount: number;
};

export type DailyMissionProgress = {
  id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
};
