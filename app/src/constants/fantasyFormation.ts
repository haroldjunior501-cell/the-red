import type { FantasyPosition } from '../types/games.types';

export type PitchSlotId =
  | 'GK'
  | 'DEF1'
  | 'DEF2'
  | 'DEF3'
  | 'DEF4'
  | 'MID1'
  | 'MID2'
  | 'MID3'
  | 'ATT1'
  | 'ATT2'
  | 'ATT3';

export type PitchSlotDef = {
  id: PitchSlotId;
  position: FantasyPosition;
  /** Position % sur le terrain (0–100). */
  x: number;
  y: number;
};

export const FORMATION_433_SLOTS: readonly PitchSlotDef[] = [
  { id: 'GK', position: 'GK', x: 50, y: 90 },
  { id: 'DEF1', position: 'DEF', x: 15, y: 72 },
  { id: 'DEF2', position: 'DEF', x: 38, y: 76 },
  { id: 'DEF3', position: 'DEF', x: 62, y: 76 },
  { id: 'DEF4', position: 'DEF', x: 85, y: 72 },
  { id: 'MID1', position: 'MID', x: 22, y: 52 },
  { id: 'MID2', position: 'MID', x: 50, y: 48 },
  { id: 'MID3', position: 'MID', x: 78, y: 52 },
  { id: 'ATT1', position: 'ATT', x: 20, y: 22 },
  { id: 'ATT2', position: 'ATT', x: 50, y: 16 },
  { id: 'ATT3', position: 'ATT', x: 80, y: 22 },
] as const;

export const FANTASY_PHASES = [
  { key: 'md1', label: 'Journée 1' },
  { key: 'md2', label: 'Journée 2' },
  { key: 'md3', label: 'Journée 3' },
  { key: 'r16', label: '1/8' },
  { key: 'qf', label: '1/4' },
  { key: 'sf', label: 'Demi' },
  { key: 'final', label: 'Finale' },
] as const;

export type FantasyPhaseKey = (typeof FANTASY_PHASES)[number]['key'];
