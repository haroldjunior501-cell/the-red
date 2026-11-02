import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ARENA_THEME as T } from '../../constants/arenaTheme';
import { useSimulator } from '../../hooks/useSimulator';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import {
  navigateToFantasy,
  navigateToFullRanking,
  navigateToMatchDetail,
} from '../../navigation/navigateToArena';
import type { RankingFilter } from '../../types/arena.types';
import { arenaStyles } from './ArenaScreen.styles';
import { HeroBanner } from './components/HeroBanner';
import { LiveMatchCard } from './components/LiveMatchCard';
import { LockBar } from './components/LockBar';
import { MyProgressionCard } from './components/MyProgressionCard';
import { MyScoreCard } from './components/MyScoreCard';
import { PerformancesCard } from './components/PerformancesCard';
import { RewardsCard } from './components/RewardsCard';
import { WorldRanking } from './components/WorldRanking';

export default function ArenaScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const [rankingFilter, setRankingFilter] = useState<RankingFilter>('mondial');
  const sim = useSimulator(rankingFilter);

  const openFantasy = useCallback(() => navigateToFantasy(navigation), [navigation]);
  const openRanking = useCallback(() => navigateToFullRanking(navigation), [navigation]);
  const openMatch = useCallback(() => navigateToMatchDetail(navigation), [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={T.text2} />
        </Pressable>
        <View style={styles.brand}>
          <Text style={styles.logo}>GOALYA</Text>
          <Text style={styles.arenaLbl}>SIMULATOR</Text>
        </View>
        <View style={styles.headerRight}>
          <MaterialCommunityIcons name="bell-outline" size={20} color={T.text2} />
        </View>
      </View>

      <ScrollView
        style={arenaStyles.scroll}
        contentContainerStyle={arenaStyles.pad}
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner countdown={sim.countdown} lineup={sim.heroLineup} />
        <LockBar access={sim.access} onManageTeam={openFantasy} />

        {sim.loading ? (
          <ActivityIndicator color={T.purple} style={{ marginVertical: 16 }} />
        ) : null}

        <MyScoreCard
          score={sim.score}
          captain={sim.captain}
          leaderProgress={sim.leaderProgress}
        />
        <MyProgressionCard
          entries={sim.historyEntries}
          stats={sim.historyStats}
          onEntryPress={() => openMatch()}
          onViewAll={openRanking}
        />
        {sim.match ? (
          <LiveMatchCard
            match={sim.match}
            userId={sim.userId}
            userName={sim.userName}
            userCountry={sim.countryCode}
            onOpenMatch={openMatch}
          />
        ) : null}
        <PerformancesCard events={sim.events} onViewAll={openMatch} />
        <WorldRanking
          filter={rankingFilter}
          onFilterChange={setRankingFilter}
          entries={sim.rankingPreview}
          loading={sim.rankingLoading}
          currentUserId={sim.userId}
          totalCount={sim.rankingTotalCount}
          onOpenFull={openRanking}
        />
        <RewardsCard rewards={sim.rewards} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  brand: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  logo: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 3,
    color: T.text,
  },
  arenaLbl: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 11,
    color: T.purpleLight,
    letterSpacing: 2,
  },
  headerRight: { padding: 8 },
});
