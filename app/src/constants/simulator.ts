export { WC_2026_KICKOFF_MS } from './cupDates';



export const SIMULATOR_SEASON_ID = 'season_2026';



export const RANKING_PAGE_SIZE = 20;

export const RANKING_PREVIEW_SIZE = 6;

export const SIMULATOR_MATCHDAY_ID = 'md_current';



/** Duel du jour : éviter le même adversaire sur N journées */

export const MATCHMAKING_RECENT_OPPONENTS = 5;

/** Distance de rang max pour un duel équitable */

export const MATCHMAKING_MAX_RANK_DISTANCE = 30;



export { isArenaUnlocked, isCupStarted, isCupStartedForSimulator, isLaunchModeEnabled } from './launch';



export const SIMULATOR_POINTS = {

  goal: 10,

  assist: 6,

  clean_sheet_gk: 8,

  clean_sheet_def: 4,

  motm: 15,

  yellow_card: -1,

  red_card: -3,

  own_goal: -3,

} as const;

