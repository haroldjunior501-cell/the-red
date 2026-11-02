export const FANTASY_LIVE_POINTS = {
  goal: 10,
  assist: 6,
  clean_sheet_gk: 8,
  clean_sheet_def: 4,
  motm: 15,
  yellow_card: -1,
  red_card: -3,
  own_goal: -3,
} as const;

export type FantasyLivePointKey = keyof typeof FANTASY_LIVE_POINTS;
