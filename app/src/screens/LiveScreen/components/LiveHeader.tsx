import React, { memo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import type { LiveFilterKey } from '../../../types/live.types';
import { worldCupDayLabel } from '../../../utils/liveMatchUtils';
import { COLORS } from '../../../constants/colors';
import { DS } from '../LiveScreen.styles';

const FILTERS: { key: LiveFilterKey; label: string }[] = [
  { key: 'all', label: 'Matchs' },
  { key: 'groupes', label: 'Groupes' },
  { key: '1/8', label: '1/8' },
  { key: '1/4', label: '1/4' },
  { key: 'demi', label: 'Demi' },
  { key: 'finale', label: 'Finale' },
];

export type LiveHeaderProps = {
  filter: LiveFilterKey;
  onFilter: (f: LiveFilterKey) => void;
};

export const LiveHeader = memo(function LiveHeader({ filter, onFilter }: LiveHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.title}>LIVE MATCHES</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{worldCupDayLabel()}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((f) => {
          const on = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => onFilter(f.key)}
              style={[styles.chip, on && styles.chipOn]}
              activeOpacity={0.85}
            >
              <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 10 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontFamily: DS.bebas, fontSize: 28, letterSpacing: 2, color: COLORS.text },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  badgeTxt: { color: COLORS.primarySoft, fontSize: 11, fontWeight: '700' },
  filters: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DS.border,
    backgroundColor: DS.card,
  },
  chipOn: { borderColor: COLORS.primaryBorder, backgroundColor: COLORS.primaryMuted },
  chipTxt: { color: DS.muted, fontSize: 12, fontWeight: '600' },
  chipTxtOn: { color: COLORS.primarySoft },
});
