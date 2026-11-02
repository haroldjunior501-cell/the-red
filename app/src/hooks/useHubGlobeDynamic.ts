import { useEffect, useMemo, useState } from 'react';
import { usePlanetEventStore } from '../store/planetEventStore';
import type { ParsedLiveScore } from '../services/livescoreApi';
import { getLiveMatches, isFootballDataConfigured } from '../services/livescoreApi';
import { parseMatchList } from '../services/liveMatchParsers';
import { resolveGlobeCountryKey } from '../data/countryGlobeCoordinates';
import { buildCountryGlobeStates, type CountryGlobeLightState } from '../utils/globeDayNight';

const TICK_MS = 60_000;
const LIVE_POLL_MS = 45_000;

function countriesFromLive(live: ParsedLiveScore | null): string[] {
  if (!live?.isLive) return [];
  return [resolveGlobeCountryKey(live.home.code), resolveGlobeCountryKey(live.away.code)];
}

export function useHubGlobeDynamic(live: ParsedLiveScore | null, enabled: boolean) {
  const [liveCountries, setLiveCountries] = useState<string[]>(() => countriesFromLive(live));
  const [celebrating, setCelebrating] = useState<string[]>([]);
  const [tick, setTick] = useState(0);

  const activeEvent = usePlanetEventStore((s) => s.activeEvent);

  useEffect(() => {
    setLiveCountries(countriesFromLive(live));
  }, [live]);

  useEffect(() => {
    if (!enabled || !isFootballDataConfigured()) return undefined;

    const pull = async () => {
      try {
        const payload = await getLiveMatches();
        const matches = parseMatchList(payload);
        const codes = new Set<string>();
        matches.forEach((m) => {
          codes.add(resolveGlobeCountryKey(m.home_country_code));
          codes.add(resolveGlobeCountryKey(m.away_country_code));
        });
        if (codes.size > 0) setLiveCountries([...codes]);
      } catch {
        /* garde le match Hub courant */
      }
    };

    void pull();
    const id = setInterval(() => void pull(), LIVE_POLL_MS);
    return () => clearInterval(id);
  }, [enabled]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (activeEvent?.type !== 'GOAL' || !activeEvent.country) return;
    const code = resolveGlobeCountryKey(activeEvent.country);
    setCelebrating((prev) => (prev.includes(code) ? prev : [...prev, code]));
    const clear = setTimeout(() => {
      setCelebrating((prev) => prev.filter((c) => c !== code));
    }, 8000);
    return () => clearTimeout(clear);
  }, [activeEvent?.country, activeEvent?.id, activeEvent?.type]);

  const countryStates = useMemo((): CountryGlobeLightState[] => {
    void tick;
    return buildCountryGlobeStates({
      liveCountries,
      celebratingCountries: celebrating,
    });
  }, [celebrating, liveCountries, tick]);

  return { countryStates, liveCountries, celebratingCountries: celebrating };
}
