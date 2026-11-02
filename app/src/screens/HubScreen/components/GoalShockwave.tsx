import React, { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export type GoalShockwaveProps = {
  color: string;
  visible: boolean;
};

type ShockRingProps = {
  color: string;
  visible: boolean;
  delay: number;
};

const ShockRing = memo(function ShockRing({ color, visible, delay }: ShockRingProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      scale.value = 0;
      opacity.value = 0;
      return;
    }
    scale.value = 0;
    opacity.value = 0;
    const timeout = setTimeout(() => {
      opacity.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withDelay(100, withTiming(0, { duration: 1500 }))
      );
      scale.value = withTiming(7, { duration: 1600, easing: Easing.out(Easing.cubic) });
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, opacity, scale, visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: 30,
          borderWidth: 2.5,
          borderColor: color,
          top: '45%',
          left: '45%',
        },
        style,
      ]}
    />
  );
});

export const GoalShockwave = memo(function GoalShockwave({ color, visible }: GoalShockwaveProps) {
  if (!visible) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wrap]}>
      {[0, 1, 2].map((i) => (
        <ShockRing key={i} color={color} visible={visible} delay={i * 180} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { zIndex: 400 },
});
