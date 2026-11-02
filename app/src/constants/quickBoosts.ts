export type QuickBoostId = 'boost_1m' | 'boost_5m' | 'boost_10m';

export type QuickBoostDef = {
  id: QuickBoostId;
  gain: number;
  price: number;
};

export const QUICK_BOOSTS: readonly QuickBoostDef[] = [
  { id: 'boost_1m', gain: 1, price: 0.29 },
  { id: 'boost_5m', gain: 5, price: 0.99 },
  { id: 'boost_10m', gain: 10, price: 1.99 },
] as const;

export function getQuickBoost(id: QuickBoostId): QuickBoostDef | undefined {
  return QUICK_BOOSTS.find((b) => b.id === id);
}
