import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export type GoalFlashProps = {
  visible: boolean;
};

export const GoalFlash = memo(function GoalFlash({ visible }: GoalFlashProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    opacity.value = 0.18;
    opacity.value = withTiming(0, { duration: 350 });
  }, [opacity, visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.flash, style]}
    />
  );
});

const styles = StyleSheet.create({
  flash: {
    backgroundColor: '#FFFFFF',
    zIndex: 190,
    borderRadius: 44,
  },
});
