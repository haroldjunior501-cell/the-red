import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { usePlanetEventStore } from '../../../store/planetEventStore';
import type { PlanetEventType } from '../../../types/planetEvents';

const BORDER: Record<PlanetEventType, string> = {
  GOAL: 'rgba(41, 121, 255, 0.4)',
  PENALTY: 'rgba(255,59,48,0.4)',
  PENALTY_MISSED: 'rgba(255,59,48,0.35)',
  RED_CARD: 'rgba(255,59,48,0.45)',
  HISTORIC: 'rgba(255,215,0,0.4)',
  CHAOS: 'rgba(255,59,48,0.45)',
  CHAIN: 'rgba(255,215,0,0.35)',
};

function bannerText(type: PlanetEventType, playerName?: string, minute?: number, country?: string): string {
  switch (type) {
    case 'GOAL':
      return `🌍 ${playerName ? `${playerName.toUpperCase()} · ` : ''}${country ?? 'LA NATION'} EXPLOSE LE MONDE`;
    case 'PENALTY':
      return `🌍 ${minute ?? 0}M — LE MONDE RETIENT SON SOUFFLE`;
    case 'PENALTY_MISSED':
      return `🌍 PENALTY RATÉ — LE MONDE EXPIRE`;
    case 'RED_CARD':
      return '🟥 LE MONDE EST SOUS LE CHOC';
    case 'HISTORIC':
      return `🌟 MOMENT HISTORIQUE${playerName ? ` — ${playerName.toUpperCase()}` : ''}`;
    case 'CHAOS':
      return '☠️ FINAL CHAOS MODE';
    case 'CHAIN':
      return '⚡ RÉACTION EN CHAÎNE MONDIALE';
    default:
      return '🌍 LA PLANÈTE RÉAGIT';
  }
}

export const EventBanner = memo(function EventBanner() {
  const activeEvent = usePlanetEventStore((s) => s.activeEvent);
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!activeEvent) {
      opacity.value = withTiming(0, { duration: 200 });
      return;
    }
    translateY.value = -80;
    opacity.value = 0;
    translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 300 });
    opacity.value = withDelay(3200, withTiming(0, { duration: 300 }));
    translateY.value = withDelay(3200, withTiming(-80, { duration: 300 }));
  }, [activeEvent, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!activeEvent) return null;

  return (
    <Animated.View
      style={[
        styles.wrap,
        style,
        { borderColor: BORDER[activeEvent.type] },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>
        {bannerText(activeEvent.type, activeEvent.playerName, activeEvent.minute, activeEvent.country)}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    zIndex: 60,
    backgroundColor: 'rgba(6,9,15,0.92)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '92%',
  },
  text: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 14,
    letterSpacing: 2,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
