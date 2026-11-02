import { COLORS } from './colors';
import {
  COUNTRY_GLOBE_VIEW,
  globeViewForCountry,
  resolveGlobeCountryKey,
} from '../data/countryGlobeCoordinates';

function buildCentroids(): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {};
  for (const [code, view] of Object.entries(COUNTRY_GLOBE_VIEW)) {
    out[code] = [view.lng, view.lat];
  }
  const aliasPairs: [string, string][] = [
    ['FRA', 'FR'],
    ['BRA', 'BR'],
    ['ARG', 'AR'],
    ['ESP', 'ES'],
    ['GER', 'DE'],
    ['ENG', 'GB-ENG'],
    ['GB', 'GB-ENG'],
    ['USA', 'US'],
    ['MEX', 'MX'],
    ['CAN', 'CA'],
    ['JPN', 'JP'],
    ['KOR', 'KR'],
    ['SEN', 'SN'],
    ['MAR', 'MA'],
    ['POR', 'PT'],
    ['NED', 'NL'],
    ['BEL', 'BE'],
    ['URU', 'UY'],
    ['SUI', 'CH'],
    ['CHE', 'CH'],
    ['AUS', 'AU'],
    ['SCO', 'GB-SCT'],
  ];
  for (const [from, to] of aliasPairs) {
    const c = out[to];
    if (c) out[from] = c;
  }
  return out;
}

function buildZoomLevels(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [code, view] of Object.entries(COUNTRY_GLOBE_VIEW)) {
    out[code] = view.zoom;
  }
  const aliasPairs: [string, string][] = [
    ['FRA', 'FR'],
    ['BRA', 'BR'],
    ['ARG', 'AR'],
    ['ESP', 'ES'],
    ['GER', 'DE'],
    ['USA', 'US'],
    ['MEX', 'MX'],
    ['CAN', 'CA'],
    ['JPN', 'JP'],
    ['KOR', 'KR'],
    ['SEN', 'SN'],
    ['MAR', 'MA'],
    ['POR', 'PT'],
    ['NED', 'NL'],
    ['BEL', 'BE'],
    ['URU', 'UY'],
    ['SUI', 'CH'],
    ['CHE', 'CH'],
  ];
  for (const [from, to] of aliasPairs) {
    if (out[to] != null) out[from] = out[to];
  }
  return out;
}

/** [lng, lat] pour Mapbox flyTo / marqueurs. */
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = buildCentroids();

/** Zoom cible par pays en mode MA NATION. */
export const COUNTRY_ZOOM: Record<string, number> = buildZoomLevels();

/** Alias ISO-3 → clé centroid (sérialisé dans la WebView Hub). */
export const GLOBE_CODE_ALIASES: Record<string, string> = {
  FRA: 'FR',
  BRA: 'BR',
  ARG: 'AR',
  ESP: 'ES',
  GER: 'DE',
  DEU: 'DE',
  ENG: 'GB-ENG',
  GB: 'GB-ENG',
  USA: 'US',
  MEX: 'MX',
  CAN: 'CA',
  JPN: 'JP',
  KOR: 'KR',
  SEN: 'SN',
  MAR: 'MA',
  POR: 'PT',
  NED: 'NL',
  BEL: 'BE',
  URU: 'UY',
  SUI: 'CH',
  CHE: 'CH',
  CMR: 'CI',
  CIV: 'CI',
  EGY: 'EG',
  SAU: 'SA',
  AUS: 'AU',
  SCO: 'GB-SCT',
};

export const NATION_COLORS: Record<string, string> = {
  FRA: '#002395',
  FR: '#002395',
  BRA: '#009C3B',
  BR: '#009C3B',
  ARG: '#74ACDF',
  AR: '#74ACDF',
  ESP: '#AA151B',
  ES: '#AA151B',
  GER: '#333333',
  DE: '#333333',
  ENG: '#CF081F',
  GB: '#CF081F',
  'GB-ENG': '#CF081F',
  USA: '#3C3B6E',
  US: '#3C3B6E',
  MEX: '#006847',
  MX: '#006847',
  CAN: '#FF0000',
  CA: '#FF0000',
  JPN: '#BC002D',
  JP: '#BC002D',
  SEN: '#00853F',
  SN: '#00853F',
  MAR: '#C1272D',
  MA: '#C1272D',
  POR: '#006600',
  PT: '#006600',
  NED: '#FF6600',
  NL: '#FF6600',
  BEL: '#FFD700',
  BE: '#FFD700',
  URU: '#5EB6E4',
  UY: '#5EB6E4',
  CH: '#FF0000',
  CHE: '#FF0000',
  SUI: '#FF0000',
  ZA: '#007A4D',
  KR: '#003478',
  IT: '#009246',
  CRC: '#002B7F',
  EC: '#FFD100',
  COL: '#FCD116',
  CO: '#FCD116',
  CHL: '#D52B1E',
  CL: '#D52B1E',
  PER: '#D91023',
  PE: '#D91023',
};

export const HUB_COLORS = {
  background: COLORS.bgDeep,
  cardBg: '#111827',
  primary: COLORS.primary,
  text: '#FFFFFF',
  textMuted: '#6B7280',
  live: '#FF3B30',
  gold: '#bfa968',
} as const;

export function nationColor(code: string): string {
  const key = resolveGlobeCountryKey(code);
  return NATION_COLORS[key] ?? NATION_COLORS[code.toUpperCase()] ?? COLORS.primary;
}

export function centroidForCountry(code: string): [number, number] {
  const view = globeViewForCountry(code);
  if (view) return [view.lng, view.lat];
  const key = code.toUpperCase();
  return COUNTRY_CENTROIDS[key] ?? [0, 20];
}

export function zoomForCountry(code: string): number {
  const key = resolveGlobeCountryKey(code);
  return COUNTRY_ZOOM[key] ?? 4;
}

export { resolveGlobeCountryKey, globeViewForCountry };
