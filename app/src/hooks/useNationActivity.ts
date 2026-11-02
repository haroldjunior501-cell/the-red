import { useEffect, useState } from 'react';
import { COUNTRY_CENTROIDS, NATION_COLORS } from '../constants/hubGlobe';
import { subscribeNations, type NationActivityRow } from '../services/hubRtdbService';
import type { HeatFeature } from '../types/heatmap';

export type { HeatFeature } from '../types/heatmap';

export function useNationActivity(onHeatmap: (features: HeatFeature[]) => void, enabled = true) {
  const [activityByCountry, setActivityByCountry] = useState<Record<string, NationActivityRow>>({});

  useEffect(() => {
    if (!enabled) {
      setActivityByCountry({});
      return undefined;
    }
    const unsub = subscribeNations(setActivityByCountry);
    return unsub;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const build = () => {
      const features: HeatFeature[] = Object.entries(activityByCountry).map(([code, row]) => {
        const coords = COUNTRY_CENTROIDS[code] ?? [0, 0];
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [coords[0], coords[1]] },
          properties: {
            country: code,
            intensity: Math.min(1, (row.recentActivity ?? 0) / 100),
            countryColor: NATION_COLORS[code] ?? '#2979ff',
          },
        };
      });
      onHeatmap(features);
    };
    build();
    const id = setInterval(build, 10_000);
    return () => clearInterval(id);
  }, [activityByCountry, enabled, onHeatmap]);

  return { activityByCountry };
}
