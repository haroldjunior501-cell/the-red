import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import type { LiveMoment } from '../../../types/live.types';
import { cardGlow } from '../../../constants/lighting';
import { DS } from '../LiveScreen.styles';

function iconFor(type: LiveMoment['type']): string {
  switch (type) {
    case 'goal':
      return '⚽';
    case 'redcard':
      return '🟥';
    case 'penalty':
      return '⚠️';
    case 'hot':
      return '🔥';
    default:
      return '•';
  }
}

export type MomentsPanelProps = {
  moments: LiveMoment[];
};

export const MomentsPanel = memo(function MomentsPanel({ moments }: MomentsPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>MOMENTS DU MONDIAL</Text>
      {moments.length === 0 ? (
        <Text style={styles.empty}>En attente d&apos;événements live…</Text>
      ) : (
        moments.slice(0, 6).map((m) => (
          <View key={m.id} style={styles.row}>
            <Text style={styles.icon}>{iconFor(m.type)}</Text>
            <View style={styles.body}>
              <Text style={styles.label} numberOfLines={1}>
                {m.label}
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                {m.matchLabel} · {m.minute}&apos;
              </Text>
            </View>
            {m.isNew ? <View style={styles.dot} /> : null}
          </View>
        ))
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  panel: {
    backgroundColor: DS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DS.border,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    ...cardGlow,
  },
  title: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 10 },
  empty: { color: DS.muted, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  icon: { fontSize: 16, width: 22 },
  body: { flex: 1 },
  label: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sub: { color: DS.muted, fontSize: 10, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: DS.red },
});
