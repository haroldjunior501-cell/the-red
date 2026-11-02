import { SIMULATOR_POINTS } from './constants.js';
import type { ParsedApiMatchEvent } from './eventParser.js';

export type ScorableEventType =
  | 'goal'
  | 'assist'
  | 'yellow'
  | 'red'
  | 'own_goal'
  | 'clean_sheet'
  | 'motm';

export function mapApiEventType(raw: string): ScorableEventType | null {
  const t = raw.toLowerCase();
  if (t.includes('own') && t.includes('goal')) return 'own_goal';
  if (t.includes('goal') || t === 'g') return 'goal';
  if (t.includes('assist') || t.includes('pass_dec')) return 'assist';
  if (t.includes('yellow') || t === 'yc') return 'yellow';
  if (t.includes('red') || t === 'rc') return 'red';
  if (t.includes('clean')) return 'clean_sheet';
  if (t.includes('motm') || t.includes('man_of')) return 'motm';
  return null;
}

export function pointsForEvent(
  type: ScorableEventType,
  position?: 'GK' | 'DEF' | 'MID' | 'ATT',
  isCaptain = false
): number {
  let base = 0;
  switch (type) {
    case 'goal':
      base = SIMULATOR_POINTS.goal;
      break;
    case 'assist':
      base = SIMULATOR_POINTS.assist;
      break;
    case 'yellow':
      base = SIMULATOR_POINTS.yellow_card;
      break;
    case 'red':
      base = SIMULATOR_POINTS.red_card;
      break;
    case 'own_goal':
      base = SIMULATOR_POINTS.own_goal;
      break;
    case 'clean_sheet':
      base =
        position === 'GK' ? SIMULATOR_POINTS.clean_sheet_gk : SIMULATOR_POINTS.clean_sheet_def;
      break;
    case 'motm':
      base = SIMULATOR_POINTS.motm;
      break;
    default:
      base = 0;
  }
  if (isCaptain && base > 0) return base * 2;
  return base;
}

export function eventIdForMatch(matchId: string, apiEvent: ParsedApiMatchEvent): string {
  return `${matchId}_${apiEvent.id}`;
}
