import { NATIONAL_KIT_SVGS } from '../generated/nationalKitSvgs';
import { resolveKitStyleKey } from '../constants/nationalKitStyles';

/** Corrige les références `url("#id")` invalides pour react-native-svg. */
export function normalizeKitSvg(svg: string): string {
  return svg
    .replace(/url\(&quot;#([^&]+)&quot;\)/g, 'url(#$1)')
    .replace(/url\("#([^"]+)"\)/g, 'url(#$1)');
}

export function getNationalKitSvg(countryCode: string, isGoalkeeper: boolean): string {
  const key = resolveKitStyleKey(countryCode, isGoalkeeper);
  const raw = NATIONAL_KIT_SVGS[key] ?? NATIONAL_KIT_SVGS.DEFAULT;
  return normalizeKitSvg(raw);
}
