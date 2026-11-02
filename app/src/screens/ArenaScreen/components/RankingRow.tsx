import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UserAvatar } from '../../../components/arena/UserAvatar';
import { ARENA_THEME as T } from '../../../constants/arenaTheme';
import type { SimulatorRankingEntry } from '../../../types/arena.types';

export type RankingRowProps = {
  entry: SimulatorRankingEntry;
  isCurrentUser?: boolean;
  useWeeklyPoints?: boolean;
  onPress?: () => void;
};

function RankDeltaIcon({ delta }: { delta?: SimulatorRankingEntry['rankDelta'] }) {
  if (delta === 'up') {
    return <Ionicons name="arrow-up" size={14} color={T.green} />;
  }
  if (delta === 'down') {
    return <Ionicons name="arrow-down" size={14} color="#e5382b" />;
  }
  return <Text style={styles.deltaStable}>—</Text>;
}

export const RankingRow = memo(function RankingRow({
  entry,
  isCurrentUser = false,
  useWeeklyPoints = false,
  onPress,
}: RankingRowProps) {
  const pts = useWeeklyPoints ? entry.weeklyPoints : entry.totalPoints;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, isCurrentUser && styles.rowMe]}
      accessibilityRole="button"
    >
      {isCurrentUser ? <View style={styles.meBar} /> : null}
      <Text style={[styles.rank, entry.rank <= 3 && styles.rankTop]}>#{entry.rank}</Text>
      <RankDeltaIcon delta={entry.rankDelta} />
      <UserAvatar
        userId={entry.userId}
        displayName={entry.displayName}
        countryCode={entry.country}
        photoUrl={entry.profilePhotoUrl}
        size={30}
      />
      <View style={styles.mid}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.displayName}
          </Text>
          {isCurrentUser ? (
            <View style={styles.toiBadge}>
              <Text style={styles.toiTxt}>TOI</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.meta}>
          {entry.country} · {entry.wins} victoire{entry.wins > 1 ? 's' : ''}
        </Text>
      </View>
      <Text style={styles.flag}>{entry.captainFlag}</Text>
      <Text style={styles.pts}>{pts.toLocaleString('fr-FR')}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  rowMe: { backgroundColor: 'rgba(41, 121, 255, 0.08)' },
  meBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: '#2979ff',
  },
  rank: {
    width: 32,
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 16,
    color: T.muted2,
  },
  rankTop: { color: T.gold },
  deltaStable: { width: 14, textAlign: 'center', color: T.muted, fontSize: 12 },
  mid: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 13, color: T.text, flexShrink: 1 },
  toiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#2979ff',
  },
  toiTxt: { fontSize: 8, fontFamily: 'Inter_800ExtraBold', color: T.text, letterSpacing: 0.5 },
  meta: { fontSize: 10, color: T.muted2, marginTop: 2, fontFamily: 'Inter_500Medium' },
  flag: { fontSize: 14 },
  pts: { fontFamily: 'Inter_800ExtraBold', fontSize: 12, color: T.purpleLight, minWidth: 44, textAlign: 'right' },
});
