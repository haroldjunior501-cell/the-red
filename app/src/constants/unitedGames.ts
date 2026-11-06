import { COLORS, GOALYA_BLUE_RGB } from './colors';
import type { ImageSourcePropType } from 'react-native';

/** Barème officiel THE RED — pronostics match United. */
export const UNITED_PRONO_POINTS = {
  /** Bonne formation (ex. 4-2-3-1). */
  lineupFormation: 10,
  /** Par joueur titularisé correctement. */
  lineupStarterEach: 5,
  firstScorer: 20,
  playerOfTheMatch: 20,
  finalResult: 20,
} as const;

/** Composition verrouillée 90 min avant KO ; le reste au coup d’envoi. */
export const UNITED_LOCK = {
  lineupMinutesBeforeKickoff: 90,
  otherAtKickoff: true,
} as const;

export type UnitedGameModeKey =
  | 'pronos'
  | 'pickxi'
  | 'quiz'
  | 'rating'
  | 'fantasy'
  | 'arena';

export type UnitedGameModeConfig = {
  key: UnitedGameModeKey;
  label: string;
  title: string;
  description: string;
  cta: string;
  accent: string;
  accentSoft: string;
  glow: string;
  image: ImageSourcePropType;
  live?: boolean;
};

export const UNITED_GAME_MODES: readonly UnitedGameModeConfig[] = [
  {
    key: 'pronos',
    label: 'PRONOS',
    title: 'Pronos United',
    description: 'Composition · Buteur · POTM · Score',
    cta: 'Pronostiquer',
    accent: COLORS.primary,
    accentSoft: `rgba(${GOALYA_BLUE_RGB}, 0.4)`,
    glow: COLORS.primary,
    live: true,
    image: require('../../assets/images/games/pronos_bg.jpg'),
  },
  {
    key: 'pickxi',
    label: 'PICK XI',
    title: 'Pick Your XI',
    description: 'Compose ton onze idéal',
    cta: 'Choisir mon XI',
    accent: '#c9a84c',
    accentSoft: 'rgba(201, 168, 76, 0.35)',
    glow: '#c9a84c',
    image: require('../../assets/images/games/pickxi_bg.jpg'),
  },
  {
    key: 'quiz',
    label: 'QUIZ',
    title: 'Quiz & Sondages',
    description: 'Actus, stats & histoire du club',
    cta: 'Jouer',
    accent: '#4d8fff',
    accentSoft: 'rgba(77, 143, 255, 0.38)',
    glow: '#4d8fff',
    image: require('../../assets/images/games/arena_bg.jpg'),
  },
  {
    key: 'rating',
    label: 'NOTES',
    title: 'Note les joueurs',
    description: 'Après-match · classements fans',
    cta: 'Noter',
    accent: '#9b6dff',
    accentSoft: 'rgba(155, 109, 255, 0.4)',
    glow: '#9b6dff',
    image: require('../../assets/images/games/fantasy_bg.jpg'),
  },
] as const;

export const UNITED_FORMATIONS = [
  '4-2-3-1',
  '4-3-3',
  '4-4-2',
  '3-5-2',
  '3-4-3',
  '5-3-2',
  '4-1-4-1',
] as const;

export type UnitedFormation = (typeof UNITED_FORMATIONS)[number];
