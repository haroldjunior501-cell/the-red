import React, { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { MatchCockpitState } from '../../store/useMatchStore';

export type CockpitBarProps = {
  cockpit: MatchCockpitState;
};

type StatCard = { label: string; value: string; pct?: number };

export const CockpitBar = memo(function CockpitBar({ cockpit }: CockpitBarProps) {
  const stats = useMemo<StatCard[]>(
    () => [
      { label: 'Possession', value: `${cockpit.possessionHome}%`, pct: cockpit.possessionHome },
      { label: 'xG', value: cockpit.xgHome.toFixed(2), pct: Math.min(100, cockpit.xgHome * 40) },
      { label: 'Tirs cadrés', value: String(cockpit.shotsOnTargetHome), pct: Math.min(100, cockpit.shotsOnTargetHome * 12) },
      { label: `Supporters ${cockpit.homeCode}`, value: `${cockpit.supportersHome}k`, pct: Math.min(100, cockpit.supportersHome / 2) },
      { label: `Supporters ${cockpit.awayCode}`, value: `${cockpit.supportersAway}k`, pct: Math.min(100, cockpit.supportersAway / 2) },
    ],
    [cockpit]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.scoreRow}>
        <Text style={styles.flag}>{cockpit.homeFlag}</Text>
        <Text style={styles.team}>{cockpit.homeName}</Text>
        <Text style={styles.score}>
          {cockpit.homeScore} — {cockpit.awayScore}
        </Text>
        <Text style={styles.minute}>{cockpit.minute}</Text>
        <Text style={styles.team}>{cockpit.awayName}</Text>
        <Text style={styles.flag}>{cockpit.awayFlag}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.card}>
            <Text style={styles.value}>{s.value}</Text>
            <Text style={styles.label}>{s.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${s.pct ?? 0}%` }]} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(5,8,16,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(41, 121, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  flag: { fontSize: 18 },
  team: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  score: { fontFamily: 'BebasNeue_400Regular', fontSize: 28, letterSpacing: 5, color: '#FFFFFF' },
  minute: { fontSize: 12, fontWeight: '800', color: '#2979ff' },
  statsRow: { gap: 10, paddingBottom: 2 },
  card: {
    minWidth: 92,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  value: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  label: { fontSize: 7, color: '#6B7280', textTransform: 'uppercase', marginTop: 2 },
  barTrack: { width: '100%', height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#2979ff' },
});
