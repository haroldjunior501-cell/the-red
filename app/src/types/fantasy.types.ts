export type FantasyListPosition = 'ATT' | 'MID' | 'DEF' | 'GK';

export type FantasySlotKey =
  | 'ATT_0'
  | 'ATT_1'
  | 'ATT_2'
  | 'MID_0'
  | 'MID_1'
  | 'MID_2'
  | 'DEF_0'
  | 'DEF_1'
  | 'DEF_2'
  | 'DEF_3'
  | 'GK_0';

export type FantasyBenchSlotKey =
  | 'BENCH_0'
  | 'BENCH_1'
  | 'BENCH_2'
  | 'BENCH_3'
  | 'BENCH_4'
  | 'BENCH_5'
  | 'BENCH_6'
  | 'BENCH_7'
  | 'BENCH_8'
  | 'BENCH_9'
  | 'BENCH_10'
  | 'BENCH_11';

export type FantasyBenchState = Record<FantasyBenchSlotKey, FantasyPitchPlayer | null>;

export type FantasyPitchPlayer = {
  id: string;
  fotmobId?: number;
  name: string;
  shortName: string;
  photo: string;
  country: string;
  countryCode: string;
  club?: string;
  number: number;
  price: number;
  pts: number;
  goals: number;
  rating: number;
  position: FantasyListPosition;
  /** Prix marché dynamique (si différent du prix de base) */
  marketPrice?: number;
  previousMarketPrice?: number;
  priceTrend?: 'up' | 'down' | 'stable';
};

export type FantasySlotsState = Record<FantasySlotKey, FantasyPitchPlayer | null>;

export type FantasyTeamDoc = {
  formation: string;
  slots: FantasySlotsState;
  bench?: FantasyBenchState;
  captainSlot: FantasySlotKey | null;
  totalPoints: number;
  budget: number;
  spent: number;
  updatedAt?: number;
};
