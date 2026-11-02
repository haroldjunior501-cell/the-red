import { COUNTRY_CENTROIDS, nationColor } from '../constants/hubGlobe';
import { flagEmoji } from '../constants/mapHub';
import { NATION_DISTRIBUTION } from '../constants/simulation';
import { getSimMessage } from '../data/simMessages';
import type { HeatFeature } from '../types/heatmap';
import type { WorldChatMessage } from './hubRtdbService';
import { removeSimulatedChat } from './hubRtdbService';

export type SimConfig = {
  totalUsers: number;
  speed: number;
  matchMinute: number;
  homeScore: number;
  awayScore: number;
};

const SIM_RANKS = ['Supporter', 'Vétéran', 'Capitaine'] as const;

export function randomSimCountry(): string {
  const entries = Object.entries(NATION_DISTRIBUTION);
  const roll = Math.random();
  let cursor = 0;
  for (const [code, weight] of entries) {
    cursor += weight;
    if (roll <= cursor) return code;
  }
  return entries[0]?.[0] ?? 'FRA';
}

export function randomSimPosition(country: string): { lat: number; lng: number } {
  const [lng, lat] = COUNTRY_CENTROIDS[country] ?? [0, 20];
  return {
    lat: lat + (Math.random() - 0.5) * 6,
    lng: lng + (Math.random() - 0.5) * 6,
  };
}

export function createSimTickMessage(tick: number): WorldChatMessage {
  const country = randomSimCountry();
  const { lat, lng } = randomSimPosition(country);
  const id = `sim-live-${Date.now()}-${tick}`;
  return {
    id,
    userId: `sim_${id}`,
    username: `Supporter_${Math.floor(Math.random() * 9999)}`,
    flag: flagEmoji(country),
    country,
    countryColor: nationColor(country),
    rank: SIM_RANKS[Math.floor(Math.random() * SIM_RANKS.length)],
    message: getSimMessage(country),
    timestamp: Date.now(),
    lat,
    lng,
  };
}

export function buildSimHeatFeatures(activity: Record<string, number>): HeatFeature[] {
  return Object.entries(activity).map(([code, count]) => {
    const coords = COUNTRY_CENTROIDS[code] ?? [0, 0];
    return {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [coords[0], coords[1]] as [number, number] },
      properties: {
        intensity: Math.min(1, count / 8),
        countryColor: nationColor(code),
      },
    };
  });
}

export async function cleanSimulationData(matchId: string): Promise<void> {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  await removeSimulatedChat(matchId);
}

export function estimateCrowdStats(speed: number): {
  messagesPerMinute: number;
  reactionsPerSecond: number;
  activeUsers: number;
} {
  return {
    messagesPerMinute: Math.round(speed * 180 + Math.random() * 60),
    reactionsPerSecond: Math.round(speed * 45 + Math.random() * 20),
    activeUsers: 498_000 + Math.floor(Math.random() * 4_000),
  };
}
