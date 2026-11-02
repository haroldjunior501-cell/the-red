import { flagEmoji } from './mapHub';

export type SimulationNation = {
  code: string;
  flag: string;
  name: string;
  color: string;
  users: number;
};

export const NATION_DISTRIBUTION: Record<string, number> = {
  FRA: 0.224,
  BRA: 0.196,
  ARG: 0.134,
  ESP: 0.108,
  JPN: 0.086,
  MAR: 0.076,
  ENG: 0.064,
  USA: 0.056,
  MEX: 0.038,
  SEN: 0.018,
};

export const SIMULATION_NATIONS: SimulationNation[] = [
  { code: 'FRA', flag: flagEmoji('FRA'), name: 'France', color: '#002395', users: 112_000 },
  { code: 'BRA', flag: flagEmoji('BRA'), name: 'Brésil', color: '#009C3B', users: 98_000 },
  { code: 'ARG', flag: flagEmoji('ARG'), name: 'Argentine', color: '#74ACDF', users: 67_000 },
  { code: 'ESP', flag: flagEmoji('ESP'), name: 'Espagne', color: '#AA151B', users: 54_000 },
  { code: 'JPN', flag: flagEmoji('JPN'), name: 'Japon', color: '#BC002D', users: 43_000 },
  { code: 'MAR', flag: flagEmoji('MAR'), name: 'Maroc', color: '#C1272D', users: 38_000 },
  { code: 'ENG', flag: flagEmoji('ENG'), name: 'Angleterre', color: '#CF081F', users: 32_000 },
  { code: 'USA', flag: flagEmoji('USA'), name: 'USA', color: '#3C3B6E', users: 28_000 },
  { code: 'MEX', flag: flagEmoji('MEX'), name: 'Mexique', color: '#006847', users: 19_000 },
  { code: 'SEN', flag: flagEmoji('SEN'), name: 'Sénégal', color: '#00853F', users: 9_000 },
];

export type SimGoalKey = 'mbappe' | 'neymar' | 'messi' | 'century';

export type SimGoalEvent = {
  playerName: string;
  playerId: string;
  country: string;
  forHome: boolean;
  isCentury?: boolean;
};

export const SIM_GOAL_EVENTS: Record<SimGoalKey, SimGoalEvent> = {
  mbappe: { playerName: 'Mbappé', playerId: 'mbappe_id', country: 'FRA', forHome: true },
  neymar: { playerName: 'Neymar', playerId: 'neymar_id', country: 'BRA', forHome: false },
  messi: { playerName: 'Messi', playerId: 'messi_id', country: 'ARG', forHome: false },
  century: { playerName: 'Mbappé', playerId: 'mbappe_id', country: 'FRA', forHome: true, isCentury: true },
};

export const SIMULATION_MATCH_ID = 'sim_match';
