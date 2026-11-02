import * as Haptics from 'expo-haptics';
import React, { memo, useEffect, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { PremiumMatchEvent } from '../../../../types/liveMatchEvent';
import { EventCard } from './EventCard';

type Props = {
  events: PremiumMatchEvent[];
  loading?: boolean;
};

function TimelineSpine() {
  const breath = useSharedValue(0.35);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(0.85, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [breath]);

  const anim = useAnimatedStyle(() => ({
    opacity: breath.value,
  }));

  return (
    <View style={styles.spineTrack}>
      <Animated.View style={[styles.spineLine, anim]} />
    </View>
  );
}

export const LiveEventsTimeline = memo(function LiveEventsTimeline({ events, loading }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const prevCount = useRef(events.length);

  useEffect(() => {
    if (events.length > prevCount.current && events.length > 0) {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
    prevCount.current = events.length;
  }, [events.length]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>ÉVÉNEMENTS LIVE</Text>

      {loading && events.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTxt}>Chargement des événements…</Text>
        </View>
      ) : null}

      {!loading && events.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyPulse} />
          <Text style={styles.emptyTitle}>Aucun événement</Text>
          <Text style={styles.emptyTxt}>Les actions du match apparaîtront ici en direct</Text>
        </View>
      ) : null}

      {events.length > 0 ? (
        <View style={styles.listWrap}>
          <TimelineSpine />
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 16,
  },
  heading: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(61,80,112,0.95)',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listWrap: {
    position: 'relative',
    minHeight: 120,
    maxHeight: 420,
  },
  spineTrack: {
    position: 'absolute',
    left: 58,
    top: 8,
    bottom: 8,
    width: 2,
    borderRadius: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  spineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 12, paddingLeft: 0 },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  emptyPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(240,180,41,0.5)',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#e8eef8',
    marginBottom: 6,
  },
  emptyTxt: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(138,160,190,0.85)',
    textAlign: 'center',
  },
});
