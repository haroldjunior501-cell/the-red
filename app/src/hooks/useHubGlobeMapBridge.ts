import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { HubGlobeHandle } from '../screens/HubScreen/components/HubGlobeView';
import { usePlanetEventStore } from '../store/planetEventStore';
import type { CountryGlobeLightState } from '../utils/globeDayNight';
import { buildNightGlobeFeatures } from '../utils/globeDayNight';

type Args = {
  mapRef: RefObject<HubGlobeHandle | null>;
  countryStates: CountryGlobeLightState[];
  liveCountries: string[];
  celebratingCountries: string[];
};

/** Envoie météo, chaos, événements planète, jour/nuit et LIVE vers la WebView Mapbox. */
export function useHubGlobeMapBridge({
  mapRef,
  countryStates,
  liveCountries,
  celebratingCountries,
}: Args) {
  const activeEvent = usePlanetEventStore((s) => s.activeEvent);
  const isChaosMode = usePlanetEventStore((s) => s.isChaosMode);
  const weatherMood = usePlanetEventStore((s) => s.weatherMood);

  useEffect(() => {
    mapRef.current?.postToMap({ type: 'WEATHER_MOOD', mood: weatherMood });
  }, [mapRef, weatherMood]);

  useEffect(() => {
    mapRef.current?.postToMap({ type: 'CHAOS_MODE', active: isChaosMode });
  }, [isChaosMode, mapRef]);

  useEffect(() => {
    if (!activeEvent) return;
    mapRef.current?.postToMap({ type: 'PLANET_EVENT', event: activeEvent });
    if (activeEvent.type === 'GOAL' && activeEvent.country) {
      mapRef.current?.postToMap({
        type: 'CELEBRATION_START',
        country: activeEvent.country,
        color: activeEvent.countryColor,
      });
    }
  }, [activeEvent, mapRef]);

  useEffect(() => {
    const nightFeatures = buildNightGlobeFeatures(countryStates);
    mapRef.current?.postToMap({
      type: 'UPDATE_DAY_NIGHT',
      nightFeatures,
      countryStates,
    });
  }, [countryStates, mapRef]);

  useEffect(() => {
    mapRef.current?.postToMap({
      type: 'UPDATE_LIVE_MATCHES',
      countries: liveCountries,
      celebrating: celebratingCountries,
    });
  }, [celebratingCountries, liveCountries, mapRef]);
}
