import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

const STEP = 20;
const LINES = 22;

/** Grille gaming du header (alignée maquette HTML). */
export const HeroGrid = memo(function HeroGrid() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: LINES }, (_, i) => (
        <View
          key={`h-${i}`}
          style={[styles.lineH, { top: i * STEP }]}
        />
      ))}
      {Array.from({ length: LINES }, (_, i) => (
        <View
          key={`v-${i}`}
          style={[styles.lineV, { left: i * STEP }]}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  lineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(41,121,255,0.05)',
  },
  lineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(41,121,255,0.05)',
  },
});
