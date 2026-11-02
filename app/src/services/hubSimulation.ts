import { COUNTRY_CENTROIDS, nationColor } from '../constants/hubGlobe';
import { flagEmoji } from '../constants/mapHub';
import type { ParsedLiveScore } from '../services/livescoreApi';
import type { ActiveSupporter, WorldChatMessage } from '../services/hubRtdbService';
import { HUB_SIMULATION_MATCH_ID } from '../constants/hubSimulation';

type SimProfile = {
  userId: string;
  username: string;
  rank: string;
  country: string;
};

const SCRIPTED_MESSAGES: { username: string; rank: string; country: string; message: string }[] = [
  { username: 'Kenji', rank: 'Supporter', country: 'JPN', message: 'THIS MATCH IS INSANE 🔥' },
  { username: 'Amadou', rank: 'Vétéran', country: 'SEN', message: 'On ne lâche rien !' },
  { username: 'Lucas', rank: 'Capitaine', country: 'FRA', message: 'ALLEZ LES BLEUS 🇫🇷' },
  { username: 'Rafael', rank: 'Supporter', country: 'BRA', message: 'Vamos Brasil 💚💛' },
  { username: 'Sofia', rank: 'Supporter', country: 'ESP', message: 'Quel pressing !' },
  { username: 'Diego', rank: 'Vétéran', country: 'ARG', message: 'Quel contre fulgurant' },
  { username: 'Emma', rank: 'Supporter', country: 'ENG', message: 'The atmosphere is unreal' },
  { username: 'Youssef', rank: 'Supporter', country: 'MAR', message: 'Le stade vibre partout' },
  { username: 'Hugo', rank: 'Supporter', country: 'FRA', message: 'MBAPPÉÉÉÉ 🔥🔥' },
  { username: 'Carla', rank: 'Supporter', country: 'BRA', message: 'Réaction immédiate là' },
  { username: 'Noah', rank: 'Supporter', country: 'USA', message: 'World Cup energy' },
  { username: 'Inès', rank: 'Supporter', country: 'FRA', message: 'On sent la foule monter' },
];

const SUPPORTER_PROFILES: SimProfile[] = [
  { userId: 'sim-1', username: 'Lucas', rank: 'Capitaine', country: 'FRA' },
  { userId: 'sim-2', username: 'Rafael', rank: 'Supporter', country: 'BRA' },
  { userId: 'sim-3', username: 'Kenji', rank: 'Supporter', country: 'JPN' },
  { userId: 'sim-4', username: 'Sofia', rank: 'Supporter', country: 'ESP' },
  { userId: 'sim-5', username: 'Diego', rank: 'Vétéran', country: 'ARG' },
  { userId: 'sim-6', username: 'Emma', rank: 'Supporter', country: 'ENG' },
  { userId: 'sim-7', username: 'Youssef', rank: 'Supporter', country: 'MAR' },
  { userId: 'sim-8', username: 'Noah', rank: 'Supporter', country: 'USA' },
  { userId: 'sim-9', username: 'Amadou', rank: 'Vétéran', country: 'SEN' },
  { userId: 'sim-10', username: 'Carla', rank: 'Supporter', country: 'BRA' },
  { userId: 'sim-11', username: 'Inès', rank: 'Supporter', country: 'FRA' },
  { userId: 'sim-12', username: 'Marco', rank: 'Supporter', country: 'POR' },
];

function jitterCoord(value: number): number {
  return value + (Math.random() - 0.5) * 3;
}

function makeSupporter(profile: SimProfile): ActiveSupporter {
  const country = profile.country.toUpperCase();
  const [lng, lat] = COUNTRY_CENTROIDS[country] ?? [0, 20];
  return {
    id: profile.userId,
    lat: jitterCoord(lat),
    lng: jitterCoord(lng),
    country,
    countryColor: nationColor(country),
    flag: flagEmoji(country),
    username: profile.username,
    rank: profile.rank,
    intensity: 0.7 + Math.random() * 0.3,
    lastActive: Date.now(),
  };
}

function makeChatMessage(seed: (typeof SCRIPTED_MESSAGES)[number], index: number, timestamp: number): WorldChatMessage {
  const country = seed.country.toUpperCase();
  const [lng, lat] = COUNTRY_CENTROIDS[country] ?? [0, 20];
  return {
    id: `sim-msg-${index}`,
    userId: `sim-user-${country}-${index}`,
    username: seed.username,
    flag: flagEmoji(country),
    country,
    countryColor: nationColor(country),
    rank: seed.rank,
    message: seed.message,
    timestamp,
    lat: jitterCoord(lat),
    lng: jitterCoord(lng),
  };
}

export function createSimulationLiveScore(): ParsedLiveScore {
  return {
    matchId: HUB_SIMULATION_MATCH_ID,
    isLive: true,
    minute: 80,
    home: { name: 'France', flag: flagEmoji('FRA'), score: 2, code: 'FRA' },
    away: { name: 'Brésil', flag: flagEmoji('BRA'), score: 1, code: 'BRA' },
    possession: { home: 58, away: 42 },
    shots: { home: 9, away: 6 },
    xg: { home: 1.8, away: 1.2 },
  };
}

export function createInitialSimulationMessages(): WorldChatMessage[] {
  const now = Date.now();
  return SCRIPTED_MESSAGES.slice(0, 6).map((seed, index) => makeChatMessage(seed, index, now - (6 - index) * 12_000));
}

export function createSimulationSupporters(): ActiveSupporter[] {
  return SUPPORTER_PROFILES.map(makeSupporter);
}

export function nextSimulationMessage(index: number, timestamp: number): WorldChatMessage {
  const seed = SCRIPTED_MESSAGES[index % SCRIPTED_MESSAGES.length];
  return makeChatMessage(seed, index, timestamp);
}

export function buildSimulationHeatFeatures(messages: WorldChatMessage[]) {
  const counts = messages.reduce<Record<string, number>>((acc, msg) => {
    const code = msg.country.toUpperCase();
    acc[code] = (acc[code] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([code, count]) => {
    const coords = COUNTRY_CENTROIDS[code] ?? [0, 0];
    return {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [coords[0], coords[1]] as [number, number] },
      properties: {
        country: code,
        intensity: Math.min(1, count / 8),
        countryColor: nationColor(code),
      },
    };
  });
}

export function createSimulationUserMessage(
  user: { userId: string; username: string; rank: string; country: string },
  text: string,
  index: number
): WorldChatMessage {
  const country = user.country.toUpperCase();
  const [lng, lat] = COUNTRY_CENTROIDS[country] ?? [0, 20];
  return {
    id: `sim-user-msg-${index}`,
    userId: user.userId || `sim-local-${country}`,
    username: user.username || 'Supporter',
    flag: flagEmoji(country),
    country,
    countryColor: nationColor(country),
    rank: user.rank,
    message: text.trim(),
    timestamp: Date.now(),
    lat: jitterCoord(lat),
    lng: jitterCoord(lng),
  };
}
