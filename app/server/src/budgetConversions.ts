export const BUDGET_CONVERSIONS = [
  { fp: 100, gain: 1 },
  { fp: 500, gain: 6 },
  { fp: 1000, gain: 15 },
  { fp: 2500, gain: 40 },
  { fp: 5000, gain: 90 },
] as const;

export function findConversion(fpCost: number, budgetGain: number) {
  return BUDGET_CONVERSIONS.find((c) => c.fp === fpCost && c.gain === budgetGain) ?? null;
}
