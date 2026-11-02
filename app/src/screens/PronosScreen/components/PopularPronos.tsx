import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';
import type { PopularProno } from '../../../types/pronos.types';

export type PopularPronosProps = {
  items: PopularProno[];
  selectedScore: string | null;
  disabled: boolean;
  onSelect: (score: string) => void;
};

export const PopularPronos = memo(function PopularPronos({
  items,
  selectedScore,
  disabled,
  onSelect,
}: PopularPronosProps) {
  if (!items.length) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>PRONOS POPULAIRES</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => {
          const on = selectedScore === item.score;
          return (
            <Pressable
              key={item.score}
              disabled={disabled}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => onSelect(item.score)}
            >
              <Text style={[styles.score, on && styles.scoreOn]}>{item.score}</Text>
              <Text style={[styles.pct, on && styles.pctOn]}>{item.percentage}%</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginTop: 14 },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 8,
  },
  row: { gap: 8, paddingRight: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: C.border,
  },
  chipOn: {
    backgroundColor: C.blueGlow,
    borderColor: 'rgba(51,133,255,0.5)',
  },
  score: { fontFamily: 'Inter_700Bold', fontSize: 14, color: C.text2 },
  scoreOn: { color: C.text },
  pct: { fontFamily: 'Inter_500Medium', fontSize: 11, color: C.muted2 },
  pctOn: { color: C.blue2 },
});
