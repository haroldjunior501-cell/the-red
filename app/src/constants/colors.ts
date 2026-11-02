/**
 * Palette THE RED officielle - Manchester United Red Devils
 * Rouge principal #DA291C, accents or #FBE122 et blanc #FFFFFF sur fond sombre Old Trafford.
 */
export const UNITED_RED = '#DA291C' as const;
export const UNITED_RED_LIGHT = '#ff4d40' as const;
export const UNITED_RED_DIM = '#991b12' as const;
export const UNITED_RED_RGB = '218, 41, 28' as const;

export const UNITED_GOLD = '#FBE122' as const;
export const UNITED_BLACK = '#060304' as const;
export const UNITED_DARK_RED = '#1a080a' as const;

/**
 * Fond premium - Old Trafford Dark atmosphere.
 */
export const RED_BOTTOM = '#050203' as const;
export const RED_CORE = '#0c0507' as const;
export const RED_MID = '#12080a' as const;
export const RED_TOP = '#1c0a0e' as const;

export const NAVY_BOTTOM = RED_BOTTOM;
export const NAVY_CORE = RED_CORE;
export const NAVY_MID = RED_MID;
export const NAVY_TOP = RED_TOP;
export const NAVY_DEEP = RED_BOTTOM;
export const NAVY_DARK = RED_CORE;
export const NAVY_HIGHLIGHT = RED_TOP;
export const GOALYA_BLUE = UNITED_RED;
export const GOALYA_BLUE_LIGHT = UNITED_RED_LIGHT;
export const GOALYA_BLUE_DIM = UNITED_RED_DIM;

export const BACKGROUND_GRADIENT = [RED_TOP, RED_CORE, RED_BOTTOM] as const;

export const COLORS = {
  bg: RED_CORE,
  bgDeep: RED_BOTTOM,
  bgMid: RED_MID,
  bgHighlight: RED_TOP,
  bgSecondary: RED_BOTTOM,
  card: '#140a0c',
  card2: '#1c0e12',
  card3: '#241217',

  primary: UNITED_RED,
  primaryLight: UNITED_RED_LIGHT,
  primarySoft: '#fca5a5',
  primaryDim: UNITED_RED_DIM,
  primaryGlow: 'rgba(218, 41, 28, 0.20)',
  primaryMuted: 'rgba(218, 41, 28, 0.15)',
  primaryBorder: 'rgba(218, 41, 28, 0.35)',
  primaryFill: 'rgba(218, 41, 28, 0.15)',
  primaryFillSoft: 'rgba(218, 41, 28, 0.08)',

  accent: UNITED_GOLD,
  accentGold: UNITED_GOLD,
  accentRed: UNITED_RED,

  live: '#ff3333',
  halftime: '#eab308',
  finished: '#6b7280',
  extraTime: '#ec4899',
  penalties: '#ef4444',
  hot: '#DA291C',

  text: '#ffffff',
  textSecondary: '#e2e8f0',
  textMuted: '#94a3b8',
  textMuted2: '#64748b',

  border: 'rgba(255, 255, 255, 0.10)',
  borderLight: 'rgba(255, 255, 255, 0.05)',

  gold: UNITED_GOLD,
  goldGlow: 'rgba(251, 225, 34, 0.25)',
  green: '#10b981',
  greenDim: '#064e3b',
  greenDim2: '#022c22',
  greenLight: '#34d399',
  red: UNITED_RED,
  blue: '#3b82f6',

  lightSky: 'rgba(218, 41, 28, 0.12)',
  lightCard: 'rgba(255, 255, 255, 0.06)',

  fra: '#002395',
  bra: '#009C3B',
  arg: '#74ACDF',
};

export const Colors = COLORS;
