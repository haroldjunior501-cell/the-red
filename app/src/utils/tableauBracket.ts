import { COUNTRIES } from '../constants/countries';
import { WC_GROUP_ENTRIES } from '../constants/liveGroups';
import type { BracketPrediction, BracketRound, GamesFixture } from '../types/games.types';
import { formatKickoffLabel } from './liveMatchUtils';

export type TableauTabKey = 'apercu' | 'groupes' | 'elimination' | 'pronos' | 'classement';

export type BracketRoundKey = 'r16' | 'quarter' | 'semi' | 'final' | 'third';

export type BracketRounds = Record<BracketRoundKey, GamesFixture[]>;

export function roundKeyFromPhase(phase: string): BracketRoundKey | null {
  const p = phase.toLowerCase();
  if (p.includes('petite') || p.includes('3rd') || p.includes('third')) return 'third';
  if (p.includes('16') || p.includes('1/8') || p.includes('huit')) return 'r16';
  if (p.includes('quarter') || p.includes('quart')) return 'quarter';
  if (p.includes('semi') || p.includes('demi')) return 'semi';
  if ((p.includes('final') || p.includes('finale')) && !p.includes('demi')) return 'final';
  return null;
}

export function bracketRoundToLegacy(round: BracketRoundKey): BracketRound {
  if (round === 'third') return 'semi';
  return round;
}

export function groupCountriesByLetter(): { letter: string; name: string; countries: typeof COUNTRIES }[] {
  return WC_GROUP_ENTRIES.map((entry) => ({
    letter: entry.letter,
    name: entry.name,
    countries: COUNTRIES.filter((c) => c.group === entry.letter),
  }));
}

export function splitBracketFixtures(fixtures: GamesFixture[]): BracketRounds {
  const out: BracketRounds = { r16: [], quarter: [], semi: [], final: [], third: [] };
  for (const fx of fixtures) {
    const key = roundKeyFromPhase(fx.phase);
    if (key) out[key].push(fx);
  }
  const sortByKickoff = (a: GamesFixture, b: GamesFixture) => a.kickoffMs - b.kickoffMs;
  out.r16.sort(sortByKickoff);
  out.quarter.sort(sortByKickoff);
  out.semi.sort(sortByKickoff);
  out.final.sort(sortByKickoff);
  out.third.sort(sortByKickoff);
  return out;
}

export function fixtureKickoffLabel(fx: GamesFixture): string {
  return fx.kickoffMs > 0 ? formatKickoffLabel(fx.kickoffMs) : 'Date à confirmer';
}

export function getPrediction(
  predictions: BracketPrediction[],
  matchId: string,
): BracketPrediction | undefined {
  return predictions.find((p) => p.matchId === matchId);
}

export function countBracketPicks(predictions: BracketPrediction[]): number {
  return predictions.length;
}

/** Slots vides pour compléter une colonne (ex. 8 huitièmes). */
export function padRoundSlots(fixtures: GamesFixture[], target: number): (GamesFixture | null)[] {
  const slots: (GamesFixture | null)[] = fixtures.map((f) => f);
  while (slots.length < target) slots.push(null);
  return slots.slice(0, target);
}
