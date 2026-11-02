import { GOALYA_LAUNCH_MS, WC_2026_KICKOFF_MS } from './cupDates';

function envTruthy(key: string | undefined): boolean {
  const v = key?.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

/** Build de test / pré-lancement : débloque Arena, Tableau KO local, etc. */
export function isLaunchModeEnabled(): boolean {
  return envTruthy(process.env.EXPO_PUBLIC_LAUNCH_MODE);
}

/** Accès à l’écran Arena (équipe, classements, inscription serveur). */
export function isArenaUnlocked(): boolean {
  return isLaunchModeEnabled() || Date.now() >= GOALYA_LAUNCH_MS;
}

/** Matchs live Simulator (points sur vrais matchs CdM). */
export function isCupStartedForSimulator(): boolean {
  if (isLaunchModeEnabled()) return true;
  if (envTruthy(process.env.EXPO_PUBLIC_SIMULATOR_FORCE_LIVE)) return true;
  return Date.now() >= WC_2026_KICKOFF_MS;
}

/** @deprecated Préférer isCupStartedForSimulator / isArenaUnlocked. */
export function isCupStarted(): boolean {
  return isCupStartedForSimulator();
}
