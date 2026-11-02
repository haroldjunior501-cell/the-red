import React, { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import type { OverlayMode } from '../../../hooks/usePlanetEffects';
import type { WeatherMood } from '../../../types/planetEvents';

export type PlanetEffectOverlaysProps = {
  overlay: OverlayMode;
  weatherMood: WeatherMood;
  globeGlow: string | null;
};

export const PlanetEffectOverlays = memo(function PlanetEffectOverlays({ overlay, weatherMood, globeGlow }: PlanetEffectOverlaysProps) {
  const flash = useSharedValue(0);
  const eclipse = useSharedValue(0);
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    if (overlay === 'flash') {
      flash.value = 0.18;
      flash.value = withTiming(0, { duration: 500 });
    }
    if (overlay === 'eclipse') {
      eclipse.value = withTiming(0.65, { duration: 400 });
    } else {
      eclipse.value = withTiming(0, { duration: 300 });
    }
    if (overlay === 'penalty' || overlay === 'chaos') {
      pulse.value = withRepeat(withSequence(withTiming(1, { duration: 450, easing: Easing.inOut(Easing.ease) }), withTiming(0.35, { duration: 450 })), -1, false);
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [eclipse, flash, overlay, pulse]);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const eclipseStyle = useAnimatedStyle(() => ({ opacity: eclipse.value }));
  const vignetteStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const moodOpacity = weatherMood === 'tense' ? 0.12 : weatherMood === 'dramatic' ? 0.16 : weatherMood === 'electric' ? 0.08 : 0;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {globeGlow ? <View style={[styles.glowRing, { borderColor: `${globeGlow}88`, shadowColor: globeGlow }]} /> : null}
      {moodOpacity > 0 ? <View style={[styles.mood, { backgroundColor: weatherMood === 'electric' ? 'rgba(41, 121, 255, 0.08)' : 'rgba(150,0,0,0.08)', opacity: moodOpacity }]} /> : null}
      <Animated.View style={[styles.flash, flashStyle]} />
      <Animated.View style={[styles.eclipse, eclipseStyle]} />
      {(overlay === 'penalty' || overlay === 'chaos') && <Animated.View style={[styles.vignette, vignetteStyle]} />}
      {overlay === 'aurora' ? <View style={styles.aurora} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFFFFF', zIndex: 52 },
  eclipse: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000', zIndex: 51 },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: 'transparent',
    borderWidth: 28,
    borderColor: 'rgba(255,30,30,0.22)',
  },
  aurora: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 49,
    backgroundColor: 'rgba(41, 121, 255, 0.12)',
  },
  mood: { ...StyleSheet.absoluteFillObject, zIndex: 48 },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 47,
    borderWidth: 2,
    borderRadius: 999,
    margin: 8,
    shadowOpacity: 0.8,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
});
