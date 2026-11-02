import { useEffect, useRef } from 'react';
import type { ParsedLiveScore } from '../services/livescoreApi';
import {
  onChatExplosion,
  onChaosEnd,
  onChaosStart,
  onGoal,
  onHistoric,
  onMatchEnd,
  onMatchStart,
  onNationDominance,
  onNearMiss,
  onPenalty,
  onRedCard,
  onViralPing,
  resolvePenaltyFeedback,
} from '../services/hubEventFeedback';
import { hapticService } from '../services/hapticService';
import { notificationService } from '../services/notificationService';
import { soundService } from '../services/soundService';
import { usePlanetEventStore } from '../store/planetEventStore';
import type { PlanetEvent } from '../types/planetEvents';
import type { WorldChatMessage } from '../services/hubRtdbService';

let chaosHapticInterval: ReturnType<typeof setInterval> | null = null;

async function handlePlanetEventFeedback(event: PlanetEvent, live: ParsedLiveScore | null): Promise<void> {
  switch (event.type) {
    case 'GOAL':
      if (live) await onGoal(event, live);
      break;
    case 'PENALTY':
      if (live) await onPenalty(event, live);
      break;
    case 'PENALTY_MISSED':
      await onNearMiss();
      break;
    case 'RED_CARD':
      if (live) await onRedCard(event, live);
      break;
    case 'HISTORIC':
      await onHistoric();
      break;
    case 'CHAIN':
      await onChatExplosion();
      break;
    case 'CHAOS':
      break;
    default:
      break;
  }
}

type UseHubFeedbackArgs = {
  isMatchLive: boolean;
  messages: WorldChatMessage[];
  userId: string;
  live: ParsedLiveScore | null;
  homePct: number;
  awayPct: number;
};

export function useHubFeedback({ isMatchLive, messages, userId, live, homePct, awayPct }: UseHubFeedbackArgs) {
  const activeEvent = usePlanetEventStore((s) => s.activeEvent);
  const isChaosMode = usePlanetEventStore((s) => s.isChaosMode);
  const lastEventId = useRef<string | null>(null);
  const chatBurstAt = useRef<number>(0);
  const chatBurstPlayed = useRef(false);
  const lastOwnMessageId = useRef<string | null>(null);
  const wasLiveRef = useRef(false);
  const wasChaosRef = useRef(false);
  const dominanceSent = useRef<Set<string>>(new Set());

  useEffect(() => {
    void notificationService.requestPermissions();
    void soundService.init();
    return () => {
      resolvePenaltyFeedback();
      if (chaosHapticInterval) {
        clearInterval(chaosHapticInterval);
        chaosHapticInterval = null;
      }
      void soundService.cleanup();
    };
  }, []);

  useEffect(() => {
    const wasLive = wasLiveRef.current;
    wasLiveRef.current = isMatchLive;

    if (isMatchLive && !wasLive && live) {
      void onMatchStart(live);
      return () => {
        void soundService.stopAmbient();
      };
    }

    if (!isMatchLive && wasLive) {
      void onMatchEnd();
    }

    if (isMatchLive && wasLive) {
      void soundService.startAmbient();
      return () => {
        void soundService.stopAmbient();
      };
    }

    void soundService.stopAmbient();
    return undefined;
  }, [isMatchLive, live]);

  useEffect(() => {
    if (!activeEvent || lastEventId.current === activeEvent.id) return;
    lastEventId.current = activeEvent.id;
    void handlePlanetEventFeedback(activeEvent, live);
  }, [activeEvent, live]);

  useEffect(() => {
    const wasChaos = wasChaosRef.current;
    wasChaosRef.current = isChaosMode;

    if (isChaosMode && !wasChaos) {
      void onChaosStart();
      if (!chaosHapticInterval) {
        chaosHapticInterval = setInterval(() => {
          void hapticService.chaosPulse();
        }, 2000);
      }
      return () => undefined;
    }

    if (!isChaosMode && wasChaos) {
      if (chaosHapticInterval) {
        clearInterval(chaosHapticInterval);
        chaosHapticInterval = null;
      }
      void onChaosEnd();
      if (isMatchLive) {
        void soundService.startAmbient();
      }
    }
    return undefined;
  }, [isChaosMode, isMatchLive, live]);

  useEffect(() => {
    const checkSide = (code: string, pct: number) => {
      if (pct < 60) {
        dominanceSent.current.delete(code);
        return;
      }
      if (dominanceSent.current.has(code)) return;
      dominanceSent.current.add(code);
      void onNationDominance();
    };
    checkSide('home', homePct);
    checkSide('away', awayPct);
  }, [awayPct, homePct]);

  useEffect(() => {
    if (!messages.length) return;
    const now = Date.now();
    const recent = messages.filter((m) => now - m.timestamp < 10_000);
    if (recent.length < 20) {
      chatBurstPlayed.current = false;
      return;
    }
    if (chatBurstPlayed.current && now - chatBurstAt.current < 12_000) return;
    chatBurstAt.current = now;
    chatBurstPlayed.current = true;
    void onChatExplosion();
  }, [messages]);

  useEffect(() => {
    if (!userId || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last.userId !== userId) return;
    if (lastOwnMessageId.current === last.id) return;
    lastOwnMessageId.current = last.id;
    void onViralPing();
  }, [messages, userId]);
}

export type GoalNotificationData = {
  playerName: string;
  teamFlag: string;
  minute: number;
  score: string;
  teamName: string;
  opponentName: string;
  opponentFlag: string;
};

export function triggerViralPingFeedback(): void {
  void onViralPing();
}

export function buildGoalNotification(
  event: PlanetEvent | null,
  live: ParsedLiveScore | null
): GoalNotificationData | null {
  if (!event || event.type !== 'GOAL' || !live) return null;
  const isHome = event.country?.toUpperCase() === live.home.code.toUpperCase();
  return {
    playerName: event.playerName ?? 'BUTEUR',
    teamFlag: isHome ? live.home.flag : live.away.flag,
    minute: event.minute ?? live.minute,
    score: `${live.home.score} — ${live.away.score}`,
    teamName: isHome ? live.home.name : live.away.name,
    opponentName: isHome ? live.away.name : live.home.name,
    opponentFlag: isHome ? live.away.flag : live.home.flag,
  };
}
