export type SimulatorAccessReason = 'EQUIPE_INCOMPLETE' | 'CUP_NOT_STARTED' | null;

export type SimulatorAccess = {
  locked: boolean;
  reason: SimulatorAccessReason;
  message: string;
  actionLabel: string | null;
};

export type SimulatorLiveEventType =
  | 'goal'
  | 'assist'
  | 'clean_sheet'
  | 'yellow'
  | 'red'
  | 'motm'
  | 'captain_goal';

export type SimulatorLiveEvent = {
  id: string;
  minute: number;
  playerId: string;
  playerName: string;
  photo: string;
  type: SimulatorLiveEventType;
  points: number;
  isCaptain?: boolean;
  isUserTeam?: boolean;
};

export type SimulatorReward = {
  id: string;
  label: string;
  points: number;
  unlocked: boolean;
};

export type SimulatorDuelOutcome = 'win' | 'loss' | 'draw';

/** Une journée de duel Simulator dans l’historique du joueur */
export type SimulatorHistoryEntry = {
  id: string;
  matchdayId: string;
  matchdayLabel: string;
  playedAt: number;
  opponentUserId: string;
  opponentName: string;
  opponentCountry: string;
  userScore: number;
  opponentScore: number;
  outcome: SimulatorDuelOutcome;
  fantasyPointsDelta: number;
  rankAfter: number;
  rankDelta?: RankDelta;
  isLive?: boolean;
};

export type SimulatorSeasonStats = {
  wins: number;
  losses: number;
  draws: number;
  totalDuels: number;
  currentStreakLabel: string | null;
};

export type RankingFilter = 'mondial' | 'nation' | 'friends' | 'week';

export type RankDelta = 'up' | 'down' | 'stable';

export type SimulatorRankingEntry = {
  userId: string;
  displayName: string;
  country: string;
  flag: string;
  profilePhotoUrl: string | null;
  totalPoints: number;
  weeklyPoints: number;
  captainId: string;
  captainFlag: string;
  wins: number;
  rank: number;
  rankDelta?: RankDelta;
};

export type SimulatorCurrentMatch = {
  opponentUserId: string;
  opponentName: string;
  opponentCountry: string;
  opponentProfilePhotoUrl: string | null;
  userScore: number;
  opponentScore: number;
  isLive: boolean;
  matchdayLabel: string;
};

export type SimulatorScoreState = {
  totalPoints: number;
  worldRank: number;
  dayGain: number;
  leaderPoints: number;
  leaderName: string;
  gapToLeader: number;
};

export type SimulatorCaptainState = {
  playerId: string;
  name: string;
  photo: string;
};
