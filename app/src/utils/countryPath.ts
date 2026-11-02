import type { BracketPrediction } from '../types/games.types';
import type { GamesFixture } from '../types/games.types';
import type { BracketRoundKey } from './tableauBracket';
import { getPrediction, roundKeyFromPhase } from './tableauBracket';
import type { BracketTeam } from './bracketState';

export type CountryPathStep = {
  fixture: GamesFixture;
  round: BracketRoundKey;
  roundLabel: string;
  myTeam: BracketTeam;
  opponent: BracketTeam;
};

const ROUND_LABELS: Record<BracketRoundKey, string> = {
  r16: 'Huitièmes de finale',
  quarter: 'Quarts de finale',
  semi: 'Demi-finale',
  final: 'Finale',
  third: 'Petite finale',
};

export function codesMatch(a: string, b: string): boolean {
  const na = a.toUpperCase().replace(/-/g, '');
  const nb = b.toUpperCase().replace(/-/g, '');
  return na === nb || a.toUpperCase() === b.toUpperCase();
}

/** Matchs à élimination directe où la nation de l'utilisateur joue, dans l'ordre du tournoi. */
export function buildCountryPath(fixtures: GamesFixture[], userCountryCode: string): CountryPathStep[] {
  if (!userCountryCode.trim()) return [];

  const steps: CountryPathStep[] = [];
  const sorted = [...fixtures].sort((a, b) => a.kickoffMs - b.kickoffMs);

  for (const fx of sorted) {
    const round = roundKeyFromPhase(fx.phase);
    if (!round || round === 'third') continue;

    const isHome = codesMatch(fx.homeCode, userCountryCode);
    const isAway = codesMatch(fx.awayCode, userCountryCode);
    if (!isHome && !isAway) continue;

    steps.push({
      fixture: fx,
      round,
      roundLabel: ROUND_LABELS[round],
      myTeam: isHome ? { code: fx.homeCode, name: fx.homeName } : { code: fx.awayCode, name: fx.awayName },
      opponent: isHome ? { code: fx.awayCode, name: fx.awayName } : { code: fx.homeCode, name: fx.homeName },
    });
  }

  return steps;
}

export function pathPickForStep(
  predictions: BracketPrediction[],
  step: CountryPathStep,
): BracketPrediction | undefined {
  return getPrediction(predictions, step.fixture.id);
}

/** L'utilisateur a-t-il prédit la victoire de sa nation à cette étape ? */
export function isStepWon(predictions: BracketPrediction[], step: CountryPathStep): boolean {
  const pick = pathPickForStep(predictions, step);
  return pick != null && codesMatch(pick.predictedWinnerCode, step.myTeam.code);
}

/** L'utilisateur a-t-il prédit une élimination à cette étape ? */
export function isStepLost(predictions: BracketPrediction[], step: CountryPathStep): boolean {
  const pick = pathPickForStep(predictions, step);
  return pick != null && !codesMatch(pick.predictedWinnerCode, step.myTeam.code);
}

/** Index de la première défaite prédite, ou -1 si toujours en course. */
export function firstLossIndex(path: CountryPathStep[], predictions: BracketPrediction[]): number {
  return path.findIndex((step) => isStepLost(predictions, step));
}

export function pathProgress(path: CountryPathStep[], predictions: BracketPrediction[]): number {
  const lossAt = firstLossIndex(path, predictions);
  const limit = lossAt >= 0 ? lossAt : path.length;
  let n = 0;
  for (let i = 0; i < limit; i++) {
    if (isStepWon(predictions, path[i])) n++;
    else break;
  }
  return n;
}

export function isPathComplete(path: CountryPathStep[], predictions: BracketPrediction[]): boolean {
  if (!path.length) return false;
  const lossAt = firstLossIndex(path, predictions);
  if (lossAt >= 0) return true;
  return path.every((step) => isStepWon(predictions, step));
}

export function predictedChampion(
  path: CountryPathStep[],
  predictions: BracketPrediction[],
): BracketTeam | null {
  const finalStep = path.find((s) => s.round === 'final');
  if (!finalStep || !isStepWon(predictions, finalStep)) return null;
  return finalStep.myTeam;
}

/** Nombre d'étapes du parcours avec un prono enregistré. */
export function pathPicksAnswered(path: CountryPathStep[], predictions: BracketPrediction[]): number {
  return path.filter((step) => pathPickForStep(predictions, step)).length;
}
