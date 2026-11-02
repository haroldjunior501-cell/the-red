import { GOALYA_LAUNCH_MS, WC_2026_KICKOFF_MS } from './cupDates';

export { GOALYA_LAUNCH_MS };

export const WC_2026_FIRST_MATCH_LABEL = '11 juin 2026';
export const WC_2026_LAUNCH_LABEL = '3 juin 2026';

export function isWorldCupStarted(): boolean {
  return Date.now() >= WC_2026_KICKOFF_MS;
}

export function daysUntilWorldCup(): number {
  const ms = WC_2026_KICKOFF_MS - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
