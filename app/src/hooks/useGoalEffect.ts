import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { HubGoalNotifData } from '../types/hubGoal';

const NOTIF_MS = 5_500;
const EFFECTS_MS = 2_000;
const FLASH_MS = 350;
const MAP_DELAY_MS = 300;

type PostToMap = (payload: Record<string, unknown>) => void;

export function useGoalEffect(postToMap: PostToMap | undefined) {
  const [goalData, setGoalData] = useState<HubGoalNotifData | null>(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const [effectsVisible, setEffectsVisible] = useState(false);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    if (effectsTimer.current) clearTimeout(effectsTimer.current);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    if (mapTimer.current) clearTimeout(mapTimer.current);
    notifTimer.current = null;
    effectsTimer.current = null;
    flashTimer.current = null;
    mapTimer.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const triggerGoal = useCallback(
    (event: HubGoalNotifData) => {
      clearTimers();
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      setFlashVisible(true);
      flashTimer.current = setTimeout(() => setFlashVisible(false), FLASH_MS);

      setGoalData(event);
      notifTimer.current = setTimeout(() => setGoalData(null), NOTIF_MS);

      setEffectsVisible(true);
      effectsTimer.current = setTimeout(() => setEffectsVisible(false), EFFECTS_MS);

      mapTimer.current = setTimeout(() => {
        postToMap?.({
          type: 'PLANET_EVENT',
          event: {
            type: 'GOAL',
            country: event.country,
            countryColor: event.teamColor,
            minute: Number(event.minute) || 0,
            playerName: event.playerName,
          },
        });
        postToMap?.({
          type: 'GOAL_WAVES',
          country: event.country,
          color: event.teamColor,
        });
        postToMap?.({ type: 'GOAL_RING_GLOW', color: event.teamColor });
      }, MAP_DELAY_MS);
    },
    [clearTimers, postToMap]
  );

  return { goalData, flashVisible, effectsVisible, triggerGoal };
}
