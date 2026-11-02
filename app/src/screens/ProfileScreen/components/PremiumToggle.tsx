import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PROFILE_V2 } from '../../../constants/profileV2Theme';

type Props = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
};

const TRACK_W = 46;
const TRACK_H = 26;
const THUMB = 20;
const PADDING = 3;

export const PremiumToggle = memo(function PremiumToggle({ value, onValueChange, disabled }: Props) {
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 250 });
  }, [progress, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(255,255,255,0.1)', PROFILE_V2.blue]
    ),
    shadowOpacity: progress.value * 0.3,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (TRACK_W - THUMB - PADDING * 2) }],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle, value && styles.trackOn]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    padding: PADDING,
    justifyContent: 'center',
  },
  trackOn: {
    shadowColor: PROFILE_V2.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 4,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
});
