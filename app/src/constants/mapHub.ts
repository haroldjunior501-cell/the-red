import { COLORS } from './colors';
import { countryFlagFromCode, resolveCountryDisplayCode } from '../utils/countryDisplayCode';

/** Palette hub Map GOALYA — alignée sur COLORS.primary (#2979ff). */
export const MAP_HUB_COLORS = {
  background: COLORS.bgDeep,
  primary: COLORS.primary,
  primaryLight: COLORS.primaryLight,
  accent: '#FF6584',
  cardBg: '#111827',
  cardBorder: '#1F2937',
  text: '#FFFFFF',
  textMuted: '#6B7280',
  live: '#FF3B30',
  mapDark: COLORS.bgDeep,
  bg: COLORS.bgDeep,
  card: COLORS.card,
  border: COLORS.border,
} as const;

export type HostCountry = {
  id: string;
  name: string;
  coordinates: [number, number];
  matchCount: number;
  color: string;
};

export const HOST_COUNTRIES: readonly HostCountry[] = [
  { id: 'usa', name: 'États-Unis', coordinates: [-98.5795, 39.8283], matchCount: 32, color: '#7C3AED' },
  { id: 'canada', name: 'Canada', coordinates: [-96.7969, 56.1304], matchCount: 13, color: '#E8334A' },
  { id: 'mexico', name: 'Mexique', coordinates: [-102.5528, 23.6345], matchCount: 8, color: '#EAB308' },
  { id: 'france', name: 'France', coordinates: [2.2137, 46.2276], matchCount: 24, color: COLORS.primary },
  { id: 'brazil', name: 'Brésil', coordinates: [-51.9253, -14.235], matchCount: 16, color: '#EAB308' },
  { id: 'japan', name: 'Japon', coordinates: [138.2529, 36.2048], matchCount: 18, color: '#A855F7' },
] as const;

export type Stadium = {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
  capacity: number;
};

export const STADIUMS: readonly Stadium[] = [
  { id: 'metlife', name: 'MetLife Stadium', city: 'New York', country: 'usa', coordinates: [-74.0776, 40.8135], capacity: 82500 },
  { id: 'sofi', name: 'SoFi Stadium', city: 'Los Angeles', country: 'usa', coordinates: [-118.3378, 33.9535], capacity: 70240 },
  { id: 'atandt', name: "AT&T Stadium", city: 'Dallas', country: 'usa', coordinates: [-97.093, 32.7473], capacity: 80000 },
  { id: 'hard_rock', name: 'Hard Rock Stadium', city: 'Miami', country: 'usa', coordinates: [-80.2389, 25.958], capacity: 65326 },
  { id: 'levis', name: "Levi's Stadium", city: 'San Francisco', country: 'usa', coordinates: [-121.9696, 37.4033], capacity: 68500 },
  { id: 'rose_bowl', name: 'Rose Bowl', city: 'Los Angeles', country: 'usa', coordinates: [-118.167, 34.1614], capacity: 90888 },
  { id: 'lincoln', name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'usa', coordinates: [-75.1674, 39.9008], capacity: 69796 },
  { id: 'nrg', name: 'NRG Stadium', city: 'Houston', country: 'usa', coordinates: [-95.41, 29.6847], capacity: 72220 },
  { id: 'lumen', name: 'Lumen Field', city: 'Seattle', country: 'usa', coordinates: [-122.3316, 47.5952], capacity: 69000 },
  { id: 'gillette', name: 'Gillette Stadium', city: 'Boston', country: 'usa', coordinates: [-71.2643, 42.0909], capacity: 65878 },
  { id: 'arrowhead', name: 'Arrowhead Stadium', city: 'Kansas City', country: 'usa', coordinates: [-94.484, 39.0489], capacity: 76416 },
  { id: 'bmo', name: 'BMO Field', city: 'Toronto', country: 'canada', coordinates: [-79.4189, 43.6333], capacity: 45736 },
  { id: 'bc_place', name: 'BC Place', city: 'Vancouver', country: 'canada', coordinates: [-123.1116, 49.2768], capacity: 54500 },
  { id: 'azteca', name: 'Estadio Azteca', city: 'Mexico City', country: 'mexico', coordinates: [-99.15, 19.3029], capacity: 87523 },
  { id: 'bbva', name: 'Estadio BBVA', city: 'Monterrey', country: 'mexico', coordinates: [-100.4058, 25.6693], capacity: 53500 },
  { id: 'akron', name: 'Estadio Akron', city: 'Guadalajara', country: 'mexico', coordinates: [-103.6196, 20.6858], capacity: 49850 },
] as const;

export type MatchPhase = 'before' | 'live' | 'after' | 'none';

export type MatchPhaseInput = {
  date: string;
  time: string;
};

