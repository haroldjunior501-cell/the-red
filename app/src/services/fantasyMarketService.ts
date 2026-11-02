import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  calculateDynamicPrice,
  priceTrend,
  type MarketPlayerInput,
} from '../utils/fantasyEconomyMath';
import type { PlayerMarketSnapshot } from '../types/fantasyEconomy.types';
import type { FantasyPitchPlayer } from '../types/fantasy.types';

const MARKET_CACHE_KEY = '@goalya/fantasy_market_v1';
const MARKET_TTL_MS = 60 * 60 * 1000;

type MarketCache = {
  updatedAt: number;
  players: Record<string, PlayerMarketSnapshot>;
};

let memoryCache: MarketCache | null = null;

async function loadCache(): Promise<MarketCache> {
  if (memoryCache && Date.now() - memoryCache.updatedAt < MARKET_TTL_MS) {
    return memoryCache;
  }
  try {
    const raw = await AsyncStorage.getItem(MARKET_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MarketCache;
      if (Date.now() - parsed.updatedAt < MARKET_TTL_MS) {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch {
    /* rebuild */
  }
  return { updatedAt: 0, players: {} };
}

async function saveCache(cache: MarketCache): Promise<void> {
  memoryCache = cache;
  await AsyncStorage.setItem(MARKET_CACHE_KEY, JSON.stringify(cache));
}

function snapshotForPlayer(player: FantasyPitchPlayer, prev?: PlayerMarketSnapshot): PlayerMarketSnapshot {
  const input: MarketPlayerInput = {
    id: player.id,
    price: player.price,
    pts: player.pts,
    goals: player.goals,
    rating: player.rating,
    purchaseCount: prev?.purchaseCount,
    performanceScore: prev?.performanceScore,
  };
  const currentPrice = calculateDynamicPrice(input);
  const previousPrice = prev?.currentPrice ?? player.price;
  return {
    playerId: player.id,
    basePrice: player.price,
    currentPrice,
    previousPrice,
    purchaseCount: prev?.purchaseCount ?? Math.abs(hash(player.id)) % 400,
    performanceScore: input.performanceScore ?? 0,
    priceTrend: priceTrend(currentPrice, previousPrice),
    lastUpdated: Date.now(),
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export async function buildMarketForPlayers(
  players: FantasyPitchPlayer[]
): Promise<Map<string, PlayerMarketSnapshot>> {
  const cache = await loadCache();
  const stale = Date.now() - cache.updatedAt > MARKET_TTL_MS;
  const nextPlayers: Record<string, PlayerMarketSnapshot> = stale ? {} : { ...cache.players };

  for (const p of players) {
    const prev = cache.players[p.id];
    nextPlayers[p.id] = snapshotForPlayer(p, stale ? undefined : prev);
  }

  await saveCache({ updatedAt: Date.now(), players: nextPlayers });
  return new Map(Object.entries(nextPlayers));
}

export function applyMarketPrices(
  players: FantasyPitchPlayer[],
  market: Map<string, PlayerMarketSnapshot>
): FantasyPitchPlayer[] {
  return players.map((p) => {
    const snap = market.get(p.id);
    if (!snap) return p;
    return {
      ...p,
      price: snap.currentPrice,
      marketPrice: snap.currentPrice,
      previousMarketPrice: snap.previousPrice,
      priceTrend: snap.priceTrend,
    };
  });
}
