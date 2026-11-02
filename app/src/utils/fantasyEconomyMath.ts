import { PRESTIGE_LEVELS } from '../constants/fantasyEconomy';
import type { PrestigeLevel } from '../types/fantasyEconomy.types';
import type { FantasyPitchPlayer } from '../types/fantasy.types';

export function getPrestige(budgetM: number): PrestigeLevel {
  const sorted = [...PRESTIGE_LEVELS].sort((a, b) => b.minBudget - a.minBudget);
  return sorted.find((p) => budgetM >= p.minBudget) ?? PRESTIGE_LEVELS[0];
}

export type MarketPlayerInput = {
  id: string;
  price: number;
  pts: number;
  goals: number;
  rating: number;
  purchaseCount?: number;
  performanceScore?: number;
  injured?: boolean;
};

export function calculateDynamicPrice(player: MarketPlayerInput): number {
  const base = player.price;
  const purchaseCount = player.purchaseCount ?? hashCount(player.id);
  const performanceScore =
    player.performanceScore ?? Math.round(player.pts + player.goals * 8 + player.rating * 6);

  let popularityMultiplier = 1 + (purchaseCount / 1000) * 0.3;
  let performanceMultiplier = 1 + (performanceScore / 100) * 0.2;

  if (player.injured) {
    popularityMultiplier *= 0.7;
    performanceMultiplier *= 0.7;
  }

  return Math.round(base * popularityMultiplier * performanceMultiplier * 10) / 10;
}

function hashCount(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % 400 + 20;
}

export function priceTrend(
  current: number,
  previous: number
): 'up' | 'down' | 'stable' {
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

export function applyMarketToPlayer(
  player: FantasyPitchPlayer,
  market: { currentPrice: number; previousPrice: number; priceTrend: 'up' | 'down' | 'stable' }
): FantasyPitchPlayer {
  return {
    ...player,
    price: market.currentPrice,
    marketPrice: market.currentPrice,
    previousMarketPrice: market.previousPrice,
    priceTrend: market.priceTrend,
  };
}

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Semaine ISO (ex. 2026-W21) pour récompenses hebdomadaires. */
export function weekDateKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
