import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ActiveSupporter } from '../../../services/hubRtdbService';

export type SupporterStripProps = {
  supporters: ActiveSupporter[];
};

export const SupporterStrip = memo(function SupporterStrip({ supporters }: SupporterStripProps) {
  const top = supporters.slice(0, 3);
  if (!top.length) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {top.map((s) => (
          <View key={s.id} style={[styles.chip, { borderColor: `${s.countryColor}66` }]}>
            <Text style={styles.flag}>{s.flag}</Text>
            <View>
              <Text style={styles.name} numberOfLines={1}>
                {s.username}
              </Text>
              <Text style={styles.rank} numberOfLines={1}>
                {s.rank}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 58, left: 0, right: 0, zIndex: 15 },
  row: { paddingHorizontal: 12, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(13,18,32,0.78)',
    borderWidth: 1,
    maxWidth: 160,
  },
  flag: { fontSize: 18 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#FFFFFF' },
  rank: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.6)' },
});
