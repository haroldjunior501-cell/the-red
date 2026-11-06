import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMatchDetails } from '../../hooks/useMatchDetails';
import { useTheRedHome } from '../../hooks/useTheRedHome';
import { mergePremiumEvents } from '../../utils/liveMatchEventMap';
import type { LiveStackParamList } from '../../navigation/LiveStack';
import { PremierLeagueTableCard } from '../home/components/PremierLeagueTableCard';
import { LiveH2HPanel } from './components/matchDetail/LiveH2HPanel';
import { LiveLineupsPanel } from './components/matchDetail/LiveLineupsPanel';
import { LiveMatchBanner } from './components/matchDetail/LiveMatchBanner';
import { LivePitchPanel } from './components/matchDetail/LivePitchPanel';
import { LiveStatsPanel } from './components/matchDetail/LiveStatsPanel';
import { MatchDetailTabs, type MatchDetailTabKey } from './components/matchDetail/MatchDetailTabs';
import { LiveEventsTimeline } from './components/matchEvents/LiveEventsTimeline';
import { DS } from './LiveScreen.styles';
import { UNITED_RED } from '../../constants/colors';

export default function MatchDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LiveStackParamList, 'MatchDetail'>>();
  const baseMatch = route.params.match;
  const { bundle, premiumEvents, parsedStats, h2hDetail, h2hLoading, liveScore, loading, error } =
    useMatchDetails(baseMatch);
  const { leagueTable, loadingStatic } = useTheRedHome();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<MatchDetailTabKey>('match');
  const [statsOpen, setStatsOpen] = useState(false);

  const match = useMemo(() => {
    if (!liveScore) return baseMatch;
    return {
      ...baseMatch,
      home_score: liveScore.home,
      away_score: liveScore.away,
      minute: liveScore.minute || baseMatch.minute,
      status: liveScore.status || baseMatch.status,
    };
  }, [baseMatch, liveScore]);

  const events = useMemo(
    () => mergePremiumEvents(premiumEvents, match.events),
    [premiumEvents, match.events]
  );

  const showStatsInline = statsOpen && tab === 'match';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={UNITED_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {match.status === 'upcoming'
            ? 'Présentation'
            : match.status === 'finished'
              ? 'Match terminé'
              : 'Match live'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <LiveMatchBanner
        match={match}
        statsOpen={statsOpen}
        onToggleStats={() => setStatsOpen((v) => !v)}
      />

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {tab === 'match' ? (
        <ScrollView
          style={styles.matchScroll}
          contentContainerStyle={{ paddingBottom: 12 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <LivePitchPanel match={match} stats={parsedStats} events={events} />
          {showStatsInline && parsedStats ? (
            <View style={styles.inlineStats}>
              <LiveStatsPanel
                stats={parsedStats}
                loading={false}
                homeName={match.home_name}
                awayName={match.away_name}
              />
            </View>
          ) : null}
          <LiveEventsTimeline events={events} loading={loading} />
        </ScrollView>
      ) : (
        <View style={[styles.body, { paddingBottom: insets.bottom }]}>
          {tab === 'stats' ? (
            <LiveStatsPanel
              stats={parsedStats}
              loading={loading}
              homeName={match.home_name}
              awayName={match.away_name}
            />
          ) : null}

          {tab === 'h2h' ? (
            <LiveH2HPanel
              detail={h2hDetail}
              homeName={match.home_name}
              awayName={match.away_name}
              loading={h2hLoading}
            />
          ) : null}

          {tab === 'standings' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.standingsWrap}>
              <PremierLeagueTableCard table={leagueTable} loading={loadingStatic} />
            </ScrollView>
          ) : null}

          {tab === 'lineups' ? (
            <LiveLineupsPanel
              lineups={bundle.lineups}
              homeName={match.home_name}
              awayName={match.away_name}
            />
          ) : null}
        </View>
      )}

      <MatchDetailTabs active={tab} onChange={setTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
  },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 16 },
  err: { color: DS.red, textAlign: 'center', fontSize: 12, paddingVertical: 8 },
  matchScroll: { flex: 1 },
  inlineStats: { maxHeight: 240, borderBottomWidth: 1, borderBottomColor: DS.border },
  body: { flex: 1, minHeight: 120 },
  standingsWrap: { padding: 12 },
});