/** Phase temporelle simplifiée (kickoff = date ISO + time locale). */
export function getMatchPhase(match: MatchPhaseInput): MatchPhase {
  const kickoff = new Date(`${match.date}T${match.time}:00`);
  if (Number.isNaN(kickoff.getTime())) return 'none';
  const now = new Date();
  const diffMinutes = (now.getTime() - kickoff.getTime()) / 60_000;
  if (diffMinutes < -180) return 'before';
  if (diffMinutes >= 0 && diffMinutes <= 110) return 'live';
  if (diffMinutes > 110 && diffMinutes < 2880) return 'after';
  return 'none';
}

export function stadiumsForCountry(countryId: string): Stadium[] {
  return STADIUMS.filter((s) => s.country === countryId);
}

export function stadiumById(id: string): Stadium | undefined {
  return STADIUMS.find((s) => s.id === id);
}

export function hostById(id: string): HostCountry | undefined {
  return HOST_COUNTRIES.find((c) => c.id === id);
}

export const NATION_COLORS: Record<string, string> = {
  FRA: '#002395', FR: '#002395',
  BRA: '#009C3B', BR: '#009C3B',
  ARG: '#74ACDF', AR: '#74ACDF',
  ESP: '#AA151B', ES: '#AA151B',
  GER: '#333333', DE: '#333333',
  ENG: '#CF081F', EN: '#CF081F',
  POR: '#006600', PT: '#006600',
  NED: '#FF6600', NL: '#FF6600',
  BEL: '#FFD700', BE: '#FFD700',
  USA: '#3C3B6E', US: '#3C3B6E',
  MEX: '#006847', MX: '#006847',
  CAN: '#FF0000', CA: '#FF0000',
  JPN: '#BC002D', JP: '#BC002D',
  SEN: '#00853F', SN: '#00853F',
  MAR: '#C1272D', MA: '#C1272D',
  URU: '#5EB6E4', UY: '#5EB6E4',
};

export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  FRA: [2.3522, 46.2276], FR: [2.3522, 46.2276],
  BRA: [-51.9253, -14.235], BR: [-51.9253, -14.235],
  ARG: [-63.6167, -38.416], AR: [-63.6167, -38.416],
  ESP: [-3.7492, 40.4637], ES: [-3.7492, 40.4637],
  GER: [10.4515, 51.1657], DE: [10.4515, 51.1657],
  ENG: [-1.1743, 52.3555], EN: [-1.1743, 52.3555],
  USA: [-95.7129, 37.0902], US: [-95.7129, 37.0902],
  MEX: [-102.5528, 23.634], MX: [-102.5528, 23.634],
  CAN: [-96.7969, 56.1304], CA: [-96.7969, 56.1304],
  JPN: [138.2529, 36.2048], JP: [138.2529, 36.2048],
  SEN: [-14.4524, 14.4974], SN: [-14.4524, 14.4974],
  MAR: [-7.0926, 31.7917], MA: [-7.0926, 31.7917],
  POR: [-8.2245, 39.3999], PT: [-8.2245, 39.3999],
  NED: [5.2913, 52.1326], NL: [5.2913, 52.1326],
  BEL: [4.4699, 50.5039], BE: [4.4699, 50.5039],
  URU: [-55.7658, -32.523], UY: [-55.7658, -32.523],
};

export const HOST_TO_NATION_2: Record<string, string> = {
  usa: 'US', canada: 'CA', mexico: 'MX',
  france: 'FR', brazil: 'BR', japan: 'JP',
};

export function countryIdToNation(countryId: string): string {
  return HOST_TO_NATION_2[countryId.toLowerCase()] ?? countryId.toUpperCase().slice(0, 2);
}

export function nationColorOf(code: string): string {
  return NATION_COLORS[code] ?? MAP_HUB_COLORS.primary;
}

export function centroidOf(code: string): [number, number] | null {
  return COUNTRY_CENTROIDS[code] ?? null;
}

/** Drapeau emoji (calendrier local ou code ISO Live Score). */
export function flagEmoji(code: string, teamName?: string): string {
  const fromCatalog = countryFlagFromCode(code);
  if (fromCatalog) return fromCatalog;

  const normalized = resolveCountryDisplayCode({ iso: code, teamName });
  const fromNorm = countryFlagFromCode(normalized);
  if (fromNorm) return fromNorm;

  const a2 = normalized.length === 2 ? normalized : iso3ToIso2(normalized);
  if (!/^[A-Z]{2}$/.test(a2)) return '🏳️';
  return a2
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

function iso3ToIso2(code: string): string {
  const alpha3to2: Record<string, string> = {
    FRA: 'FR', BRA: 'BR', ARG: 'AR', ESP: 'ES', GER: 'DE', ENG: 'GB',
    USA: 'US', MEX: 'MX', CAN: 'CA', JPN: 'JP', SEN: 'SN', MAR: 'MA',
    POR: 'PT', NED: 'NL', BEL: 'BE', URU: 'UY',
  };
  const u = code.trim().toUpperCase();
  return alpha3to2[u] ?? (u.length === 2 ? u : u.slice(0, 2));
}
