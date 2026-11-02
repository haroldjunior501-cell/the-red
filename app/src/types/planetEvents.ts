export type PlanetEventType =
  | 'GOAL'
  | 'PENALTY'
  | 'PENALTY_MISSED'
  | 'RED_CARD'
  | 'HISTORIC'
  | 'CHAOS'
  | 'CHAIN';

export type WeatherMood = 'normal' | 'tense' | 'electric' | 'dramatic';

export type PlanetEvent = {
  id: string;
  type: PlanetEventType;
  country?: string;
  countryColor?: string;
  playerName?: string;
  playerId?: string;
  goalId?: string;
  minute?: number;
  timestamp: number;
  countries?: string[];
  emoji?: string;
};

export type ParsedApiMatchEvent = {
  id: string;
  type: string;
  teamCode: string;
  playerId?: string;
  playerName?: string;
  minute?: number;
};
