import type { PronoPhaseKey } from '../types/pronos.types';

export type PronoPhaseDef = {
  key: PronoPhaseKey;
  label: string;
  /** Sous-titre optionnel (ex. numéro de journée). */
  subtitle?: string;
};

export const KNOCKOUT_PRONO_PHASES: readonly PronoPhaseDef[] = [
  { key: 'r16', label: '1/8 Finale' },
  { key: 'qf', label: '1/4 Finale' },
  { key: 'sf', label: 'Demi' },
  { key: 'final', label: 'Finale' },
] as const;

/** @deprecated Utiliser `buildPronoPhasesFromFixtures` — conservé pour compat. */
export const PRONO_PHASES: readonly PronoPhaseDef[] = [
  { key: 'opening', label: "Match d'ouverture" },
  ...KNOCKOUT_PRONO_PHASES,
] as const;
