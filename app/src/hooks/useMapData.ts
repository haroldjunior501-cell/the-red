import { useCallback, useEffect, useState } from 'react';
import {
  sendReaction as svcSendReaction,
  subscribeToLiveEvents,
  subscribeToNationsPower,
  subscribeToSupportersOnline,
  subscribeToTopNations,
  subscribeToTopSupporters,
  updateNationPower,
  sendGlobalGiftEvent,
  type LiveEventRow,
  type NationPower,
  type SupporterOnline,
  type TopNationRow,
  type TopSupporterRow,
} from '../services/mapService';

export function useMapData() {
  const [nationsPower, setNationsPower] = useState<NationPower>({});
  const [topNations, setTopNations] = useState<TopNationRow[]>([]);
  const [topSupporters, setTopSupporters] = useState<TopSupporterRow[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEventRow[]>([]);
  const [supportersOnline, setSupportersOnline] = useState<SupporterOnline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubs = [
      subscribeToNationsPower(setNationsPower),
      subscribeToTopNations(setTopNations),
      subscribeToTopSupporters(setTopSupporters),
      subscribeToLiveEvents(setLiveEvents),
      subscribeToSupportersOnline(setSupportersOnline),
    ];
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => {
      clearTimeout(t);
      unsubs.forEach((u) => u());
    };
  }, []);

  const sendReaction = useCallback(async (type: string, userId: string, country: string, meta?: Record<string, unknown>) => {
    await svcSendReaction(type, userId, country, meta);
  }, []);

  const bumpNation = useCallback(async (country: string, delta: number) => {
    await updateNationPower(country, delta);
  }, []);

  const broadcastGift = useCallback(
    async (p: { userName: string; gift: string; team: string; power?: number }) => {
      await sendGlobalGiftEvent(p);
    },
    []
  );

  return {
    nationsPower,
    topNations,
    topSupporters,
    liveEvents,
    supportersOnline,
    sendReaction,
    bumpNation,
    broadcastGift,
    isLoading,
  };
}
