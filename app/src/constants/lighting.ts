import { StyleSheet, type ViewStyle } from 'react-native';
import { BACKGROUND_GRADIENT, COLORS, NAVY_BOTTOM } from './colors';

/** Tokens lumière ambiante — lueur très douce sur midnight blue #050816. */
export const LIGHT = {
  /** Halo haut — léger reflet #0A0E21 */
  skyTop: 'rgba(10, 14, 33, 0.38)',
  skyMid: 'rgba(5, 8, 22, 0.14)',
  cardHighlight: 'rgba(255, 255, 255, 0.06)',
  cardEdge: 'rgba(120, 140, 180, 0.08)',
  glowSoft: 'rgba(10, 14, 33, 0.20)',
  glowCenter: 'rgba(5, 8, 22, 0.10)',
  vignetteBottom: 'rgba(1, 2, 8, 0.62)',
  heroCrossfade: NAVY_BOTTOM,
  videoLiftTop: 'rgba(180, 195, 220, 0.08)',
  videoTintBottom: 'rgba(1, 2, 8, 0.52)',
  videoStorySheen: 'rgba(220, 228, 245, 0.08)',
  videoStoryVignette: 'rgba(1, 2, 8, 0.32)',
} as const;

export const AMBIENT_GRADIENT_TOP = [LIGHT.skyTop, LIGHT.skyMid, 'transparent'] as const;
export const AMBIENT_GRADIENT_BOTTOM = ['transparent', LIGHT.vignetteBottom] as const;

export const cardGlow = {
  shadowColor: '#6a7a9a',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.10,
  shadowRadius: 16,
  elevation: 3,
} as const;

export function litCardStyle(extra?: ViewStyle): ViewStyle {
  return {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopColor: LIGHT.cardHighlight,
    ...cardGlow,
    ...extra,
  };
}

export const ambienceStyles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
});

export { BACKGROUND_GRADIENT };
