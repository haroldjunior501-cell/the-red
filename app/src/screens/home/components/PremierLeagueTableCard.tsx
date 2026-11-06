import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../../../constants/colors';
import type { LeagueTableRow } from '../../../services/fotmobLeague';
import { plDisplayName, plTableWindowAroundUnited } from '../../../utils/plTableWindow';

const PL_LOGO = 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png';

export type PremierLeagueTableCardProps = {
  table: LeagueTableRow[];
  loading?: boolean;
  updatedAt?: Date | null;
  onPress?: () => void;
};

function formatUpdated(d?: Date | null): string {
  const date = d ?? new Date();
  const label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  return `Updated ${label}`;
}

function gdLabel(gd: number): string {
  if (gd > 0) return `+${gd}`;
  return String(gd);
}

export const PremierLeagueTableCard = memo(function PremierLeagueTableCard({
  table,
  loading,
  updatedAt,
  onPress,
}: PremierLeagueTableCardProps) {
  const { rows } = useMemo(() => plTableWindowAroundUnited(table, 2), [table]);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel="Classement Premier League"
    >
      <View style={styles.header}>
        <Image source={{ uri: PL_LOGO }} style={styles.plLogo} resizeMode="contain" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Premier League</Text>
          <Text style={styles.updated}>{formatUpdated(updatedAt)}</Text>
        </View>
      </View>

      <View style={styles.colHead}>
        <Text style={[styles.colLabel, styles.colTeam]}>Team</Text>
        <Text style={styles.colNum}>P</Text>
        <Text style={styles.colNum}>GD</Text>
        <Text style={[styles.colNum, styles.colPts]}>Pts</Text>
      </View>

      {loading && rows.length === 0 ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
      ) : rows.length === 0 ? (
        <Text style={styles.empty}>Classement indisponible</Text>
      ) : (
        rows.map((row) => (
          <View key={row.id} style={[styles.row, row.isUnited && styles.rowUnited]}>
            <Text style={[styles.rank, row.isUnited && styles.rankUnited]}>{row.rank}</Text>
            <View style={styles.trendDot} />
            {row.logo ? (
              <Image source={{ uri: row.logo }} style={styles.crest} resizeMode="contain" />
            ) : (
              <View style={[styles.crest, styles.crestPh]} />
            )}
            <Text style={[styles.name, row.isUnited && styles.nameUnited]} numberOfLines={1}>
              {plDisplayName(row)}
            </Text>
            <Text style={styles.cell}>{row.played}</Text>
            <Text style={styles.cell}>{gdLabel(row.gd)}</Text>
            <Text style={[styles.cell, styles.pts]}>{row.pts}</Text>
          </View>
        ))
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#1a1214',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, paddingHorizontal: 4 },
  plLogo: { width: 28, height: 28 },
  headerText: { flex: 1 },
  title: {
    fontFamily: 'Georgia',
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  updated: {
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },
  colHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 4,
  },
  colLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  colTeam: { flex: 1, marginLeft: 52 },
  colNum: {
    width: 32,
    textAlign: 'right',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  colPts: { width: 36 },
  empty: {
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 10,
    marginVertical: 1,
  },
  rowUnited: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(218,41,28,0.35)',
  },
  rank: {
    width: 22,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
  },
  rankUnited: { color: '#fff', fontFamily: 'Inter_800ExtraBold' },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginRight: 6,
  },
  crest: { width: 22, height: 22, marginRight: 8 },
  crestPh: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 11 },
  name: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
  },
  nameUnited: { color: '#fff', fontFamily: 'Inter_800ExtraBold' },
  cell: {
    width: 32,
    textAlign: 'right',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontVariant: ['tabular-nums'],
  },
  pts: {
    width: 36,
    fontFamily: 'Inter_800ExtraBold',
    color: '#fff',
  },
});
