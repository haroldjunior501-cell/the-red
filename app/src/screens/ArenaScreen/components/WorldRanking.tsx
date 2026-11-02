import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ARENA_THEME as T } from '../../../constants/arenaTheme';
import type { RankingFilter, SimulatorRankingEntry } from '../../../types/arena.types';
import { arenaStyles } from '../ArenaScreen.styles';
import { RankingRow } from './RankingRow';

// Filters are built inside the component to use translations

type Props = {
  filter: RankingFilter;
  onFilterChange: (f: RankingFilter) => void;
  entries: SimulatorRankingEntry[];
  loading: boolean;
  currentUserId: string;
  totalCount: number;
  onOpenFull: () => void;
};

export const WorldRanking = memo(function WorldRanking({
  filter,
  onFilterChange,
  entries,
  loading,
  currentUserId,
  totalCount,
  onOpenFull,
}: Props) {
  const { t } = useTranslation();
  const others = Math.max(0, totalCount - entries.length);

  const FILTERS: { key: RankingFilter; label: string }[] = [
    { key: 'mondial', label: t('arena.mondial') },
    { key: 'nation', label: t('arena.myNation') },
    { key: 'friends', label: t('arena.friends') },
    { key: 'week', label: t('arena.thisWeek') },
  ];

  return (
    <View style={arenaStyles.section}>
      <Text style={arenaStyles.sectionTitle}>{t('arena.worldRanking')}</Text>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipOn]}
            onPress={() => onFilterChange(f.key)}
          >
            <Text style={[styles.chipTxt, filter === f.key && styles.chipTxtOn]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={arenaStyles.card}>
        {loading ? (
          <ActivityIndicator color={T.purple} style={{ padding: 16 }} />
        ) : entries.length === 0 ? (
          <Text style={styles.empty}>
            {filter === 'friends' ? t('arena.addFriends') : t('arena.noParticipants')}
          </Text>
        ) : (
          entries.map((entry) => (
            <RankingRow
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === currentUserId}
              useWeeklyPoints={filter === 'week'}
              onPress={onOpenFull}
            />
          ))
        )}
        <Pressable style={[arenaStyles.linkBtn, styles.linkRow]} onPress={onOpenFull}>
          <Text style={arenaStyles.linkBtnTxt}>
            {others > 0 ? t('arena.seeOthers', { count: others.toLocaleString() }) : t('arena.seeAll')}
          </Text>
          <Ionicons name="arrow-forward" size={12} color={T.purpleLight} />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.card,
  },
  chipOn: { borderColor: T.purple, backgroundColor: T.purple2 },
  chipTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: T.muted2 },
  chipTxtOn: { color: T.purpleLight },
  empty: { textAlign: 'center', padding: 14, color: T.muted2, fontFamily: 'Inter_500Medium', fontSize: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
