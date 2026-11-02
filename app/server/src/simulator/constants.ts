/** Coup d'envoi CdM 2026 — aligné sur l'app */
export const WC_2026_KICKOFF_MS = new Date('2026-06-11T19:00:00Z').getTime();

export const SIMULATOR_SEASON_ID = 'season_2026';
export const SIMULATOR_MATCHDAY_ID = 'md_current';

export const MATCHMAKING_RECENT_OPPONENTS = 5;
export const MATCHMAKING_MAX_RANK_DISTANCE = 30;

export const WC_COMPETITION_ID = '362';
export const WC_SEASON = '2026';

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

export const STARTING_SLOT_KEYS = [
  'ATT_0',
  'ATT_1',
  'ATT_2',
  'MID_0',
  'MID_1',
  'MID_2',
  'DEF_0',
  'DEF_1',
  'DEF_2',
  'DEF_3',
  'GK_0',
] as const;

export function isCupStarted(): boolean {
  if (process.env.SIMULATOR_FORCE_LIVE === 'true') return true;
  return Date.now() >= WC_2026_KICKOFF_MS;
}

export function fotmobPlayerImageUrl(fotmobId: number | string): string {
  return `https://images.fotmob.com/image_resources/playerimages/${fotmobId}.png`;
}

export function utcDayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
