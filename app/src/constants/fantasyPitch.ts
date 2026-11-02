import { COLORS } from './colors';
import type { FantasyBenchSlotKey, FantasyListPosition, FantasySlotKey } from '../types/fantasy.types';

export const FORMATION_LABEL = '4-3-3';

export const FANTASY_PHASE_TABS = [
  { key: 'j1', label: '1re journée' },
  { key: 'j2', label: '2e journée' },
  { key: 'transfer', label: 'Transferts' },
  { key: 'final', label: 'Finale' },
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
    badgeBg: 'rgba(255,82,82,0.15)',
    badgeBorder: 'rgba(255,82,82,0.3)',
    badgeColor: '#ff6b6b',
  },
  MID: {
    title: 'MILIEUX',
    badge: 'MIL',
    badgeBg: 'rgba(41,121,255,0.15)',
    badgeBorder: 'rgba(41,121,255,0.3)',
    badgeColor: COLORS.primaryLight,
  },
  DEF: {
    title: 'DÉFENSEURS',
    badge: 'DEF',
    badgeBg: 'rgba(0,230,118,0.12)',
    badgeBorder: 'rgba(0,230,118,0.25)',
    badgeColor: '#00e676',
  },
  GK: {
    title: 'GARDIENS',
    badge: 'GK',
    badgeBg: 'rgba(240,180,41,0.12)',
    badgeBorder: 'rgba(240,180,41,0.25)',
    badgeColor: '#f0b429',
  },
};
