import { useEffect, useRef, useState } from 'react';
import type { HubGlobeHandle } from '../screens/HubScreen/components/HubGlobeView';
import { usePlanetEventStore } from '../store/planetEventStore';
import type { PlanetEvent, PlanetEventType } from '../types/planetEvents';

export type ParticleSpec = {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  dx: number;
  dy: number;
  duration: number;
};

export type OverlayMode = 'none' | 'flash' | 'eclipse' | 'penalty' | 'aurora' | 'chaos';

const EVENT_DURATION_MS: Record<PlanetEventType, number> = {
  GOAL: 3000,
  PENALTY: 3500,
  PENALTY_MISSED: 2500,
  RED_CARD: 2500,
  HISTORIC: 4000,
  CHAOS: 3500,
  CHAIN: 2500,
};

function spawnParticles(count: number, color: string, width: number, height: number): ParticleSpec[] {
  const particles: ParticleSpec[] = [];
  for (let i = 0; i < count; i += 1) {
    particles.push({
      id: `p-${Date.now()}-${i}`,
      x: width * 0.35 + Math.random() * width * 0.3,
      y: height * 0.55 + Math.random() * height * 0.2,
      color: Math.random() > 0.35 ? color : '#FFFFFF',
      size: 2 + Math.random() * 4,
      dx: (Math.random() - 0.5) * 80,
      dy: -40 - Math.random() * 80,
      duration: 800 + Math.random() * 1200,
    });
  }
  return particles;
}

export function usePlanetEffects(mapRef: React.RefObject<HubGlobeHandle | null>, layout: { width: number; height: number }) {
  const activeEvent = usePlanetEventStore((s) => s.activeEvent);
  const isChaosMode = usePlanetEventStore((s) => s.isChaosMode);
  const weatherMood = usePlanetEventStore((s) => s.weatherMood);
  const clearActiveEvent = usePlanetEventStore((s) => s.clearActiveEvent);

  const [overlay, setOverlay] = useState<OverlayMode>('none');
  const [particles, setParticles] = useState<ParticleSpec[]>([]);
  const [globeGlow, setGlobeGlow] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mapRef.current?.postToMap({ type: 'WEATHER_MOOD', mood: weatherMood });
  }, [mapRef, weatherMood]);

  useEffect(() => {
    mapRef.current?.postToMap({ type: 'CHAOS_MODE', active: isChaosMode });
  }, [isChaosMode, mapRef]);

  useEffect(() => {
    if (!activeEvent) return undefined;
    const { width, height } = layout;
    mapRef.current?.postToMap({ type: 'PLANET_EVENT', event: activeEvent });

    if (timerRef.current) clearTimeout(timerRef.current);

    if (activeEvent.type === 'GOAL') {
      setOverlay('flash');
      setParticles(spawnParticles(50, activeEvent.countryColor ?? '#2979ff', width, height));
      setGlobeGlow(activeEvent.countryColor ?? '#2979ff');
    } else if (activeEvent.type === 'PENALTY') {
      setOverlay('penalty');
    } else if (activeEvent.type === 'RED_CARD') {
      setOverlay('eclipse');
      setTimeout(() => {
        setOverlay('flash');
        setParticles(spawnParticles(20, '#FF3B30', width, height));
      }, 1500);
    } else if (activeEvent.type === 'HISTORIC') {
      setOverlay('aurora');
      setParticles(spawnParticles(80, '#FFD700', width, height));
      setGlobeGlow('#FFD700');
    } else if (activeEvent.type === 'CHAIN') {
      mapRef.current?.postToMap({ type: 'REACTION_WAVE', countries: activeEvent.countries, emoji: activeEvent.emoji });
    } else if (activeEvent.type === 'CHAOS') {
      setOverlay('chaos');
    }

    timerRef.current = setTimeout(() => {
      setOverlay('none');
      setParticles([]);
      setGlobeGlow(null);
      clearActiveEvent();
    }, EVENT_DURATION_MS[activeEvent.type]);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeEvent, clearActiveEvent, layout, mapRef]);

  return { overlay, particles, globeGlow };
}
