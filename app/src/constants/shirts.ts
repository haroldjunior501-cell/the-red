export type ShirtColors = {
  primary: string;
  secondary: string;
  stripe?: boolean;
};

export const NATION_SHIRTS: Record<string, ShirtColors> = {
  FRA: { primary: '#002395', secondary: '#FFFFFF' },
  BRA: { primary: '#009C3B', secondary: '#FFD700' },
  ARG: { primary: '#74ACDF', secondary: '#FFFFFF', stripe: true },
  ESP: { primary: '#AA151B', secondary: '#F1BF00' },
  GER: { primary: '#FFFFFF', secondary: '#000000' },
  ENG: { primary: '#FFFFFF', secondary: '#CF081F' },
  POR: { primary: '#006600', secondary: '#FF0000' },
  MAR: { primary: '#C1272D', secondary: '#006233' },
  JPN: { primary: '#003087', secondary: '#FFFFFF' },
  USA: { primary: '#002868', secondary: '#BF0A30' },
  MEX: { primary: '#006847', secondary: '#FFFFFF' },
  SEN: { primary: '#00853F', secondary: '#FDEF42' },
  URU: { primary: '#5EB6E4', secondary: '#FFFFFF' },
  NED: { primary: '#FF6600', secondary: '#FFFFFF' },
  BEL: { primary: '#000000', secondary: '#FF0000' },
  GK: { primary: '#FF6600', secondary: '#002395' },
};

const ISO2_TO_SHIRT: Record<string, string> = {
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
};

export function shirtCode(countryCode: string, isGoalkeeper: boolean): string {
  if (isGoalkeeper) return 'GK';
  const c = countryCode.trim().toUpperCase();
  if (NATION_SHIRTS[c]) return c;
  return ISO2_TO_SHIRT[c] ?? c;
}
