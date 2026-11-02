import { COLORS } from './colors';

/** Palette hub Tableau / Pronos (maquette bracket). */
export const TABLEAU = {
  bg: COLORS.bgDeep,
  bgCard: COLORS.card,
  bgCard2: COLORS.card2,
  border: 'rgba(255,255,255,0.08)',
  text: '#f0f4ff',
  textMuted: '#6a85a8',
  textSoft: '#99b3cc',
  tabActiveBg: 'rgba(255,255,255,0.08)',
  link: COLORS.primaryLight,
  gold: '#f0b429',
  goldBtn: '#d4a017',
  goldBtnText: '#1a1200',
  connector: 'rgba(255,255,255,0.12)',
  shield: 'rgba(255,255,255,0.06)',
} as const;

/** Bordures groupes (A–L). */
export const GROUP_BORDER_COLORS: Record<string, string> = {
  A: '#00e676',
  B: '#e5382b',
  C: '#f0b429',
  D: '#2979ff',
  E: '#8b5cf6',
  F: '#ff6432',
  G: '#14b8a6',
  H: '#ec4899',
  I: '#84cc16',
  J: '#06b6d4',
  K: '#a855f7',
  L: '#f97316',
};
