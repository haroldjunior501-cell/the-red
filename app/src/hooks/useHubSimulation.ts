import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isHubSimulationEnabled } from '../constants/hubSimulation';
import { triggerViralPingFeedback } from './useHubFeedback';
import type { HeatFeature } from './useNationActivity';
import type { LiveScoreStatus } from './useLiveScore';
import {
  buildSimulationHeatFeatures,
  createInitialSimulationMessages,
  createSimulationLiveScore,
  createSimulationSupporters,
  createSimulationUserMessage,
  nextSimulationMessage,
} from '../services/hubSimulation';
import type { ParsedLiveScore } from '../services/livescoreApi';
import type { ActiveSupporter, WorldChatMessage } from '../services/hubRtdbService';

type HubSimUser = {
  userId: string;
  username: string;
  rank: string;
  country: string;
};

export function useHubSimulation(user: HubSimUser, enabled: boolean = isHubSimulationEnabled()) {
  const [live, setLive] = useState<ParsedLiveScore>(() => createSimulationLiveScore());
  const [messages, setMessages] = useState<WorldChatMessage[]>(() => createInitialSimulationMessages());
  const [supporters, setSupporters] = useState<ActiveSupporter[]>(() => createSimulationSupporters());
  const messageIndex = useRef(messages.length);
  const userMessageIndex = useRef(0);

  const status: LiveScoreStatus = enabled ? 'ready' : 'empty';
  const heatFeatures = useMemo<HeatFeature[]>(() => buildSimulationHeatFeatures(messages), [messages]);

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => {
      setLive((prev) => {
        if (!prev) return prev;
        const minute = Math.min(94, prev.minute + 1);
        const homeScore = minute === 82 ? prev.home.score + 1 : prev.home.score;
        const possessionHome = minute === 85 ? 61 : minute === 88 ? 59 : prev.possession.home;
        const possessionAway = 100 - possessionHome;
        const shotsHome = minute % 4 === 0 ? prev.shots.home + 1 : prev.shots.home;
        const xgHome = minute === 82 ? prev.xg.home + 0.3 : prev.xg.home;
        return {
          ...prev,
          minute,
          home: { ...prev.home, score: homeScore },
          possession: { home: possessionHome, away: possessionAway },
          shots: { home: shotsHome, away: prev.shots.away },
          xg: { home: xgHome, away: prev.xg.away },
        };
      });
    }, 6_000);
    return () => clearInterval(id);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => {
      const next = nextSimulationMessage(messageIndex.current, Date.now());
      messageIndex.current += 1;
      setMessages((prev) => [...prev, next].slice(-200));
    }, 5_500);
    return () => clearInterval(id);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => {
      setSupporters(createSimulationSupporters());
    }, 25_000);
    return () => clearInterval(id);
  }, [enabled]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!enabled || text.trim() === '') return;
      const next = createSimulationUserMessage(user, text, userMessageIndex.current);
      userMessageIndex.current += 1;
      setMessages((prev) => [...prev, next].slice(-200));
      void triggerViralPingFeedback();
    },
    [enabled, user]
  );

  return {
    enabled,
    status,
    live: enabled ? live : null,
    upcoming: null,
    errorMessage: null,
    matchId: enabled ? live.matchId : null,
    messages: enabled ? messages : [],
    supporters: enabled ? supporters : [],
    heatFeatures: enabled ? heatFeatures : [],
    sendMessage,
    isConnected: enabled,
  };
}
