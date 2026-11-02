import React, { memo, useEffect } from 'react';
import { cardGlow } from '../../../constants/lighting';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

export type GoalNotificationProps = {
  playerName: string;
  teamName: string;
  teamColor: string;
  minute: string;
  homeScore: number;
  awayScore: number;
  visible: boolean;
};

export const GoalNotification = memo(function GoalNotification({
  playerName,
  teamName,
  teamColor,
  minute,
  homeScore,
  awayScore,
  visible,
}: GoalNotificationProps) {
  const translateY = useSharedValue(-130);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(-130, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [opacity, translateY, visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.container, animStyle]}>
      <Text style={styles.ball}>⚽</Text>
      <View style={styles.body}>
        <Text style={[styles.player, { color: teamColor }]}>{playerName}</Text>
        <Text style={styles.detail}>
          {teamName} · {minute}&apos; · Coupe du Monde 2026
        </Text>
      </View>
      <Text style={styles.score}>
        {homeScore}—{awayScore}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    zIndex: 300,
    backgroundColor: 'rgba(5,8,14,0.97)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.22)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...cardGlow,
  },
  ball: { fontSize: 26 },
  body: { flex: 1 },
  player: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 4,
  },
  detail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 3,
    fontFamily: 'Inter_600SemiBold',
  },
  score: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    letterSpacing: 5,
    color: '#fff',
  },
});
