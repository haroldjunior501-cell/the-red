import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { isHubSimulationEnabled } from '../constants/hubSimulation';
import { flagEmoji } from '../constants/mapHub';
import { useActiveSupporters } from './useActiveSupporters';
import { useFloatingMessages } from './useFloatingMessages';
import { useHubFeedback } from './useHubFeedback';
import { useHubSimulation } from './useHubSimulation';
import type { HeatFeature } from './useNationActivity';
import { useNationActivity } from './useNationActivity';
import { useLiveScore } from './useLiveScore';
import { usePlanetEvents } from './usePlanetEvents';
import { useReactionChain } from './useReactionChain';
import { useSimulation, type SimulationVisualBridge } from './useSimulation';
import { useWorldChat } from './useWorldChat';
import { soundService } from '../services/soundService';
import { useAppPreferencesStore } from '../store/useAppPreferencesStore';
import type { WorldChatMessage } from '../services/hubRtdbService';
import { useUserStore } from '../store/useUserStore';
import type { HubGlobeHandle } from '../screens/HubScreen/components/HubGlobeView';
import type { HubGlobeTab } from '../screens/HubScreen/components/GlobeTabs';
import { filterChatByNation, filterSupportersByNation } from '../utils/hubNationFilter';
import { useHubGlobeDynamic } from './useHubGlobeDynamic';
import { useHubGlobeMapBridge } from './useHubGlobeMapBridge';

function computeStrength(messages: WorldChatMessage[], home: string, away: string): { home: number; away: number } {
  const h = home.toUpperCase();
  const a = away.toUpperCase();
  const homeCount = messages.filter((m) => m.country.toUpperCase() === h).length;
  const awayCount = messages.filter((m) => m.country.toUpperCase() === a).length;
  const total = homeCount + awayCount || 1;
  return {
    home: Math.round((homeCount / total) * 100),
    away: Math.round((awayCount / total) * 100),
  };
}

