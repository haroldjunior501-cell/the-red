import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FANTASY_THEME as T } from '../../constants/fantasyTheme';

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
    borderColor: 'rgba(218, 41, 28, 0.45)',
    backgroundColor: 'rgba(218, 41, 28, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 225, 34, 0.35)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 22, color: T.gold, fontWeight: '300' },
  label: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pos: {
    fontSize: 8,
    color: T.muted2,
    letterSpacing: 1.4,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
  },
});
