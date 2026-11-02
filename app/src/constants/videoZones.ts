import type { VideoType } from '../types/content';

/** Types Firestore pour la section Moments Forts (cartes larges, lecteur cinéma). */
export const MOMENTS_FORTS_TYPES: readonly VideoType[] = [
  'highlight',
  'summary',
  'documentary',
  'goalya_tv',
  'match_complet',
] as const;

/** Type dédié au feed vertical Immanquable (style TikTok / LDC). */
export const IMMANQUABLE_TYPE = 'immanquable' as const satisfies VideoType;

/** Nombre max de vidéos Immanquable chargées (accueil, catalogue, feed). */
export const IMMANQUABLE_FETCH_LIMIT = 60;

/** Nombre max de vidéos Moments Forts chargées (accueil, catalogue, feed). */
export const MOMENTS_FORTS_FETCH_LIMIT = 60;

export function isMomentsFortsType(type: VideoType): boolean {
  return (MOMENTS_FORTS_TYPES as readonly string[]).includes(type);
}

export function isImmanquableType(type: VideoType): boolean {
  return type === IMMANQUABLE_TYPE;
}
