import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  GAME_CARD_HEIGHT,
  GAME_CARD_RADIUS,
  GAME_CARD_WIDTH,
  type GameModeConfig,
} from '../../../constants/gameModes';

const F = {
  bebas: 'BebasNeue_400Regular' as const,
  i700: 'Inter_700Bold' as const,
  i800: 'Inter_800ExtraBold' as const,
};

type GameCardProps = {
  mode: GameModeConfig;
  index: number;
  scrollX: Animated.Value;
  entrance: Animated.Value;
  onPress: () => void;
};

function LivePulseBadge() {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.liveWrap}>
      <Animated.View style={[styles.liveGlow, { opacity: pulse }]} />
      <View style={styles.liveInner}>
        <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
        <Text style={styles.liveTxt}>LIVE</Text>
      </View>
    </View>
  );
}

export const GameCard = memo(function GameCard({ mode, index, scrollX, entrance, onPress }: GameCardProps) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const snap = GAME_CARD_WIDTH + 14;

  const focusScale = scrollX.interpolate({
    inputRange: [(index - 1) * snap, index * snap, (index + 1) * snap],
    outputRange: [0.94, 1, 0.94],
    extrapolate: 'clamp',
  });

  const parallaxX = scrollX.interpolate({
    inputRange: [(index - 1) * snap, index * snap, (index + 1) * snap],
    outputRange: [12, 0, -12],
    extrapolate: 'clamp',
  });

  const enterY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [28 + index * 6, 0],
  });

  const enterOpacity = entrance.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.6, 1],
  });

  const onPressIn = useCallback(() => {
    Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true, friction: 7 }).start();
  }, [pressScale]);

  const onPressOut = useCallback(() => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
  }, [pressScale]);

  return (
    <Animated.View
      style={[
        styles.outer,
        {
          opacity: enterOpacity,
          transform: [{ translateY: enterY }, { scale: focusScale }, { scale: pressScale }],
        },
      ]}
    >
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} accessibilityRole="button">
        <View style={[styles.glowRing, { shadowColor: mode.glow }]}>
          <ImageBackground
            source={mode.image as ImageSourcePropType}
            style={styles.card}
            imageStyle={styles.cardImage}
            resizeMode="cover"
          >
            <Animated.View style={[styles.bgParallax, { transform: [{ translateX: parallaxX }] }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.14)', 'transparent', 'transparent']}
                locations={[0, 0.35, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.82)', 'rgba(0,0,0,0.94)']}
                locations={[0, 0.35, 0.72, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <LinearGradient
                colors={[`${mode.accent}22`, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            </Animated.View>

            <View style={styles.topRow}>
              <View style={[styles.badge, { borderColor: mode.accentSoft }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(0,0,0,0.45)']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={[styles.badgeTxt, { color: mode.accent }]}>{mode.label}</Text>
              </View>
              {mode.live ? <LivePulseBadge /> : null}
            </View>

            <View style={styles.bottom}>
              <Text style={styles.title}>{mode.title}</Text>
              <Text style={styles.desc} numberOfLines={2}>
                {mode.description}
              </Text>
              <LinearGradient
                colors={['rgba(255,255,255,0.16)', 'rgba(0,0,0,0.5)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cta, { borderColor: mode.accentSoft }]}
              >
                <Text style={styles.ctaTxt}>{mode.cta}</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
              </LinearGradient>
            </View>
          </ImageBackground>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  outer: {
    width: GAME_CARD_WIDTH,
    height: GAME_CARD_HEIGHT,
  },
  glowRing: {
    width: GAME_CARD_WIDTH,
    height: GAME_CARD_HEIGHT,
    borderRadius: GAME_CARD_RADIUS,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.55,
        shadowRadius: 18,
      },
      android: { elevation: 14 },
      default: {},
    }),
  },
  card: {
    flex: 1,
    borderRadius: GAME_CARD_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardImage: {
    borderRadius: GAME_CARD_RADIUS,
  },
  bgParallax: {
    ...StyleSheet.absoluteFillObject,
    width: GAME_CARD_WIDTH + 24,
    marginLeft: -12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  badge: {
    overflow: 'hidden',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeTxt: {
    fontFamily: F.i800,
    fontSize: 9,
    letterSpacing: 2,
  },
  liveWrap: {
    position: 'relative',
  },
  liveGlow: {
    position: 'absolute',
    width: 52,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5382b',
    top: 0,
    right: 0,
  },
  liveInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(229, 56, 43, 0.55)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#e5382b',
  },
  liveTxt: {
    color: '#fff',
    fontFamily: F.i800,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 4,
  },
  title: {
    fontFamily: F.bebas,
    fontSize: 32,
    lineHeight: 34,
    color: '#fff',
    letterSpacing: 0.5,
  },
  desc: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: F.i700,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ctaTxt: {
    color: '#fff',
    fontFamily: F.i800,
    fontSize: 10,
    letterSpacing: 0.3,
    flex: 1,
    marginRight: 4,
  },
});
