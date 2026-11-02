import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ARENA_THEME as T } from '../../constants/arenaTheme';
import { useFullRanking } from '../../hooks/useFullRanking';
import { useUserStore } from '../../store/useUserStore';
import type { RankingFilter } from '../../types/arena.types';
import { RankingRow } from './components/RankingRow';

export default function FullRankingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const userId = useUserStore((s) => s.userId) || 'sim-harold';
  const userName = useUserStore((s) => s.name) || 'Joueur';
  const country = useUserStore((s) => s.countryCode) || 'FR';
  const [filter, setFilter] = useState<RankingFilter>('mondial');

  const FILTERS: { key: RankingFilter; label: string }[] = [
    { key: 'mondial', label: t('arena.mondial') },
    { key: 'nation', label: t('arena.myNation') },
    { key: 'friends', label: t('arena.friends') },
    { key: 'week', label: t('arena.thisWeek') },
  ];

  const { entries, myRanking, loading, loadingMore, hasMore, error, loadMore } = useFullRanking(
    filter,
    userId,
    userName,
    country
  );

  const userInList = entries.some((e) => e.userId === userId);
  const showSticky = myRanking && !userInList;

  const renderItem = useCallback(
    ({ item }: { item: (typeof entries)[number] }) => (
      <RankingRow
        entry={item}
        isCurrentUser={item.userId === userId}
        useWeeklyPoints={filter === 'week'}
      />
    ),
    [filter, userId]
  );

  const keyExtractor = useCallback((item: (typeof entries)[number]) => item.userId, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={T.text2} />
        </Pressable>
        <Text style={styles.title}>{t('arena.rankingTitle')}</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipOn]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterTxt, filter === f.key && styles.filterTxtOn]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={T.purple} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTxt}>{error}</Text>
        </View>
      ) : filter === 'friends' && entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTxt}>{t('arena.addFriends')}</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, showSticky && styles.listWithSticky]}
          onEndReached={() => {
            if (hasMore) void loadMore();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={T.purple} style={styles.footerLoader} />
            ) : null
          }
        />
      )}

      {showSticky && myRanking ? (
        <View style={styles.sticky}>
          <Text style={styles.stickyLbl}>{t('arena.myRank')}</Text>
          <Text style={styles.stickyVal}>
            #{myRanking.rank} {myRanking.displayName} ·{' '}
            {(filter === 'week' ? myRanking.weeklyPoints : myRanking.totalPoints).toLocaleString()}{' '}
            pts
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.border,
  },
  backPlaceholder: { width: 36 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 2,
    color: T.text,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.card,
  },
  filterChipOn: {
    borderColor: T.purple,
    backgroundColor: T.purple2,
  },
  filterTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: T.muted2 },
  filterTxtOn: { color: T.purpleLight },
  list: { paddingBottom: 16 },
  listWithSticky: { paddingBottom: 72 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTxt: { color: T.muted2, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  emptyTxt: { color: T.muted2, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  footerLoader: { paddingVertical: 16 },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: T.card,
    borderTopWidth: 1,
    borderTopColor: T.border,
    borderLeftWidth: 3,
    borderLeftColor: '#2979ff',
  },
  stickyLbl: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: T.muted2,
    letterSpacing: 1,
  },
  stickyVal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: T.text,
    marginTop: 4,
  },
});
