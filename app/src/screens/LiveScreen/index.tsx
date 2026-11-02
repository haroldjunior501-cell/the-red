import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { LiveStackParamList } from '../../navigation/LiveStack';
import { useLiveMatches } from '../../hooks/useLiveMatches';
import { useLiveAllGroups } from '../../hooks/useLiveAllGroups';
import { useLiveMoments } from '../../hooks/useLiveMoments';
import { useLiveStandings } from '../../hooks/useLiveStandings';
import type { LiveFilterKey, LiveMatch } from '../../types/live.types';
import { LiveHeader } from './components/LiveHeader';
import { FeaturedMatch } from './components/FeaturedMatch';
import { MatchList } from './components/MatchList';
import { StandingsPanel } from './components/StandingsPanel';
import { MostWatched } from './components/MostWatched';
import { MomentsPanel } from './components/MomentsPanel';
import { UpcomingMatchList } from './components/UpcomingMatchList';
import { AllGroupsPanel } from './components/AllGroupsPanel';
import { EmptyState } from '../../components/EmptyState';
import { WC_2026_FIRST_MATCH_LABEL } from '../../constants/worldCupLaunch';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { LIVE_TAB_BAR_HEIGHT, liveStyles } from './LiveScreen.styles';

type Nav = StackNavigationProp<LiveStackParamList, 'LiveHome'>;

export default function LiveScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<LiveFilterKey>('all');
  const { width } = Dimensions.get('window');
  const wide = width >= 768;
  const scrollBottomPad = LIVE_TAB_BAR_HEIGHT + insets.bottom + 20;

  const {
    featuredMatch,
    otherMatches,
    matches,
    upcomingMatches,
    engagementById,
    loading,
    upcomingLoading,
    status,
    error,
    refetch,
  } = useLiveMatches(filter);

  const { groups, loading: groupsLoading, error: groupsError, refetch: refetchGroups } = useLiveAllGroups(
    filter === 'groupes'
  );

  const groupName = featuredMatch?.group ?? 'Group A';
  const { standings, loading: standingsLoading, groupLetter } = useLiveStandings(groupName);
  const { moments } = useLiveMoments(matches);

  const openMatch = useCallback(
    (match: LiveMatch) => {
      navigation.navigate('MatchDetail', { match });
    },
    [navigation]
  );

  const onRefresh = useCallback(() => {
    refetch();
    if (filter === 'groupes') refetchGroups();
  }, [filter, refetch, refetchGroups]);

  const renderMain = () => {
    if (filter === 'groupes') {
      return <AllGroupsPanel groups={groups} loading={groupsLoading} error={groupsError} />;
    }

    if (status === 'disabled') {
      return (
        <View style={liveStyles.center}>
          <Text style={liveStyles.centerText}>
            Le flux live sera disponible très bientôt. En attendant, consulte les pronos et le programme.
          </Text>
        </View>
      );
    }

    if (loading && !matches.length && !upcomingMatches.length) {
      return (
        <View style={liveStyles.center}>
          <ActivityIndicator size="large" color="#5b9aff" />
        </View>
      );
    }

    if (status === 'error') {
      return (
        <View style={liveStyles.center}>
          <Text style={liveStyles.errorText}>{error}</Text>
          <TouchableOpacity style={liveStyles.retryBtn} onPress={refetch}>
            <Text style={liveStyles.retryTxt}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === 'upcoming' || (status === 'empty' && upcomingMatches.length > 0)) {
      return (
        <UpcomingMatchList
          matches={upcomingMatches}
          loading={upcomingLoading}
          onMatchPress={openMatch}
        />
      );
    }

    if (status === 'empty') {
      const nextLabel =
        upcomingMatches[0]?.kickoff_label ??
        `Coupe du Monde · ${WC_2026_FIRST_MATCH_LABEL}`;
      return (
        <EmptyState
          icon="📺"
          title="Aucun match en cours"
          subtitle={`Prochain match : ${nextLabel}`}
          ctaLabel="Actualiser"
          onCta={refetch}
        />
      );
    }

    const left = (
      <View style={wide ? liveStyles.colLeft : liveStyles.colStack}>
        {featuredMatch ? (
          <FeaturedMatch
            match={featuredMatch}
            engagement={engagementById[featuredMatch.id] ?? { viewerCount: 0, messageCount: 0, chaosLevel: 0 }}
            onPress={() => openMatch(featuredMatch)}
          />
        ) : null}
        <MatchList matches={otherMatches} engagementById={engagementById} onMatchPress={openMatch} />
      </View>
    );

    const right = (
      <View style={wide ? liveStyles.colRight : liveStyles.colStack}>
        <StandingsPanel standings={standings} loading={standingsLoading} groupLetter={groupLetter} />
        <MostWatched matches={matches} engagementById={engagementById} />
        <MomentsPanel moments={moments} />
      </View>
    );

    return wide ? (
      <View style={liveStyles.rowLayout}>
        {left}
        {right}
      </View>
    ) : (
      <>
        {left}
        {right}
      </>
    );
  };

  const scrollFillsViewport =
    filter !== 'groupes' &&
    (status === 'disabled' ||
      (loading && !matches.length && !upcomingMatches.length) ||
      status === 'error' ||
      (status === 'empty' && upcomingMatches.length === 0));

  return (
    <SafeAreaView style={liveStyles.safe} edges={['top']}>
      <ScreenAmbience style={{ flex: 1 }}>
        <ScrollView
          style={liveStyles.scroll}
          contentContainerStyle={[
            liveStyles.body,
            { paddingBottom: scrollBottomPad },
            scrollFillsViewport && liveStyles.bodyGrow,
          ]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={loading || groupsLoading} onRefresh={onRefresh} tintColor="#5b9aff" />
          }
        >
          <LiveHeader filter={filter} onFilter={setFilter} />
          {renderMain()}
        </ScrollView>
      </ScreenAmbience>
    </SafeAreaView>
  );
}
