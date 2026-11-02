export type NationPower = {
  power: number;
  supporterCount: number;
  dailyGain: number;
  weeklyGain: number;
};

export type NationRank = {
  code: string;
  flag: string;
  name: string;
  power: number;
  rank: number;
  dailyGain?: number;
  supporterCount?: number;
};

export type BracketRound = 'groups' | 'r16' | 'quarter' | 'semi' | 'final';

export type BracketPrediction = {
  round: BracketRound;
  matchId: string;
  predictedWinner: string;
  predictedWinnerCode: string;
};

export type TableauDoc = {
  predictions: BracketPrediction[];
  submittedAt: number;
};

export type Prono = {
  matchId: string;
  homeScore: number;
  awayScore: number;
  predictedScorer?: string;
  submittedAt: number;
  country?: string;
  pointsAwarded?: number;
};

export type MatchResult = {
  homeScore: number;
  awayScore: number;
  homeScorer?: string;
};

export type DuelPlayer = {
  userId: string;
  country: string;
  flag: string;
  points: number;
  name: string;
};

export type Duel = {
  id: string;
  player1: DuelPlayer;
  player2: DuelPlayer;
  matchIds: string[];
  status: 'active' | 'finished';
  winnerId?: string;
};

export type FantasyPosition = 'GK' | 'DEF' | 'MID' | 'ATT';

export type FantasyPlayer = {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  jerseyNumber: number;
  position: FantasyPosition;
  price: number;
  goals: number;
  assists: number;
  rating: number;
  fantasyPoints: number;
  totalPoints: number;
  isCaptain?: boolean;
};

export type FantasyTeam = {
  userId: string;
  country: string;
  formation: string;
  players: FantasyPlayer[];
  playerIds: string[];
  totalPoints: number;
  budget: number;
};

export type GamesFixture = {
  id: string;
  homeName: string;
  awayName: string;
  homeCode: string;
  awayCode: string;
  date: string;
  time: string;
  phase: string;
  group: string;
  status: string;
  kickoffMs: number;
};

export type PointsSource =
  | 'prono_exact_score'
  | 'prono_winner'
  | 'prono_scorer'
  | 'prono_goal_diff'
  | 'tableau_group'
  | 'tableau_r16'
  | 'tableau_quarter'
  | 'tableau_semi'
  | 'tableau_final'
  | 'tableau_champion'
  | 'duel_win'
  | 'duel_perfect'
  | 'fantasy_goal'
  | 'fantasy_assist'
  | 'fantasy_clean_sheet'
  | 'fantasy_motm'
  | 'hub_reaction'
  | 'hub_message'
  | 'hub_mission';
