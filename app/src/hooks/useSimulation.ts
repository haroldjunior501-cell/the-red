import { useCallback, useEffect, useRef, useState } from 'react';
import { nationColor } from '../constants/hubGlobe';
import { SIMULATION_MATCH_ID } from '../constants/simulation';
import type { ParsedLiveScore } from '../services/livescoreApi';
import {
  buildSimHeatFeatures,
  cleanSimulationData,
  createSimTickMessage,
  estimateCrowdStats,
  type SimConfig,
} from '../services/simulationService';
import type { WorldChatMessage } from '../services/hubRtdbService';
import { usePlanetEventStore } from '../store/planetEventStore';

type SimStats = {
  messagesPerMinute: number;
  reactionsPerSecond: number;
  activeUsers: number;
};

type TriggerEventType = 'red_card' | 'chaos';

type TriggerPayload = {
  country?: string;
  playerName?: string;
  playerId?: string;
  forHome?: boolean;
  isCentury?: boolean;
};

export type SimulationVisualBridge = {
  pushMessage: (message: WorldChatMessage) => void;
  sendToMap: (payload: Record<string, unknown>) => void;
};

export function useSimulation(
  matchId: string | null,
  live: ParsedLiveScore | null,
  autoStart = false,
  bridge?: SimulationVisualBridge | null
) {
  const [config, setConfig] = useState<SimConfig>({
    totalUsers: 500_000,
    speed: 2,
    matchMinute: live?.minute ?? 1,
    homeScore: live?.home.score ?? 0,
    awayScore: live?.away.score ?? 0,
  });
  const [isActive, setIsActive] = useState(
    () => autoStart && typeof __DEV__ !== 'undefined' && __DEV__
  );
  const [stats, setStats] = useState<SimStats>({
    messagesPerMinute: 0,
    reactionsPerSecond: 0,
    activeUsers: 500_000,
  });
  const tickCount = useRef(0);
  const activityByCountry = useRef<Record<string, number>>({});
  const bridgeRef = useRef(bridge);
  bridgeRef.current = bridge;

  useEffect(() => {
    if (!live) return;
    setConfig((current) => ({
      ...current,
      matchMinute: live.minute,
      homeScore: live.home.score,
      awayScore: live.away.score,
    }));
  }, [live]);

  useEffect(() => {
    if (typeof __DEV__ === 'undefined' || !__DEV__ || !isActive) return undefined;
    const timer = setInterval(() => {
      setConfig((current) => ({
        ...current,
        matchMinute: Math.min(90, current.matchMinute + 1),
      }));
    }, 3000 / config.speed);
    return () => clearInterval(timer);
  }, [config.speed, isActive]);

  useEffect(() => {
    if (typeof __DEV__ === 'undefined' || !__DEV__ || !isActive) return undefined;
    const timer = setInterval(() => {
      tickCount.current += 1;
      const message = createSimTickMessage(tickCount.current);
      const country = message.country.toUpperCase();
      activityByCountry.current[country] = (activityByCountry.current[country] ?? 0) + 1;

      bridgeRef.current?.pushMessage(message);
      bridgeRef.current?.sendToMap({
        type: 'NATION_PULSE',
        country,
        color: message.countryColor,
        intensity: 0.4 + Math.random() * 0.4,
      });

      if (tickCount.current % 5 === 0) {
        bridgeRef.current?.sendToMap({
          type: 'UPDATE_HEATMAP',
          geojson: {
            type: 'FeatureCollection',
            features: buildSimHeatFeatures(activityByCountry.current),
          },
        });
      }
    }, 1200 / config.speed);
    return () => clearInterval(timer);
  }, [config.speed, isActive]);

  useEffect(() => {
    if (typeof __DEV__ === 'undefined' || !__DEV__ || !isActive) return undefined;
    const timer = setInterval(() => {
      setStats(estimateCrowdStats(config.speed));
    }, 800);
    return () => clearInterval(timer);
  }, [config.speed, isActive]);

  useEffect(() => {
    if (!isActive || !matchId) return undefined;
    return () => {
      void cleanSimulationData(matchId);
    };
  }, [isActive, matchId]);

  const triggerSimEvent = useCallback(
    (type: TriggerEventType, payload?: TriggerPayload) => {
      if (typeof __DEV__ === 'undefined' || !__DEV__ || !live || !matchId) return;
      const enqueue = usePlanetEventStore.getState().enqueueEvent;
      const minute = config.matchMinute;

      if (type === 'red_card') {
        enqueue({
          type: 'RED_CARD',
          country: payload?.country ?? live.away.code,
          countryColor: nationColor(payload?.country ?? live.away.code),
          playerName: payload?.playerName ?? 'Joueur',
          minute,
        });
        return;
      }

      usePlanetEventStore.getState().activateChaosMode();
      enqueue({ type: 'CHAOS', minute });
    },
    [config.matchMinute, live, matchId]
  );

  const cleanSimData = useCallback(async () => {
    if (!matchId) return;
    await cleanSimulationData(matchId);
  }, [matchId]);

  return {
    config,
    setConfig,
    isActive,
    setIsActive,
    stats,
    triggerSimEvent,
    cleanSimData,
    simulationMatchId: SIMULATION_MATCH_ID,
  };
}
