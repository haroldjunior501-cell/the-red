import React, { memo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type HomeMediaBackdropProps = {
  colors: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
};

export const HomeMediaBackdrop = memo(function HomeMediaBackdrop({ colors, style }: HomeMediaBackdropProps) {
  return <LinearGradient colors={[...colors]} style={[StyleSheet.absoluteFill, style]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />;
});
