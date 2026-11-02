import React, { memo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { LiveStatRow, ParsedLiveMatchStats } from '../../../../utils/liveMatchStatsParse';
import { DS } from '../../LiveScreen.styles';

type Props = {
  stats: ParsedLiveMatchStats | null;
  loading: boolean;
  homeName: string;
  awayName: string;
};

function StatBar({
  label,
  home,
  away,
  isPercent,
}: {
  label: string;
  home: number;
  away: number;
  isPercent?: boolean;
}) {
  const total = Math.max(home + away, 1);
  const homePct = isPercent ? home : (home / total) * 100;
  const awayPct = isPercent ? away : (away / total) * 100;

  return (
    <View style={styles.row}>
      <Text style={styles.valHome}>{isPercent ? `${home}%` : home}</Text>
      <View style={styles.centerCol}>
        <Text style={styles.lbl}>{label}</Text>
        <View style={styles.track}>
          <View style={[styles.fillHome, { width: `${homePct}%` }]} />
          <View style={[styles.fillAway, { width: `${awayPct}%` }]} />
        </View>
      </View>
      <Text style={styles.valAway}>{isPercent ? `${away}%` : away}</Text>
    </View>
  );
}

export const LiveStatsPanel = memo(function LiveStatsPanel({ stats, loading, homeName, awayName }: Props) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={DS.green} />
      </View>
    );
  }

  if (!stats || stats.rows.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Statistiques indisponibles pour ce match</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <StatBar
        label="Possession de balle"
        home={stats.possessionHome}
        away={stats.possessionAway}
        isPercent
      />
      {stats.rows.map((r: LiveStatRow) => (
        <StatBar key={r.key} label={r.label} home={r.home} away={r.away} isPercent={r.isPercent} />
      ))}
      {stats.dangerousHome + stats.dangerousAway > 0 ? (
        <View style={styles.dangerBlock}>
          <Text style={styles.dangerTitle}>Attaques dangereuses</Text>
          <View style={styles.dangerRow}>
            <Text style={styles.dangerVal}>{stats.dangerousHome}</Text>
            <View style={styles.dangerBars}>
              <View style={[styles.dangerHome, { flex: stats.dangerousHome }]} />
              <View style={[styles.dangerAway, { flex: stats.dangerousAway }]} />
            </View>
            <Text style={styles.dangerVal}>{stats.dangerousAway}</Text>
          </View>
          <Text style={styles.dangerHint}>
            {homeName} · {awayName}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 24, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: DS.muted, fontSize: 13, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valHome: { width: 36, textAlign: 'right', fontFamily: 'Inter_700Bold', fontSize: 13, color: '#5b9aff' },
  valAway: { width: 36, textAlign: 'left', fontFamily: 'Inter_700Bold', fontSize: 13, color: '#ef4444' },
  centerCol: { flex: 1 },
  lbl: {
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: DS.muted,
    marginBottom: 6,
  },
  track: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fillHome: { height: '100%', backgroundColor: 'rgba(51,133,255,0.85)' },
  fillAway: { height: '100%', backgroundColor: 'rgba(229,56,43,0.85)' },
  dangerBlock: { marginTop: 8, alignItems: 'center' },
  dangerTitle: { fontFamily: 'Inter_700Bold', fontSize: 11, color: DS.muted, marginBottom: 10 },
  dangerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, width: '100%' },
  dangerVal: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#fff', width: 28 },
  dangerBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 4,
  },
  dangerHome: { backgroundColor: '#2979ff', borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 8 },
  dangerAway: { backgroundColor: '#ef4444', borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 8 },
  dangerHint: { marginTop: 8, fontFamily: 'Inter_500Medium', fontSize: 10, color: DS.muted },
});
