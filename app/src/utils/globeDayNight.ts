import { COUNTRY_GLOBE_VIEW, resolveGlobeCountryKey } from '../data/countryGlobeCoordinates';
import { utcOffsetForCountry } from '../data/countryGlobeTimezones';

export type CountryGlobeLightState = {
  code: string;
  intensity: number;
  isNight: boolean;
  hasLiveMatch: boolean;
  isCelebrating: boolean;
};

function localHour(utcOffset: number, now = new Date()): number {
  const utc = now.getUTCHours() + now.getUTCMinutes() / 60;
  return (utc + utcOffset + 24) % 24;
}

export function isNightTime(utcOffset: number, now = new Date()): boolean {
  const h = localHour(utcOffset, now);
  return h < 6 || h >= 22;
}

export function getLightIntensity(utcOffset: number, now = new Date()): number {
  const h = localHour(utcOffset, now);
  if (h >= 10 && h < 18) return 1;
  if (h >= 8 && h < 10) return 0.72;
  if (h >= 18 && h < 21) return 0.5;
  if (h >= 6 && h < 8) return 0.4;
  if (h >= 21 && h < 23) return 0.22;
  return 0.1;
}

export function buildCountryGlobeStates(opts: {
  liveCountries: string[];
  celebratingCountries: string[];
  now?: Date;
}): CountryGlobeLightState[] {
  const now = opts.now ?? new Date();
  const liveSet = new Set(opts.liveCountries.map((c) => resolveGlobeCountryKey(c)));
  const celebSet = new Set(opts.celebratingCountries.map((c) => resolveGlobeCountryKey(c)));

  return Object.keys(COUNTRY_GLOBE_VIEW).map((code) => {
    const offset = utcOffsetForCountry(code);
    return {
      code,
      intensity: getLightIntensity(offset, now),
      isNight: isNightTime(offset, now),
      hasLiveMatch: liveSet.has(code),
      isCelebrating: celebSet.has(code),
    };
  });
}

export type NightGlobeFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: { code: string; opacity: number; intensity: number };
};

export function buildNightGlobeFeatures(states: CountryGlobeLightState[]): NightGlobeFeature[] {
  return states
    .filter((s) => s.isNight && !s.hasLiveMatch && !s.isCelebrating)
    .map((s) => {
      const view = COUNTRY_GLOBE_VIEW[s.code];
      const opacity = Math.max(0.15, 0.75 - s.intensity);
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [view?.lng ?? 0, view?.lat ?? 0] as [number, number],
        },
        properties: { code: s.code, opacity, intensity: s.intensity },
      };
    });
}
