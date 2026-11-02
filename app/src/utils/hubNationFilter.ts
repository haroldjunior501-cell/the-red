import { resolveGlobeCountryKey } from '../data/countryGlobeCoordinates';
import type { ActiveSupporter } from '../services/hubRtdbService';
import type { HeatFeature } from '../types/heatmap';
import type { WorldChatMessage } from '../services/hubRtdbService';

export function isSameNation(a: string, b: string): boolean {
  if (!a || !b) return false;
  return resolveGlobeCountryKey(a) === resolveGlobeCountryKey(b);
}

export function filterSupportersByNation(
  supporters: ActiveSupporter[],
  nationCode: string
): ActiveSupporter[] {
  return supporters.filter((s) => isSameNation(s.country, nationCode));
}

export function filterHeatByNation(features: HeatFeature[], nationCode: string): HeatFeature[] {
  const key = resolveGlobeCountryKey(nationCode);
  return features.filter((f) => {
    const c = f.properties.country;
    return c ? isSameNation(c, key) : false;
  });
}

export function filterChatByNation(messages: WorldChatMessage[], nationCode: string): WorldChatMessage[] {
  return messages.filter((m) => isSameNation(m.country, nationCode));
}
