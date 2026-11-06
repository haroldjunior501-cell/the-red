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
import { useLiveMoments } from '../../hooks/useLiveMoments';
import { useTheRedHome } from '../../hooks/useTheRedHome';
import type { LiveFilterKey, LiveMatch } from '../../types/live.types';
import { LiveHeader } from './components/LiveHeader';
import { FeaturedMatch } from './components/FeaturedMatch';
import { MatchList } from './components/MatchList';
import { MostWatched } from './components/MostWatched';
import { MomentsPanel } from './components/MomentsPanel';
import { UpcomingMatchList } from './components/UpcomingMatchList';
import { EmptyState } from '../../components/EmptyState';
import { PremierLeagueTableCard } from '../home/components/PremierLeagueTableCard';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { UNITED_RED } from '../../constants/colors';
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

  const { leagueTable, loadingStatic } = useTheRedHome();
  const { moments } = useLiveMoments(matches);

  const openMatch = useCallback(
    (match: LiveMatch) => {
      navigation.navigate('MatchDetail', { match });
    },
    [navigation]
  );

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderMain = () => {
    if (loading && !matches.length && !upcomingMatches.length) {
      return (
        <View style={liveStyles.center}>
          <ActivityIndicator size="large" color={UNITED_RED} />
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

    if (filter === 'upcoming') {
      if (!upcomingMatches.length) {
        return (
          <EmptyState
            icon="📅"
            title="Aucun match à venir"
            subtitle="Le prochain match United apparaîtra ici."
            ctaLabel="Actualiser"
            onCta={refetch}
          />
        );
      }
      return (
        <UpcomingMatchList
          matches={upcomingMatches}
          loading={upcomingLoading}
          onMatchPress={openMatch}
        />
      );
    }

    if (status === 'empty' && !matches.length && !upcomingMatches.length) {
      return (
        <EmptyState
          icon="📺"
          title="Aucun match United"
          subtitle="Le programme de la saison sera synchronisé automatiquement."
          ctaLabel="Actualiser"
          onCta={refetch}
        />
      );
    }

    if (filter === 'live' && matches.length === 0) {
      return (
        <EmptyState
          icon="🔴"
          title="Pas de match en direct"
          subtitle="Dès qu’United joue, le score et la chronologie apparaîtront ici."
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
            engagement={
              engagementById[featuredMatch.id] ?? {
                viewerCount: 0,
                messageCount: 0,
                chaosLevel: 0,
              }
            }
            onPress={() => openMatch(featuredMatch)}
          />
        ) : null}
        <MatchList matches={otherMatches} engagementById={engagementById} onMatchPress={openMatch} />
      </View>
    );

    const right = (
      <View style={wide ? liveStyles.colRight : liveStyles.colStack}>
        <PremierLeagueTableCard table={leagueTable} loading={loadingStatic} />
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
    (loading && !matches.length && !upcomingMatches.length) ||
    status === 'error' ||
    (status === 'empty' && !upcomingMatches.length);

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
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor={UNITED_RED}
              colors={[UNITED_RED]}
            />
          }
        >
          <LiveHeader filter={filter} onFilter={setFilter} />
          {renderMain()}
        </ScrollView>
      </ScreenAmbience>
    </SafeAreaView>
  );
}
