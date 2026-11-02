import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { PremiumMatchEvent } from '../../../../types/liveMatchEvent';
import {
  eventAccentColor,
  formatEventMinute,
  teamGlowColor,
} from '../../../../utils/liveMatchEventMap';
import { EventTypePremiumIcon } from './EventPremiumIcons';

type Props = {
  event: PremiumMatchEvent;
  index: number;
};

const TYPE_LABEL: Record<PremiumMatchEvent['type'], string> = {
  goal: 'GOAL',
  yellow_card: 'YELLOW CARD',
  red_card: 'RED CARD',
  substitution: 'SUBSTITUTION',
};

export const EventCard = memo(function EventCard({ event, index }: Props) {
  const isHome = event.team === 'home';
  const accent = eventAccentColor(event.type, event.team);
  const glow = teamGlowColor(event.team);
  const isGoal = event.type === 'goal';

  const pulse = useSharedValue(1);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (!isGoal) return;
    pulse.value = withSequence(
      withTiming(1.08, { duration: 120, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) })
    );
    glowScale.value = withSequence(
      withTiming(1.35, { duration: 200 }),
      withTiming(1, { duration: 400 })
    );
  }, [event.id, isGoal, pulse, glowScale]);

  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const haloAnim = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: isGoal ? 0.35 : 0.2,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 55)
        .duration(420)
        .springify()
        .damping(18)}
      style={[styles.row, isHome ? styles.rowHome : styles.rowAway]}
    >
      <View style={styles.minuteCol}>
        <View style={styles.minuteBadge}>
          <Text style={styles.minuteTxt}>{formatEventMinute(event)}</Text>
        </View>
      </View>

      <View style={styles.spineCol}>
        <View style={[styles.spineDot, { backgroundColor: accent, shadowColor: accent }]} />
      </View>

      <Animated.View style={[styles.cardOuter, cardAnim, isHome ? styles.alignHome : styles.alignAway]}>
        <Animated.View
          style={[
            styles.halo,
            haloAnim,
            {
              backgroundColor: accent,
              shadowColor: accent,
            },
          ]}
        />
        <View
          style={[
            styles.card,
            isHome ? styles.cardHome : styles.cardAway,
            { borderColor: `${accent}33` },
          ]}
        >
          <View style={styles.iconWrap}>
            <EventTypePremiumIcon type={event.type} glow={glow} size={30} />
          </View>

          <View style={[styles.info, isHome ? styles.infoHome : styles.infoAway]}>
            <Text style={[styles.typeLabel, { color: accent }]}>{TYPE_LABEL[event.type]}</Text>

            {event.type === 'substitution' ? (
              <>
                <Text style={styles.playerIn}>↗ {event.incomingPlayer ?? event.playerName}</Text>
                {event.outgoingPlayer ? (
                  <Text style={styles.playerOut}>↘ {event.outgoingPlayer}</Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.playerName}>{event.playerName}</Text>
                {event.assistName ? (
                  <Text style={styles.assist}>Assist: {event.assistName}</Text>
                ) : null}
                {event.reason ? <Text style={styles.reason}>{event.reason}</Text> : null}
              </>
            )}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  rowHome: { justifyContent: 'flex-start' },
  rowAway: { justifyContent: 'flex-end' },
  minuteCol: { width: 52, alignItems: 'center', paddingTop: 12 },
  minuteBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(240,180,41,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.25)',
  },
  minuteTxt: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 11,
    color: '#F0B429',
    textShadowColor: 'rgba(240,180,41,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  spineCol: {
    width: 20,
    alignItems: 'center',
    paddingTop: 16,
  },
  spineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  cardOuter: {
    flex: 1,
    maxWidth: '78%',
    position: 'relative',
  },
  alignHome: { alignSelf: 'flex-start' },
  alignAway: { alignSelf: 'flex-end' },
  halo: {
    position: 'absolute',
    inset: -4,
    borderRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  cardHome: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(41,121,255,0.5)',
  },
  cardAway: {
    flexDirection: 'row-reverse',
    borderRightWidth: 2,
    borderRightColor: 'rgba(229,56,43,0.5)',
  },
  iconWrap: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  infoHome: { alignItems: 'flex-start' },
  infoAway: { alignItems: 'flex-end' },
  typeLabel: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 9,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  playerName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#f0f4ff',
  },
  assist: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(138,160,190,0.95)',
    marginTop: 2,
  },
  reason: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(61,80,112,0.95)',
    marginTop: 2,
  },
  playerIn: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#43D17A',
  },
  playerOut: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(138,160,190,0.8)',
    marginTop: 2,
  },
});
