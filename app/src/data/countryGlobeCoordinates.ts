/** Centre carte Hub [lng, lat] + zoom flyTo pour chaque équipe CdM 2026 (codes ISO-2 GOALYA). */
export type CountryGlobeView = {
  lng: number;
  lat: number;
  zoom: number;
  name: string;
};

/** 48 équipes — source `constants/countries.ts`. */
export const COUNTRY_GLOBE_VIEW: Record<string, CountryGlobeView> = {
  MX: { lng: -102.5528, lat: 23.6345, zoom: 4, name: 'Mexique' },
  CZ: { lng: 15.473, lat: 49.8175, zoom: 5, name: 'Tchéquie' },
  ZA: { lng: 22.9375, lat: -30.5595, zoom: 4, name: 'Afrique du Sud' },
  KR: { lng: 127.7669, lat: 35.9078, zoom: 4, name: 'Corée du Sud' },
  CA: { lng: -106.3468, lat: 56.1304, zoom: 3, name: 'Canada' },
  BA: { lng: 17.6791, lat: 43.9159, zoom: 5, name: 'Bosnie-Herzégovine' },
  QA: { lng: 51.1839, lat: 25.3548, zoom: 5, name: 'Qatar' },
  CH: { lng: 8.2275, lat: 46.8182, zoom: 5, name: 'Suisse' },
  BR: { lng: -51.9253, lat: -14.235, zoom: 3, name: 'Brésil' },
  HT: { lng: -72.2852, lat: 18.9712, zoom: 5, name: 'Haïti' },
  MA: { lng: -7.0926, lat: 31.7917, zoom: 4, name: 'Maroc' },
  'GB-SCT': { lng: -4.2026, lat: 56.4907, zoom: 5, name: 'Écosse' },
  US: { lng: -95.7129, lat: 37.0902, zoom: 3, name: 'États-Unis' },
  AU: { lng: 133.7751, lat: -25.2744, zoom: 3, name: 'Australie' },
  PY: { lng: -58.4438, lat: -23.4425, zoom: 4, name: 'Paraguay' },
  TR: { lng: 35.2433, lat: 38.9637, zoom: 4, name: 'Turquie' },
  CW: { lng: -68.99, lat: 12.1696, zoom: 6, name: 'Curaçao' },
  EC: { lng: -78.1834, lat: -1.8312, zoom: 4, name: 'Équateur' },
  DE: { lng: 10.4515, lat: 51.1657, zoom: 4, name: 'Allemagne' },
  CI: { lng: -5.5471, lat: 7.54, zoom: 4, name: "Côte d'Ivoire" },
  NL: { lng: 5.2913, lat: 52.1326, zoom: 5, name: 'Pays-Bas' },
  JP: { lng: 138.2529, lat: 36.2048, zoom: 4, name: 'Japon' },
  SE: { lng: 18.6435, lat: 60.1282, zoom: 4, name: 'Suède' },
  TN: { lng: 9.5375, lat: 33.8869, zoom: 4, name: 'Tunisie' },
  BE: { lng: 4.4699, lat: 50.5039, zoom: 5, name: 'Belgique' },
  EG: { lng: 30.8025, lat: 26.8206, zoom: 4, name: 'Égypte' },
  IR: { lng: 53.688, lat: 32.4279, zoom: 4, name: 'Iran' },
  NZ: { lng: 174.886, lat: -40.9006, zoom: 4, name: 'Nouvelle-Zélande' },
  CV: { lng: -24.0132, lat: 16.0021, zoom: 5, name: 'Cap-Vert' },
  SA: { lng: 45.0792, lat: 23.8859, zoom: 4, name: 'Arabie saoudite' },
  ES: { lng: -3.7492, lat: 40.4637, zoom: 4, name: 'Espagne' },
  UY: { lng: -55.7658, lat: -32.5228, zoom: 4, name: 'Uruguay' },
  FR: { lng: 2.2137, lat: 46.2276, zoom: 4, name: 'France' },
  NO: { lng: 8.4689, lat: 60.472, zoom: 4, name: 'Norvège' },
  SN: { lng: -14.4524, lat: 14.4974, zoom: 4, name: 'Sénégal' },
  IQ: { lng: 43.679, lat: 33.2232, zoom: 4, name: 'Irak' },
  DZ: { lng: 1.6596, lat: 28.0339, zoom: 4, name: 'Algérie' },
  AR: { lng: -63.6167, lat: -38.4161, zoom: 3, name: 'Argentine' },
  AT: { lng: 14.5501, lat: 47.5162, zoom: 5, name: 'Autriche' },
  JO: { lng: 36.2384, lat: 30.5852, zoom: 5, name: 'Jordanie' },
  CO: { lng: -74.2973, lat: 4.5709, zoom: 4, name: 'Colombie' },
  UZ: { lng: 64.5853, lat: 41.3775, zoom: 4, name: 'Ouzbékistan' },
  PT: { lng: -8.2245, lat: 39.3999, zoom: 4, name: 'Portugal' },
  CD: { lng: 21.7587, lat: -4.0383, zoom: 4, name: 'RD Congo' },
  HR: { lng: 15.2, lat: 45.1, zoom: 5, name: 'Croatie' },
  'GB-ENG': { lng: -1.1743, lat: 52.3555, zoom: 5, name: 'Angleterre' },
  GH: { lng: -1.0232, lat: 7.9465, zoom: 4, name: 'Ghana' },
  PA: { lng: -80.7821, lat: 8.538, zoom: 5, name: 'Panama' },
};

/** Alias ISO-3 / codes legacy → clé `COUNTRY_GLOBE_VIEW`. */
const GLOBE_CODE_ALIASES: Record<string, string> = {
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
  CRC: 'CR',
  AUS: 'AU',
  SCO: 'GB-SCT',
};

export function resolveGlobeCountryKey(code: string): string {
  const raw = code.trim().toUpperCase();
  if (!raw) return '';
  if (COUNTRY_GLOBE_VIEW[raw]) return raw;
  const alias = GLOBE_CODE_ALIASES[raw];
  if (alias && COUNTRY_GLOBE_VIEW[alias]) return alias;
  return raw;
}

export function globeViewForCountry(code: string): CountryGlobeView | null {
  const key = resolveGlobeCountryKey(code);
  return COUNTRY_GLOBE_VIEW[key] ?? null;
}
