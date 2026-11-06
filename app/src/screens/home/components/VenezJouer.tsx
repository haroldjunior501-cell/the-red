import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../../constants/colors';
import {
  GAME_CARD_GAP,
  GAME_CARD_SNAP,
  GAME_MODES,
  type GameModeKey,
} from '../../../constants/gameModes';
import { GameCard } from './GameCard';

const F = {
  bebas: 'BebasNeue_400Regular' as const,
  i700: 'Inter_700Bold' as const,
  i800: 'Inter_800ExtraBold' as const,
};

const DS = {
  ph: 16,
  green: COLORS.primary,
  white: COLORS.text,
} as const;

export type VenezJouerProps = {
  onPronos: () => void;
  onPickXi: () => void;
  onQuiz: () => void;
  onRating: () => void;
  onShowAll?: () => void;
};

export const VenezJouer = memo(function VenezJouer({
  onPronos,
  onPickXi,
  onQuiz,
  onRating,
  onShowAll,
}: VenezJouerProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const entrance = useRef(new Animated.Value(0)).current;

  const handlers: Record<GameModeKey, () => void> = {
    pronos: onPronos,
    pickxi: onPickXi,
    quiz: onQuiz,
    rating: onRating,
  };

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const handlePress = useCallback(
    (key: GameModeKey) => {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      handlers[key]();
    },
    [handlers]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>VENEZ JOUER</Text>
        {onShowAll ? (
          <TouchableOpacity onPress={onShowAll} activeOpacity={0.85} style={styles.seeAllBtn}>
            <LinearGradient
              colors={['rgba(41, 121, 255, 0.18)', 'rgba(41, 121, 255, 0.06)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.seeAll}>Voir tout</Text>
            <Text style={styles.seeAllArrow}>›</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={GAME_CARD_SNAP}
        snapToAlignment="start"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {GAME_MODES.map((mode, index) => (
          <GameCard
            key={mode.key}
            mode={mode}
            index={index}
            scrollX={scrollX}
            entrance={entrance}
            onPress={() => handlePress(mode.key)}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DS.ph,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: F.bebas,
    fontSize: 26,
    letterSpacing: 2,
    color: DS.white,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.28)',
  },
  seeAll: {
    fontSize: 12,
    color: DS.green,
    fontFamily: F.i800,
  },
  seeAllArrow: {
    fontSize: 14,
    color: DS.green,
    fontFamily: F.i700,
    marginTop: -1,
  },
  scrollContent: {
    paddingHorizontal: DS.ph,
    gap: GAME_CARD_GAP,
    paddingBottom: 6,
  },
});
