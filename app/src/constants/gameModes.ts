import type { ImageSourcePropType } from 'react-native';
import { COLORS, GOALYA_BLUE_RGB } from './colors';

export type GameModeKey = 'tableau' | 'pronos' | 'arena' | 'fantasy';

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

export const GAME_MODES: readonly GameModeConfig[] = [
  {
    key: 'tableau',
    label: 'TABLEAU',
    title: 'Tableau',
    description: 'Pronostique le vainqueur',
    cta: 'Jouer au Tableau',
    accent: '#c9a84c',
    accentSoft: 'rgba(201, 168, 76, 0.35)',
    glow: '#c9a84c',
    image: require('../../assets/images/games/tableau_bg.jpg'),
  },
  {
    key: 'pronos',
    label: 'PRONOS',
    title: 'Pronos',
    description: 'Devine les scores',
    cta: 'Jouer aux Pronos',
    accent: COLORS.primary,
    accentSoft: `rgba(${GOALYA_BLUE_RGB}, 0.4)`,
    glow: COLORS.primary,
    live: true,
    image: require('../../assets/images/games/pronos_bg.jpg'),
  },
  {
    key: 'arena',
    label: 'ARENA',
    title: 'Simulator',
    description: 'Fantasy World Cup · Classement mondial',
    cta: 'Entrer au Simulator',
    accent: '#4d8fff',
    accentSoft: 'rgba(77, 143, 255, 0.38)',
    glow: '#4d8fff',
    image: require('../../assets/images/games/arena_bg.jpg'),
  },
  {
    key: 'fantasy',
    label: 'FANTASY',
    title: 'Fantasy',
    description: 'Crée ton équipe de rêve CdM',
    cta: 'Jouer au Fantasy',
    accent: '#9b6dff',
    accentSoft: 'rgba(155, 109, 255, 0.4)',
    glow: '#9b6dff',
    image: require('../../assets/images/games/fantasy_bg.jpg'),
  },
] as const;
