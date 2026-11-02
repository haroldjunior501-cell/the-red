import { WC_2026_KICKOFF_MS } from '../constants/simulator';

export function getCountdownParts(now = Date.now()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  started: boolean;
} {
  const diff = WC_2026_KICKOFF_MS - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    started: false,
  };
}
