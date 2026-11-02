export const FP_PACKS = [
  { id: 'bronze', fp: 100, bonus: 0, priceEur: 0.49, label: 'PACK BRONZE' },
  { id: 'silver', fp: 250, bonus: 0, priceEur: 0.99, label: 'PACK SILVER' },
  { id: 'gold', fp: 600, bonus: 20, priceEur: 1.99, label: 'PACK GOLD' },
  { id: 'platinum', fp: 1400, bonus: 100, priceEur: 3.99, label: 'PACK PLATINUM' },
  { id: 'diamond', fp: 3000, bonus: 300, priceEur: 7.99, label: 'PACK DIAMOND' },
  { id: 'legend', fp: 7000, bonus: 1000, priceEur: 14.99, label: 'PACK LEGEND' },
] as const;

export type FpPackId = (typeof FP_PACKS)[number]['id'];

export function getPack(packId: string) {
  return FP_PACKS.find((p) => p.id === packId) ?? null;
}

export function totalFp(pack: (typeof FP_PACKS)[number]): number {
  return pack.fp + pack.bonus;
}
