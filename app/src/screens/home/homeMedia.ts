import type { AVPlaybackSource } from 'expo-av';

/**
 * Vidéos hero Accueil — alternance hero_1 / hero_2 uniquement.
 * La splash (`splash_bg.mp4`) est dans `splashMedia.ts`, pas ici.
 */
export const HERO_VIDEOS: readonly AVPlaybackSource[] = [
  require('../../../assets/videos/hero_1.mp4'),
  require('../../../assets/videos/hero_2.mov'),
] as const;

/** Stories & vidéos feed : Firebase (`content_stories`, `content_videos`). */

export const HERO_FINISH_DEBOUNCE_MS = 800;