export function useHubScreenCore(mapRef: RefObject<HubGlobeHandle | null>, globeTab: HubGlobeTab = 'monde') {
  const userId = useUserStore((st) => st.userId);
  const username = useUserStore((st) => st.name);
  const userCountry = useUserStore((st) => st.countryCode);
  const rank = useUserStore((st) => st.rank);
  const simulationEnabled = isHubSimulationEnabled();
  const feedbackEnabled = useAppPreferencesStore((st) => st.feedbackEnabled);

  const chatUser = useMemo(
    () => ({
      userId,
      username: username || 'Supporter',
      rank,
      country: userCountry || 'FR',
    }),
    [rank, userCountry, userId, username]
  );

  const simulation = useHubSimulation(chatUser, simulationEnabled);
  const realScore = useLiveScore(!simulationEnabled, chatUser.country);
  const realMatchId =
    realScore.live?.matchId?.trim() || realScore.upcoming?.matchId?.trim() || null;
  const realChat = useWorldChat(realMatchId, chatUser, !simulationEnabled);
  const realSupporters = useActiveSupporters(
    {
      userId,
      username: chatUser.username,
      rank,
      country: chatUser.country,
      flag: flagEmoji(chatUser.country),
    },
    !simulationEnabled
  );

  const status = simulationEnabled ? simulation.status : realScore.status;
  const live = simulationEnabled ? simulation.live : realScore.live;
  const upcoming = simulationEnabled ? simulation.upcoming : realScore.upcoming;
  const errorMessage = simulationEnabled ? simulation.errorMessage : realScore.errorMessage;
  const matchId = simulationEnabled ? simulation.matchId : realMatchId;
  const allMessages = simulationEnabled ? simulation.messages : realChat.messages;
  const allSupporters = simulationEnabled ? simulation.supporters : realSupporters.supporters;

  const messages = useMemo(
    () => (globeTab === 'nation' ? filterChatByNation(allMessages, chatUser.country) : allMessages),
    [allMessages, chatUser.country, globeTab]
  );
  const supporters = useMemo(
    () => (globeTab === 'nation' ? filterSupportersByNation(allSupporters, chatUser.country) : allSupporters),
    [allSupporters, chatUser.country, globeTab]
  );

  const homeCode = live?.home.code ?? upcoming?.home.code ?? 'FRA';
  const awayCode = live?.away.code ?? upcoming?.away.code ?? 'BRA';
  const homeScore = live?.home.score ?? 0;
  const awayScore = live?.away.score ?? 0;
  const strength = useMemo(() => computeStrength(messages, homeCode, awayCode), [awayCode, homeCode, messages]);

  const { floatingMessages, removeMessage, addMessage } = useFloatingMessages(messages);
  const simVisualBridge = useMemo<SimulationVisualBridge>(
    () => ({
      pushMessage: (message) => addMessage(message),
      sendToMap: (payload) => mapRef.current?.postToMap(payload),
    }),
    [addMessage, mapRef]
  );

  const crowdSimulation = useSimulation(simulationEnabled ? matchId : null, live, false, simVisualBridge);
  const isSimActive = crowdSimulation.isActive;
  const connectedUsers = simulationEnabled
    ? isSimActive
      ? crowdSimulation.stats.activeUsers
      : crowdSimulation.config.totalUsers
    : undefined;

  const [apiHeatFeatures, setApiHeatFeatures] = useState<HeatFeature[]>([]);
  const onHeatmap = useCallback((features: HeatFeature[]) => {
    setApiHeatFeatures(features);
  }, []);

  usePlanetEvents({ matchId, live, enabled: Boolean(matchId), simulationEnabled });

  const globeDynamic = useHubGlobeDynamic(live, !simulationEnabled);
  useHubGlobeMapBridge({
    mapRef,
    countryStates: globeDynamic.countryStates,
    liveCountries: globeDynamic.liveCountries,
    celebratingCountries: globeDynamic.celebratingCountries,
  });
  useReactionChain(messages, Boolean(matchId));
  useHubFeedback({
    isMatchLive: Boolean(live?.isLive),
    messages,
    userId,
    live,
    homePct: strength.home,
    awayPct: strength.away,
  });
  useNationActivity(onHeatmap, !simulationEnabled);

  useEffect(() => {
    soundService.setEnabled(feedbackEnabled);
    void soundService.init();
  }, [feedbackEnabled]);

  const setSimActiveRef = useRef(crowdSimulation.setIsActive);
  setSimActiveRef.current = crowdSimulation.setIsActive;

  useFocusEffect(
    useCallback(() => {
      return () => setSimActiveRef.current(false);
    }, [])
  );

  const heatFeatures = simulationEnabled ? simulation.heatFeatures : apiHeatFeatures;
  const lastPulseId = useRef<string | null>(null);

  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (lastPulseId.current === last.id) return;
    lastPulseId.current = last.id;
    mapRef.current?.postToMap({ type: 'NATION_PULSE', country: last.country, color: last.countryColor });
  }, [mapRef, messages]);

  const onSend = useCallback(
    (text: string) => {
      void (async () => {
        if (simulationEnabled) {
          await simulation.sendMessage(text);
          return;
        }
        await realChat.sendMessage(text);
      })();
    },
    [realChat.sendMessage, simulation.sendMessage, simulationEnabled]
  );

  const postToMap = useCallback((payload: Record<string, unknown>) => {
    mapRef.current?.postToMap(payload);
  }, [mapRef]);

  return {
    chatUser,
    globeTab,
    status,
    live,
    upcoming,
    errorMessage,
    simulationEnabled,
    isSimActive,
    connectedUsers,
    supporters,
    heatFeatures,
    homeCode,
    awayCode,
    homeScore,
    awayScore,
    strength,
    floatingMessages,
    removeMessage,
    crowdSimulation,
    onSend,
    postToMap,
    globeDynamic,
  };
}
