export type LiveMatchStatus = 'live' | 'halftime' | 'finished' | 'extra_time' | 'penalties' | 'upcoming';

export type LiveFilterKey = 'all' | 'groupes' | '1/8' | '1/4' | 'demi' | 'finale';

export type MatchEventType = 'goal' | 'yellowcard' | 'redcard' | 'substitution' | 'penalty';

export interface MatchEvent {
  id: string;
  type: MatchEventType;
  minute: string;
  player_name: string;
  team: 'home' | 'away';
}

export interface LiveMatch {
  id: string;
  home_name: string;
  away_name: string;
  home_score: number;
  away_score: number;
  minute: string;
  status: LiveMatchStatus;
  round: string;
  group: string;
  home_country_code: string;
  away_country_code: string;
  home_team_id: string;
  away_team_id: string;
  /** Logo FotMob (CDN). */
  home_logo_url?: string;
  away_logo_url?: string;
  events: MatchEvent[];
  /** Match programmé (fixtures) */
  kickoff_at?: number;
  kickoff_label?: string;
}

export type LiveGroupStandings = {
  name: string;
  id: string;
  letter: string;
  teams: Standing[];
};

export interface Standing {
  position: number;
  team_name: string;
  country_code: string;
  points: number;
  goal_difference: number;
  played: number;
  wins: number;
  goals_for?: number;
  goals_against?: number;
  draws?: number;
  losses?: number;
}

export interface TopScorerRow {
  name: string;
  team: string;
  country_code: string;
  goals: number;
  photo?: string;
  fotmobId?: number;
}

export interface LiveMoment {
  id: string;
  type: MatchEventType | 'hot';
  label: string;
  matchLabel: string;
  minute: string;
  timestamp: number;
  isNew: boolean;
}

export interface MatchEngagement {
  viewerCount: number;
  messageCount: number;
  chaosLevel: number;
}

export interface MatchDetailBundle {
  stats: Record<string, unknown> | null;
  events: MatchEvent[];
  lineups: Record<string, unknown> | null;
  commentary: string[];
  h2h: Record<string, unknown> | null;
}
