import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { formatPower } from '../../../services/gamesService';
import type { NationRank } from '../../../types/games.types';

export type WorldRankingProps = {
  ranking: NationRank[];
  loading: boolean;
  highlightCode?: string;
};

export const WorldRanking = memo(function WorldRanking({ ranking, loading, highlightCode }: WorldRankingProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>CLASSEMENT MONDIAL LIVE</Text>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />
      ) : ranking.length === 0 ? (
        <Text style={styles.empty}>Classement bientôt disponible</Text>
      ) : (
        ranking.map((row) => {
          const hi = highlightCode?.toUpperCase() === row.code.toUpperCase();
          return (
            <View key={row.code} style={[styles.row, hi && styles.rowHi]}>
              <Text style={styles.pos}>#{row.rank}</Text>
              <Text style={styles.flag}>{row.flag}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {row.name}
              </Text>
              <Text style={styles.pts}>{formatPower(row.power)}</Text>
            </View>
          );
        })
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 12,
  },
  title: { color: COLORS.textMuted, fontFamily: 'Inter_800ExtraBold', fontSize: 10, letterSpacing: 1.2, marginBottom: 10 },
  empty: { color: COLORS.textMuted, fontSize: 12, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderRadius: 8 },
  rowHi: { backgroundColor: COLORS.primaryMuted },
  pos: { width: 28, color: COLORS.textMuted, fontFamily: 'Inter_700Bold', fontSize: 11 },
  flag: { fontSize: 14 },
  name: { flex: 1, color: COLORS.text, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  pts: { color: COLORS.primarySoft, fontFamily: 'Inter_800ExtraBold', fontSize: 12 },
});
