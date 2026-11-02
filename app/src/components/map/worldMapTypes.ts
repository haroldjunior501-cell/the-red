import type { SupporterOnline } from '../../services/mapService';

export type WorldMapProps = {
  width: number;
  height: number;
  /** 0 = monde, 1 = région, 2 = position perso — transitions `flyTo` côté Mapbox GL. */
  zoomTier?: 0 | 1 | 2;
  supportersOnline?: SupporterOnline[];
  meSupporter?: SupporterOnline | null;
  onSupporterPress?: (s: SupporterOnline) => void;
  mePreviewImageUri?: string;
  meDisplayName?: string;
  meSkinColor?: string;
  flagForCountry?: (code: string) => string;
};
