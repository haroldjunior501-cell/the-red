import { COLORS } from './colors';
import type { FantasyBenchSlotKey, FantasyListPosition, FantasySlotKey } from '../types/fantasy.types';

export const FORMATION_LABEL = '4-3-3';

export const FANTASY_PHASE_TABS = [
  { key: 'xi', label: 'Mon XI' },
  { key: 'bench', label: 'Banc' },
  { key: 'transfer', label: 'Ajustements' },
] as const;

export type FantasyPhaseTabKey = (typeof FANTASY_PHASE_TABS)[number]['key'];

/** Ordre d’affichage sur le terrain (haut → bas). */
export const PITCH_ROWS: { position: FantasyListPosition; slots: FantasySlotKey[] }[] = [
  { position: 'ATT', slots: ['ATT_0', 'ATT_1', 'ATT_2'] },
  { position: 'MID', slots: ['MID_0', 'MID_1', 'MID_2'] },
  { position: 'DEF', slots: ['DEF_0', 'DEF_1', 'DEF_2', 'DEF_3'] },
  { position: 'GK', slots: ['GK_0'] },
];

export const ALL_SLOT_KEYS: FantasySlotKey[] = PITCH_ROWS.flatMap((r) => r.slots);

/** Nombre de remplaçants sur le banc Fantasy */
export const BENCH_SIZE = 12;

export const BENCH_SLOT_KEYS: FantasyBenchSlotKey[] = Array.from(
  { length: BENCH_SIZE },
  (_, i) => `BENCH_${i}` as FantasyBenchSlotKey
);

export const POSITION_LABEL: Record<FantasyListPosition, string> = {
  ATT: 'ATT',
  MID: 'MIL',
  DEF: 'DEF',
  GK: 'GK',
};

export const LIST_POSITION_CONFIG: Record<
  FantasyListPosition,
  { title: string; badge: string; badgeBg: string; badgeBorder: string; badgeColor: string }
> = {
  ATT: {
    title: 'ATTAQUANTS',
    badge: 'ATT',
    badgeBg: 'rgba(218,41,28,0.18)',
    badgeBorder: 'rgba(218,41,28,0.4)',
    badgeColor: COLORS.primaryLight,
  },
  MID: {
    title: 'MILIEUX',
    badge: 'MIL',
    badgeBg: 'rgba(251,225,34,0.12)',
    badgeBorder: 'rgba(251,225,34,0.35)',
    badgeColor: COLORS.gold,
  },
  DEF: {
    title: 'DÉFENSEURS',
    badge: 'DEF',
    badgeBg: 'rgba(16,185,129,0.12)',
    badgeBorder: 'rgba(16,185,129,0.3)',
    badgeColor: '#34d399',
  },
  GK: {
    title: 'GARDIENS',
    badge: 'GK',
    badgeBg: 'rgba(255,255,255,0.08)',
    badgeBorder: 'rgba(255,255,255,0.22)',
    badgeColor: '#f8fafc',
  },
};
