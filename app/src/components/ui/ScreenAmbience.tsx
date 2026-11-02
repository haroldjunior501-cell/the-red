import React, { memo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AMBIENT_GRADIENT_BOTTOM,
  AMBIENT_GRADIENT_TOP,
  BACKGROUND_GRADIENT,
  LIGHT,
  ambienceStyles,
} from '../../constants/lighting';

export type ScreenAmbienceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Lueur centrale optionnelle (hero, globe) */
  centerGlow?: boolean;
};

export const ScreenAmbience = memo(function ScreenAmbience({ children, style, centerGlow }: ScreenAmbienceProps) {
  return (
    <View style={[ambienceStyles.root, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={[...BACKGROUND_GRADIENT]}
        locations={[0, 0.38, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={ambienceStyles.fill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[...AMBIENT_GRADIENT_TOP]}
        locations={[0, 0.24, 0.52]}
        style={ambienceStyles.fill}
      />
      {centerGlow ? (
        <View pointerEvents="none" style={styles.centerGlowWrap}>
          <LinearGradient
            colors={[LIGHT.glowSoft, LIGHT.glowCenter, 'transparent']}
            locations={[0, 0.45, 1]}
            style={styles.centerGlow}
          />
        </View>
      ) : null}
      <LinearGradient
        pointerEvents="none"
        colors={[...AMBIENT_GRADIENT_BOTTOM]}
        locations={[0.68, 1]}
        style={ambienceStyles.fill}
      />
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  centerGlowWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '10%',
  },
  centerGlow: {
    width: '140%',
    height: '42%',
    borderRadius: 999,
    opacity: 0.88,
  },
});
