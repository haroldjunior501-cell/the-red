import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type EmptySlotCardProps = {
  label: string;
  positionLabel: string;
  onPress: () => void;
};

export const EmptySlotCard = memo(function EmptySlotCard({
  label,
  positionLabel,
  onPress,
}: EmptySlotCardProps) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.card} onPress={onPress} hitSlop={10}>
        <View style={styles.circle}>
          <Text style={styles.plus}>+</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      <Text style={styles.pos}>{positionLabel}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  card: {
    width: 68,
    height: 96,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 20, color: 'rgba(255,255,255,0.25)', fontWeight: '300' },
  label: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pos: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.4,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
  },
});
