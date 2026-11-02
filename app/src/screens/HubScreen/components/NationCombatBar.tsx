import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { flagEmoji } from '../../../constants/mapHub';
import { nationColor } from '../../../constants/hubGlobe';

export type NationCombatBarProps = {
  homeCode: string;
  awayCode: string;
  homePct: number;
  awayPct: number;
};

export const NationCombatBar = memo(function NationCombatBar({ homeCode, awayCode, homePct, awayPct }: NationCombatBarProps) {
  const home = Math.max(0, Math.min(100, homePct));
  const away = Math.max(0, Math.min(100, awayPct));

  return (
    <LinearGradient colors={['rgba(8,12,20,0.98)', 'rgba(8,12,20,0)']} style={styles.wrap} pointerEvents="none">
      <Text style={styles.title}>📡 Pouls Mondial</Text>
      <Text style={styles.subtitle}>Activité des supporters en temps réel</Text>
      <View style={styles.row}>
        <Text style={styles.flag}>{flagEmoji(homeCode)}</Text>
        <View style={styles.track}>
          <View style={[styles.homeFill, { width: `${home}%`, backgroundColor: nationColor(homeCode) }]} />
          <View style={[styles.awayFill, { width: `${away}%`, backgroundColor: nationColor(awayCode) }]} />
        </View>
        <Text style={styles.flag}>{flagEmoji(awayCode)}</Text>
      </View>
      <View style={styles.labels}>
        <Text style={styles.pct}>{home}%</Text>
        <Text style={styles.pct}>{away}%</Text>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 12,
    zIndex: 12,
  },
  title: { fontFamily: 'BebasNeue_400Regular', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flag: { fontSize: 16 },
  track: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden', flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)' },
  homeFill: { height: '100%' },
  awayFill: { height: '100%' },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 24 },
  pct: { fontFamily: 'Inter_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.75)' },
});
