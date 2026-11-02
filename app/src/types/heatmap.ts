export type HeatFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: { country?: string; intensity: number; countryColor: string };
};
