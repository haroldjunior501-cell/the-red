import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const PARTICLE_COUNT = 25;

type ParticleSpec = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
};

export type GoalParticlesProps = {
  color: string;
  visible: boolean;
};

const AnimatedParticle = memo(function AnimatedParticle({ particle }: { particle: ParticleSpec }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    opacity.value = 0;
    opacity.value = withDelay(particle.delay, withTiming(1, { duration: 80 }));
    progress.value = withDelay(
      particle.delay,
      withTiming(1, { duration: particle.duration })
    );
    opacity.value = withDelay(
      particle.delay + particle.duration * 0.6,
      withTiming(0, { duration: particle.duration * 0.4 })
    );
  }, [opacity, particle.delay, particle.duration, progress]);

  const style = useAnimatedStyle(() => {
    const dx = Math.cos(particle.angle) * particle.distance * progress.value;
    const dy = Math.sin(particle.angle) * particle.distance * progress.value;
    return {
      opacity: opacity.value,
      transform: [
        { translateX: dx },
        { translateY: dy },
        { scale: 1 - progress.value * 0.4 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: '45%',
          left: '50%',
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        style,
      ]}
    />
  );
});

export const GoalParticles = memo(function GoalParticles({ color, visible }: GoalParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        angle: (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.8,
        distance: 60 + Math.random() * 110,
        size: 3 + Math.random() * 5,
        color: i % 4 === 0 ? '#FFFFFF' : color,
        duration: 900 + Math.random() * 500,
        delay: Math.random() * 150,
      })),
    [color]
  );

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wrap]}>
      {particles.map((p) => (
        <AnimatedParticle key={p.id} particle={p} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { zIndex: 350 },
});
