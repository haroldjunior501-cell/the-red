import type { BracketPrediction } from '../types/games.types';
import type { GamesFixture } from '../types/games.types';
import type { BracketRoundKey, BracketRounds } from './tableauBracket';
import { getPrediction, padRoundSlots, roundKeyFromPhase } from './tableauBracket';

export type BracketTeam = { code: string; name: string };

export type DisplayBracketMatch = {
  fixtureId: string;
  round: BracketRoundKey;
  team1: BracketTeam | null;
  team2: BracketTeam | null;
  kickoffMs: number;
  phase: string;
};

const ROUND_ORDER: BracketRoundKey[] = ['r16', 'quarter', 'semi', 'final', 'third'];

function team(code: string, name: string): BracketTeam {
  return { code, name };
}

function winnerTeam(
  predictions: BracketPrediction[],
  fixtureId: string,
  fallbackHome: BracketTeam,
  fallbackAway: BracketTeam,
): BracketTeam | null {
  const pick = getPrediction(predictions, fixtureId);
  if (!pick) return null;
  if (pick.predictedWinnerCode === fallbackHome.code) return fallbackHome;
  if (pick.predictedWinnerCode === fallbackAway.code) return fallbackAway;
  return team(pick.predictedWinnerCode, pick.predictedWinner);
}

function buildR16(
  slots: (GamesFixture | null)[],
  predictions: BracketPrediction[],
): DisplayBracketMatch[] {
  return slots.map((fx) => {
    if (!fx) {
      return {
        fixtureId: '',
        round: 'r16' as const,
        team1: null,
        team2: null,
        kickoffMs: 0,
        phase: 'Huitièmes',
      };
    }
    return {
      fixtureId: fx.id,
      round: 'r16',
      team1: team(fx.homeCode, fx.homeName),
      team2: team(fx.awayCode, fx.awayName),
      kickoffMs: fx.kickoffMs,
      phase: fx.phase,
    };
  });
}

function buildFromFeeders(
  fixtures: (GamesFixture | null)[],
  feeders: DisplayBracketMatch[],
  round: BracketRoundKey,
  predictions: BracketPrediction[],
): DisplayBracketMatch[] {
  return fixtures.map((fx, idx) => {
    const f1 = feeders[idx * 2];
    const f2 = feeders[idx * 2 + 1];
    const t1 =
      f1 && f1.team1 && f1.team2
        ? winnerTeam(predictions, f1.fixtureId, f1.team1, f1.team2)
        : null;
    const t2 =
      f2 && f2.team1 && f2.team2
        ? winnerTeam(predictions, f2.fixtureId, f2.team1, f2.team2)
        : null;

    if (!fx) {
      return { fixtureId: '', round, team1: t1, team2: t2, kickoffMs: 0, phase: round };
    }
    return {
      fixtureId: fx.id,
      round,
      team1: t1,
      team2: t2,
      kickoffMs: fx.kickoffMs,
      phase: fx.phase,
    };
  });
}

export function buildDisplayBracket(
  rounds: BracketRounds,
  predictions: BracketPrediction[],
): {
  r16: DisplayBracketMatch[];
  quarter: DisplayBracketMatch[];
  semi: DisplayBracketMatch[];
  final: DisplayBracketMatch | null;
  third: DisplayBracketMatch | null;
} {
  const r16 = buildR16(padRoundSlots(rounds.r16, 8), predictions);
  const quarter = buildFromFeeders(padRoundSlots(rounds.quarter, 4), r16, 'quarter', predictions);
  const semi = buildFromFeeders(padRoundSlots(rounds.semi, 2), quarter, 'semi', predictions);
  const finalFx = rounds.final[0] ?? null;
  const thirdFx = rounds.third[0] ?? null;

  const finalMatches = buildFromFeeders(finalFx ? [finalFx] : [null], semi, 'final', predictions);
  const thirdMatches = buildFromFeeders(thirdFx ? [thirdFx] : [null], semi, 'third', predictions);

  return {
    r16,
    quarter,
    semi,
    final: finalMatches[0] ?? null,
    third: thirdMatches[0] ?? null,
  };
}

export function clearDownstreamPredictions(
  predictions: BracketPrediction[],
  matchId: string,
  rounds: BracketRounds,
): BracketPrediction[] {
  let roundKey: BracketRoundKey | null = null;
  for (const fx of [...rounds.r16, ...rounds.quarter, ...rounds.semi, ...rounds.final, ...rounds.third]) {
    if (fx.id === matchId) {
      roundKey = roundKeyFromPhase(fx.phase);
      break;
    }
  }
  if (!roundKey) return predictions;
  const idx = ROUND_ORDER.indexOf(roundKey);
  if (idx < 0) return predictions;
  const laterIds = new Set(
    ROUND_ORDER.slice(idx + 1).flatMap((rk) => rounds[rk].map((f) => f.id)),
  );
  return predictions.filter((p) => p.matchId !== matchId && !laterIds.has(p.matchId));
}

export function championTeam(
  display: ReturnType<typeof buildDisplayBracket>,
  predictions: BracketPrediction[],
): BracketTeam | null {
  const f = display.final;
  if (!f?.fixtureId || !f.team1 || !f.team2) return null;
  return winnerTeam(predictions, f.fixtureId, f.team1, f.team2);
}
