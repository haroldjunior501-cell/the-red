/** Config maillots domicile (couleurs + motifs officiels approximés). */
export type NationalKitStyle = {
  shirtColor: string;
  sleeveColor: string;
  shirtStyle:
    | 'plain'
    | 'two-color'
    | 'striped'
    | 'striped-thin'
    | 'striped-thick'
    | 'checkered'
    | 'hoops'
    | 'single-band'
    | 'waves'
    | 'dashed';
  shirtStyleColor?: string;
  shirtStyleDirection?: 'diagonal-right' | 'diagonal-left' | 'horizontal' | 'vertical';
  textColor?: string;
};

const K = (style: NationalKitStyle): NationalKitStyle => style;

export const NATIONAL_KIT_STYLES: Record<string, NationalKitStyle> = {
  FRA: K({ shirtColor: '#002395', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  FR: K({ shirtColor: '#002395', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  BRA: K({ shirtColor: '#FFDF00', sleeveColor: '#009B3A', shirtStyle: 'plain', textColor: '#009B3A' }),
  BR: K({ shirtColor: '#FFDF00', sleeveColor: '#009B3A', shirtStyle: 'plain', textColor: '#009B3A' }),
  ARG: K({
    shirtColor: '#74ACDF',
    sleeveColor: '#000000',
    shirtStyle: 'striped',
    shirtStyleColor: '#FFFFFF',
    textColor: '#000000',
  }),
  AR: K({
    shirtColor: '#74ACDF',
    sleeveColor: '#000000',
    shirtStyle: 'striped',
    shirtStyleColor: '#FFFFFF',
    textColor: '#000000',
  }),
  ESP: K({ shirtColor: '#AA151B', sleeveColor: '#F1BF00', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  ES: K({ shirtColor: '#AA151B', sleeveColor: '#F1BF00', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  GER: K({ shirtColor: '#FFFFFF', sleeveColor: '#000000', shirtStyle: 'plain', textColor: '#111111' }),
  DE: K({ shirtColor: '#FFFFFF', sleeveColor: '#000000', shirtStyle: 'plain', textColor: '#111111' }),
  ENG: K({ shirtColor: '#FFFFFF', sleeveColor: '#CF081F', shirtStyle: 'plain', textColor: '#CF081F' }),
  'GB-ENG': K({ shirtColor: '#FFFFFF', sleeveColor: '#CF081F', shirtStyle: 'plain', textColor: '#CF081F' }),
  POR: K({ shirtColor: '#006600', sleeveColor: '#FF0000', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  PT: K({ shirtColor: '#006600', sleeveColor: '#FF0000', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  MAR: K({ shirtColor: '#C1272D', sleeveColor: '#006233', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  MA: K({ shirtColor: '#C1272D', sleeveColor: '#006233', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  JPN: K({ shirtColor: '#003087', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  JP: K({ shirtColor: '#003087', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  USA: K({
    shirtColor: '#FFFFFF',
    sleeveColor: '#BF0A30',
    shirtStyle: 'striped',
    shirtStyleColor: '#002868',
    textColor: '#002868',
  }),
  US: K({
    shirtColor: '#FFFFFF',
    sleeveColor: '#BF0A30',
    shirtStyle: 'striped',
    shirtStyleColor: '#002868',
    textColor: '#002868',
  }),
  MEX: K({ shirtColor: '#006847', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  MX: K({ shirtColor: '#006847', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  SEN: K({ shirtColor: '#FFFFFF', sleeveColor: '#00853F', shirtStyle: 'plain', textColor: '#00853F' }),
  SN: K({ shirtColor: '#FFFFFF', sleeveColor: '#00853F', shirtStyle: 'plain', textColor: '#00853F' }),
  URU: K({
    shirtColor: '#5EB6E4',
    sleeveColor: '#FFFFFF',
    shirtStyle: 'striped',
    shirtStyleColor: '#000000',
    textColor: '#000000',
  }),
  UY: K({
    shirtColor: '#5EB6E4',
    sleeveColor: '#FFFFFF',
    shirtStyle: 'striped',
    shirtStyleColor: '#000000',
    textColor: '#000000',
  }),
  NED: K({ shirtColor: '#FF6600', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  NL: K({ shirtColor: '#FF6600', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  BEL: K({
    shirtColor: '#000000',
    sleeveColor: '#FF0000',
    shirtStyle: 'two-color',
    shirtStyleColor: '#FFDF00',
    shirtStyleDirection: 'vertical',
    textColor: '#FFFFFF',
  }),
  BE: K({
    shirtColor: '#000000',
    sleeveColor: '#FF0000',
    shirtStyle: 'two-color',
    shirtStyleColor: '#FFDF00',
    shirtStyleDirection: 'vertical',
    textColor: '#FFFFFF',
  }),
  ITA: K({ shirtColor: '#003399', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  IT: K({ shirtColor: '#003399', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' }),
  CRO: K({
    shirtColor: '#FFFFFF',
    sleeveColor: '#FF0000',
    shirtStyle: 'checkered',
    shirtStyleColor: '#FF0000',
    textColor: '#FF0000',
  }),
  HR: K({
    shirtColor: '#FFFFFF',
    sleeveColor: '#FF0000',
    shirtStyle: 'checkered',
    shirtStyleColor: '#FF0000',
    textColor: '#FF0000',
  }),
  COL: K({ shirtColor: '#FCD116', sleeveColor: '#003893', shirtStyle: 'plain', textColor: '#003893' }),
  CO: K({ shirtColor: '#FCD116', sleeveColor: '#003893', shirtStyle: 'plain', textColor: '#003893' }),
  GK: K({
    shirtColor: '#FF6600',
    sleeveColor: '#1a1a2e',
    shirtStyle: 'two-color',
    shirtStyleColor: '#1a1a2e',
    shirtStyleDirection: 'vertical',
    textColor: '#FFFFFF',
  }),
};

const ISO2_TO_KIT: Record<string, string> = {
  FR: 'FRA',
  BR: 'BRA',
  AR: 'ARG',
  ES: 'ESP',
  DE: 'GER',
  EN: 'ENG',
  GB: 'ENG',
  PT: 'POR',
  MA: 'MAR',
  JP: 'JPN',
  US: 'USA',
  MX: 'MEX',
  SN: 'SEN',
  BE: 'BEL',
  NL: 'NED',
  UY: 'URU',
  IT: 'ITA',
  HR: 'CRO',
  CO: 'COL',
};

export function resolveKitStyleKey(countryCode: string, isGoalkeeper: boolean): string {
  if (isGoalkeeper) return 'GK';
  const c = countryCode.trim().toUpperCase();
  if (NATIONAL_KIT_STYLES[c]) return c;
  const mapped = ISO2_TO_KIT[c];
  if (mapped) return mapped;
  return c;
}

export function getNationalKitStyle(countryCode: string, isGoalkeeper: boolean): NationalKitStyle {
  const key = resolveKitStyleKey(countryCode, isGoalkeeper);
  return (
    NATIONAL_KIT_STYLES[key] ?? {
      shirtColor: '#1c2a42',
      sleeveColor: '#ffffff',
      shirtStyle: 'plain',
      textColor: '#ffffff',
    }
  );
}
