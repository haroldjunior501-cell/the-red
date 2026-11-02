import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
};

const ShimmerBox = memo(function ShimmerBox({ width, height, borderRadius = 12, style }: Props) {
  const w = typeof width === 'number' ? width : 200;
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(x, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [x]);

  const translateX = x.interpolate({
    inputRange: [0, 1],
    outputRange: [-w * 1.2, w * 1.2],
  });

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)' }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: w * 0.55, height: '100%' }}
        />
      </Animated.View>
    </View>
  );
});

export default ShimmerBox;
