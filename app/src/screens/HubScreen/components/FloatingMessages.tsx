import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { FloatingMsg } from '../../../hooks/useFloatingMessages';

type BubbleProps = {
  message: FloatingMsg;
  onComplete: (id: string) => void;
};

const Bubble = memo(function Bubble({ message, onComplete }: BubbleProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withTiming(0, { duration: 400 });
    const hide = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 });
      setTimeout(() => onComplete(message.id), 520);
    }, 4000);
    return () => clearTimeout(hide);
  }, [message.id, onComplete, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        style,
        { top: `${message.position.top}%`, left: `${message.position.left}%`, borderColor: `${message.countryColor}55` },
      ]}
    >
      <Text style={styles.flag}>{message.flag}</Text>
      <View style={styles.copy}>
        <Text style={styles.meta} numberOfLines={1}>
          {message.username} · {message.rank}
        </Text>
        <Text style={styles.text} numberOfLines={2}>
          {message.text}
        </Text>
      </View>
    </Animated.View>
  );
});

export type FloatingMessagesProps = {
  messages: FloatingMsg[];
  onComplete: (id: string) => void;
};

export const FloatingMessages = memo(function FloatingMessages({ messages, onComplete }: FloatingMessagesProps) {
  return (
    <View style={styles.layer} pointerEvents="none">
      {messages.map((msg) => (
        <Bubble key={msg.id} message={msg} onComplete={onComplete} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(13,18,32,0.82)',
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 200,
  },
  flag: { fontSize: 24 },
  copy: { flexShrink: 1 },
  meta: { fontSize: 9, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_600SemiBold' },
  text: { fontSize: 11, color: '#FFFFFF', fontFamily: 'Inter_700Bold', marginTop: 2 },
});
