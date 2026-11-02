/** Coupe du monde 2026 — IDs équipes FotMob (league 77). */
export type FotmobNationalTeam = {
  teamId: number;
  countryCode: string;
  country: string;
};

export const FOTMOB_WORLD_CUP_2026_TEAMS: FotmobNationalTeam[] = [
  { teamId: 6723, countryCode: 'FRA', country: 'France' },
  { teamId: 8256, countryCode: 'BRA', country: 'Brazil' },
  { teamId: 6706, countryCode: 'ARG', country: 'Argentina' },
  { teamId: 8491, countryCode: 'ENG', country: 'England' },
  { teamId: 8570, countryCode: 'GER', country: 'Germany' },
  { teamId: 6720, countryCode: 'ESP', country: 'Spain' },
  { teamId: 8361, countryCode: 'POR', country: 'Portugal' },
  { teamId: 6262, countryCode: 'MAR', country: 'Morocco' },
  { teamId: 6708, countryCode: 'NED', country: 'Netherlands' },
  { teamId: 8263, countryCode: 'BEL', country: 'Belgium' },
  { teamId: 10155, countryCode: 'CRO', country: 'Croatia' },
  { teamId: 5796, countryCode: 'URU', country: 'Uruguay' },
  { teamId: 6713, countryCode: 'USA', country: 'USA' },
  { teamId: 6710, countryCode: 'MEX', country: 'Mexico' },
  { teamId: 6715, countryCode: 'JPN', country: 'Japan' },
  { teamId: 6395, countryCode: 'SEN', country: 'Senegal' },
  { teamId: 8258, countryCode: 'COL', country: 'Colombia' },
  { teamId: 8496, countryCode: 'CZE', country: 'Czechia' },
  { teamId: 6717, countryCode: 'SUI', country: 'Switzerland' },
  { teamId: 6707, countryCode: 'ECU', country: 'Ecuador' },
  { teamId: 6716, countryCode: 'AUS', country: 'Australia' },
  { teamId: 5810, countryCode: 'CAN', country: 'Canada' },
  { teamId: 8255, countryCode: 'AUT', country: 'Austria' },
  { teamId: 6317, countryCode: 'ALG', country: 'Algeria' },
  { teamId: 6714, countryCode: 'GHA', country: 'Ghana' },
  { teamId: 6711, countryCode: 'IRN', country: 'Iran' },
  { teamId: 8492, countryCode: 'NOR', country: 'Norway' },
  { teamId: 8520, countryCode: 'SWE', country: 'Sweden' },
  { teamId: 7804, countryCode: 'KOR', country: 'South Korea' },
];

export const FOTMOB_CACHE_KEY = '@goalya/fotmob_wc_pool_v1';
export const FOTMOB_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

export function fotmobPlayerImageUrl(fotmobId: number | string): string {
  return `https://images.fotmob.com/image_resources/playerimages/${fotmobId}.png`;
}

/** Blason / logo équipe (CDN FotMob). */
export function fotmobTeamLogoUrl(teamId: number | string | undefined | null): string | undefined {
  if (teamId == null || teamId === '' || teamId === '0') return undefined;
  return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png`;
}
