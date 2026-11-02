import { useEffect, useState } from 'react';
import { countryIdToNation, flagEmoji } from '../constants/mapHub';
import {
  subscribeToLiveEvents,
  subscribeToNationsPower,
  subscribeToTopSupporters,
  sendGlobalGiftEvent,
  type LiveEventRow,
  type NationPower,
  type TopSupporterRow,
} from '../services/mapService';
import { useUserStore } from '../store/useUserStore';

export type NationDataState = {
  nationCode: string;
  flag: string;
  power: number;
  supporterCount: number;
  recentEvents: LiveEventRow[];
  topSupporters: TopSupporterRow[];
  sendGift: (gift: string) => Promise<void>;
};

export function useNationData(countryId: string | null): NationDataState | null {
  const nationCode = countryId ? countryIdToNation(countryId) : null;
  const userName   = useUserStore((s) => s.name);

  const [power,          setPower]          = useState(0);
  const [supporterCount, setSupporterCount] = useState(0);
  const [recentEvents,   setRecentEvents]   = useState<LiveEventRow[]>([]);
  const [topSupporters,  setTopSupporters]  = useState<TopSupporterRow[]>([]);

  // Nation force (Firebase RTDB)
  useEffect(() => {
    if (!nationCode) return;
    const unsub = subscribeToNationsPower((data: NationPower) => {
      setPower(data[nationCode] ?? 0);
      // Mock supporter count proportional to power
      setSupporterCount(Math.round((data[nationCode] ?? 0) * 15000));
    });
    return () => unsub();
  }, [nationCode]);

  // Événements récents filtrés par nation
  useEffect(() => {
    if (!nationCode) return;
    const unsub = subscribeToLiveEvents((events) => {
      setRecentEvents(
        events
          .filter((e) => !e.country || e.country === nationCode)
          .slice(0, 8)
      );
    });
    return () => unsub();
  }, [nationCode]);

  // Top supporters de cette nation
  useEffect(() => {
    if (!nationCode) return;
    const unsub = subscribeToTopSupporters((list) => {
      setTopSupporters(list.filter((s) => s.country === nationCode).slice(0, 5));
    });
    return () => unsub();
  }, [nationCode]);

  if (!nationCode) return null;

  const sendGift = async (gift: string) => {
    await sendGlobalGiftEvent({
      userName: userName || 'Supporter',
      gift,
      team: nationCode,
      power: 5,
    });
  };

  return {
    nationCode,
    flag: flagEmoji(nationCode),
    power,
    supporterCount,
    recentEvents,
    topSupporters,
    sendGift,
  };
}
