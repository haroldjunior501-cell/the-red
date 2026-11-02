export const QUICK_BOOSTS = [
  { id: 'boost_1m', gain: 1, priceEur: 0.29, label: '+1M€ Boost' },
  { id: 'boost_5m', gain: 5, priceEur: 0.99, label: '+5M€ Boost' },
  { id: 'boost_10m', gain: 10, priceEur: 1.99, label: '+10M€ Boost' },
] as const;

export type QuickBoostId = (typeof QUICK_BOOSTS)[number]['id'];

export function getQuickBoost(boostId: string) {
  return QUICK_BOOSTS.find((b) => b.id === boostId) ?? null;
}
