import React, { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { ParticleSpec } from '../../../hooks/usePlanetEffects';

type ParticleProps = {
  particle: ParticleSpec;
  onDone: (id: string) => void;
};

const Particle = memo(function Particle({ particle, onDone }: ParticleProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    x.value = withTiming(particle.dx, { duration: particle.duration });
    y.value = withTiming(particle.dy, { duration: particle.duration });
    opacity.value = withTiming(0, { duration: particle.duration });
    const id = setTimeout(() => onDone(particle.id), particle.duration + 40);
    return () => clearTimeout(id);
  }, [onDone, opacity, particle, x, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        style,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
      ]}
    />
  );
});

export type ParticlesProps = {
  particles: ParticleSpec[];
  onDone: (id: string) => void;
};

export const Particles = memo(function Particles({ particles, onDone }: ParticlesProps) {
  if (!particles.length) return null;
  return (
    <View style={styles.layer} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} particle={p} onDone={onDone} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, zIndex: 55 },
  dot: { position: 'absolute' },
});
