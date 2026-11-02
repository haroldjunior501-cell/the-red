import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import MatchDetailsScreen from '../screens/home/MatchDetailsScreen';
import PreMatchScreen from '../screens/home/PreMatchScreen';
import PlayHubScreen from '../screens/home/PlayHubScreen';
import TopScorersScreen from '../screens/home/TopScorersScreen';
import PlayerStatsRankingScreen from '../screens/home/PlayerStatsRankingScreen';
import TeamStatsRankingScreen from '../screens/home/TeamStatsRankingScreen';
import StatsHubScreen from '../screens/home/StatsHubScreen';
import ImmanquableAllScreen from '../screens/home/ImmanquableAllScreen';
import TikTokVideoScreen from '../screens/home/TikTokVideoScreen';
import MomentsFortsAllScreen from '../screens/home/MomentsFortsAllScreen';
import MomentsFortsVideoScreen from '../screens/home/MomentsFortsVideoScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AccountSettingsScreen from '../screens/ProfileScreen/AccountSettingsScreen';
import LegalDocumentScreen from '../screens/ProfileScreen/LegalDocumentScreen';
import type { LegalDocumentKey } from '../constants/legalUrls';
import type { PlayerStatKind, TeamStatKind } from '../constants/homeStats';
import TableauScreen from '../screens/TableauScreen';
import PronosScreen from '../screens/PronosScreen';
import ArenaScreen from '../screens/ArenaScreen';
import FullRankingScreen from '../screens/ArenaScreen/FullRankingScreen';
import MatchDetailScreen from '../screens/ArenaScreen/MatchDetailScreen';

export type HomeStackParamList = {
  HomeFeed: undefined;
  MatchDetails: {
    fixtureId?: string;
    selfCode?: string;
    oppCode?: string;
    homeName?: string;
    awayName?: string;
    homeId?: string;
    awayId?: string;
    homeLogo?: string;
    awayLogo?: string;
    date?: string;
    venue?: string;
    phase?: string;
  };
  PreMatch: { fixtureId?: string } | undefined;
  PlayHub: undefined;
  Tableau: undefined;
  Pronos: undefined;
  Arena: undefined;
  FullRanking: undefined;
  MatchDetail: undefined;
  TopScorers: { stat: PlayerStatKind };
  StatsHub: undefined;
  MomentsFortsAll: undefined;
  MomentsFortsFeed: { startIndex: number; videoId?: string };
  ImmanquableAll: undefined;
  ImmanquableFeed: { startIndex: number; videoId?: string };
  Profile: undefined;
  AccountSettings: undefined;
  LegalDocument: { url: string; title: string; legalKey?: LegalDocumentKey };
  PlayerStatsRanking: { stat: PlayerStatKind };
  TeamStatsRanking: { stat: TeamStatKind };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0c0507' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
      <Stack.Screen name="PreMatch" component={PreMatchScreen} />
      <Stack.Screen name="PlayHub" component={PlayHubScreen} />
      <Stack.Screen name="Tableau" component={TableauScreen} />
      <Stack.Screen name="Pronos" component={PronosScreen} />
      <Stack.Screen name="Arena" component={ArenaScreen} />
      <Stack.Screen name="FullRanking" component={FullRankingScreen} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <Stack.Screen name="TopScorers" component={TopScorersScreen} initialParams={{ stat: 'goals' }} />
      <Stack.Screen name="PlayerStatsRanking" component={PlayerStatsRankingScreen} />
      <Stack.Screen name="TeamStatsRanking" component={TeamStatsRankingScreen} />
      <Stack.Screen name="StatsHub" component={StatsHubScreen} />
      <Stack.Screen name="MomentsFortsAll" component={MomentsFortsAllScreen} />
      <Stack.Screen
        name="MomentsFortsFeed"
        component={MomentsFortsVideoScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ImmanquableAll" component={ImmanquableAllScreen} />
      <Stack.Screen
        name="ImmanquableFeed"
        component={TikTokVideoScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="LegalDocument" component={LegalDocumentScreen} />
    </Stack.Navigator>
  );
}
