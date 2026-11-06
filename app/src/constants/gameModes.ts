import type { ImageSourcePropType } from 'react-native';
import { COLORS, GOALYA_BLUE_RGB } from './colors';

export type GameModeKey = 'pronos' | 'pickxi' | 'quiz' | 'rating';

export type GameModeConfig = {
  key: GameModeKey;
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

export const GAME_CARD_WIDTH = 170;
export const GAME_CARD_HEIGHT = 240;
export const GAME_CARD_GAP = 14;
export const GAME_CARD_RADIUS = 24;
export const GAME_CARD_SNAP = GAME_CARD_WIDTH + GAME_CARD_GAP;

/** Modes de jeu THE RED — United Predictions + engagement fans. */
export const GAME_MODES: readonly GameModeConfig[] = [
  {
    key: 'pronos',
    label: 'PRONOS',
    title: 'Pronos United',
    description: 'XI · Buteur · POTM · Score',
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
    description: 'Compose ton onze United',
    cta: 'Choisir mon XI',
    accent: COLORS.gold,
    accentSoft: 'rgba(251, 225, 34, 0.35)',
    glow: COLORS.gold,
    image: require('../../assets/images/games/pickxi_bg.jpg'),
  },
  {
    key: 'quiz',
    label: 'QUIZ',
    title: 'Quiz & Sondages',
    description: 'Actus, stats & histoire',
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
    description: 'Après-match · classement fans',
    cta: 'Noter',
    accent: '#9b6dff',
    accentSoft: 'rgba(155, 109, 255, 0.4)',
    glow: '#9b6dff',
    image: require('../../assets/images/games/fantasy_bg.jpg'),
  },
] as const;
