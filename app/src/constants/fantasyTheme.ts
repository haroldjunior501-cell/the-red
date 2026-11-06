import {
  COLORS,
  UNITED_GOLD,
  UNITED_RED,
  UNITED_RED_LIGHT,
  UNITED_RED_RGB,
} from './colors';

/** Palette Fantasy / Pick Your XI — identité THE RED. */
export const FANTASY_THEME = {
  bg: COLORS.bgDeep,
  bgDeep: COLORS.bgDeep,
  headerTop: COLORS.bgHighlight,
  card: 'rgba(20, 10, 12, 0.94)',
  card2: 'rgba(28, 14, 18, 0.96)',
  glass: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255,255,255,0.08)',
  borderRed: `rgba(${UNITED_RED_RGB}, 0.35)`,
  /** Alias historique → rouge United */
  blue: UNITED_RED,
  blue2: UNITED_RED_LIGHT,
  glowBlue: UNITED_RED,
  glowRed: UNITED_RED,
  text: '#ffffff',
  text2: '#f0d4d4',
  muted: '#8a6565',
  muted2: '#b08a8a',
  gold: UNITED_GOLD,
  green: '#10b981',
  pitchLight: '#1a4a28',
  pitchDark: '#12351c',
  pitchLine: 'rgba(255,255,255,0.22)',
  stadiumGlow: `rgba(${UNITED_RED_RGB}, 0.28)`,
  attBadge: UNITED_RED_LIGHT,
  midBadge: UNITED_GOLD,
  defBadge: '#34d399',
  gkBadge: '#f8fafc',
} as const;

export const FANTASY_BUDGET_M = 100;
