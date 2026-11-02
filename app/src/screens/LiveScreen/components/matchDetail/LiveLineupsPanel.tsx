import React, { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { DS } from '../../LiveScreen.styles';

function extractPlayers(payload: Record<string, unknown> | null, side: 'home' | 'away'): string[] {
  if (!payload) return [];
  const root = (payload.data as Record<string, unknown> | undefined) ?? payload;
  const block =
    (root[side] as Record<string, unknown> | undefined) ??
    (root[`${side}team`] as Record<string, unknown> | undefined) ??
    (side === 'home' ? (root.localteam as Record<string, unknown>) : (root.visitorteam as Record<string, unknown>));

  const names: string[] = [];
  const lineup = block?.lineup ?? block?.players ?? root[`${side}_lineup`];
  if (Array.isArray(lineup)) {
    for (const p of lineup) {
      if (typeof p === 'string') names.push(p);
      else if (p && typeof p === 'object') {
        const o = p as Record<string, unknown>;
        const n = String(o.name ?? o.player_name ?? o.fullname ?? '').trim();
        if (n) names.push(n);
      }
    }
  }
  return names.slice(0, 11);
}

type Props = {
  lineups: Record<string, unknown> | null;
  homeName: string;
  awayName: string;
};

export const LiveLineupsPanel = memo(function LiveLineupsPanel({ lineups, homeName, awayName }: Props) {
  const home = useMemo(() => extractPlayers(lineups, 'home'), [lineups]);
  const away = useMemo(() => extractPlayers(lineups, 'away'), [lineups]);

  if (!lineups || (home.length === 0 && away.length === 0)) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Compositions indisponibles pour ce match</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>COMPOSITION DES ÉQUIPES</Text>
      <View style={styles.cols}>
        <View style={styles.col}>
          <Text style={styles.team}>{homeName}</Text>
          {home.map((name, i) => (
            <Text key={`h-${i}`} style={styles.player}>
              {name}
            </Text>
          ))}
        </View>
        <View style={styles.col}>
          <Text style={[styles.team, styles.teamAway]}>{awayName}</Text>
          {away.map((name, i) => (
            <Text key={`a-${i}`} style={styles.player}>
              {name}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  empty: { color: DS.muted, fontSize: 13, textAlign: 'center' },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 11,
    color: DS.muted,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  cols: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  team: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#5b9aff',
    marginBottom: 10,
  },
  teamAway: { color: '#ef4444' },
  player: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#e8eef8',
    marginBottom: 6,
  },
});
