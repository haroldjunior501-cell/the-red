export type CountryColorTheme = {
  primary: string;
  secondary: string;
  tertiary?: string;
};

const THEMES: Record<string, CountryColorTheme> = {
  FR: { primary: '#002395', secondary: '#FFFFFF', tertiary: '#ED2939' },
  BR: { primary: '#009739', secondary: '#FEDD00', tertiary: '#002776' },
  AR: { primary: '#74ACDF', secondary: '#FFFFFF', tertiary: '#74ACDF' },
  MA: { primary: '#C1272D', secondary: '#006233' },
  ES: { primary: '#AA151B', secondary: '#F1BF00' },
  DE: { primary: '#000000', secondary: '#DD0000', tertiary: '#FFCE00' },
  IT: { primary: '#009246', secondary: '#FFFFFF', tertiary: '#CE2B37' },
  PT: { primary: '#006600', secondary: '#FF0000' },
  GB: { primary: '#012169', secondary: '#C8102E' },
  EN: { primary: '#012169', secondary: '#C8102E' },
  US: { primary: '#3C3B6E', secondary: '#B22234' },
  SN: { primary: '#00853F', secondary: '#FDEF42', tertiary: '#E31B23' },
  CI: { primary: '#F77F00', secondary: '#009E60', tertiary: '#FFFFFF' },
  CM: { primary: '#007A5E', secondary: '#CE1126', tertiary: '#FCD116' },
  NG: { primary: '#008751', secondary: '#FFFFFF' },
  DZ: { primary: '#006233', secondary: '#FFFFFF', tertiary: '#D21034' },
  TN: { primary: '#E70013', secondary: '#FFFFFF' },
  BE: { primary: '#000000', secondary: '#FAE042', tertiary: '#ED2939' },
  NL: { primary: '#AE1C28', secondary: '#FFFFFF', tertiary: '#21468B' },
  JP: { primary: '#BC002D', secondary: '#FFFFFF' },
  KR: { primary: '#003478', secondary: '#FFFFFF', tertiary: '#CD2E3A' },
  MX: { primary: '#006847', secondary: '#FFFFFF', tertiary: '#CE1126' },
};

const DEFAULT: CountryColorTheme = { primary: '#2979FF', secondary: '#5B9AFF' };

export function getCountryColorTheme(countryCode: string): CountryColorTheme {
  const code = countryCode.trim().toUpperCase();
  return THEMES[code] ?? DEFAULT;
}

/** Gradient CSS-like pour fond avatar (3 bandes si possible). */
export function countryAvatarGradient(countryCode: string): readonly [string, string, ...string[]] {
  const t = getCountryColorTheme(countryCode);
  if (t.tertiary) return [t.primary, t.secondary, t.tertiary];
  return [t.primary, t.secondary];
}
