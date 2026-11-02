import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { useNationPower } from '../../hooks/useNationPower';
import { useTableau } from '../../hooks/useTableau';
import { useWorldRanking } from '../../hooks/useWorldRanking';
import { useUserStore } from '../../store/useUserStore';
import type { TableauTabKey } from '../../utils/tableauBracket';
import { buildCountryPath, pathPicksAnswered } from '../../utils/countryPath';
import { GroupPhaseSection } from './components/GroupPhaseSection';
import { CountryPathTab } from './components/CountryPathTab';
import { TableauApercuTab } from './components/TableauApercuTab';
import { TableauClassementTab } from './components/TableauClassementTab';
import { TableauTopTabs } from './components/TableauTopTabs';
import { tableauStyles as s } from './TableauScreen.styles';

export default function TableauScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const kdo = useUserStore((st) => st.kdo);
  const countryCode = useUserStore((st) => st.countryCode);
  const [tab, setTab] = useState<TableauTabKey>('elimination');
  const { ranking, loading: rankingLoading } = useWorldRanking(48);
  const { worldRank, power: nationPower } = useNationPower();

  const {
    bracketRounds,
    groups,
    predictions,
    loading,
    saving,
    error,
    submittedAt,
    pickWinner,
    validate,
    fixtures,
    countryCode: tableauCountry,
  } = useTableau();

  const countryPath = useMemo(() => buildCountryPath(fixtures, tableauCountry), [fixtures, tableauCountry]);
  const pathStepsTotal = countryPath.length;
  const pathPicks = useMemo(() => pathPicksAnswered(countryPath, predictions), [countryPath, predictions]);

  const stats = useMemo(
    () => ({
      points: kdo,
      goodPicks: pathPicks,
      podiums: 0,
      accuracy: pathStepsTotal > 0 ? Math.round((pathPicks / pathStepsTotal) * 100) : 0,
    }),
    [kdo, pathPicks, pathStepsTotal],
  );

  const pickPathWinner = useCallback(
    (matchId: string, round: import('../../types/games.types').BracketRound, team: { code: string; name: string }) => {
      pickWinner(matchId, round, team.code, team.name);
    },
    [pickWinner],
  );

  const onTab = useCallback(
    (key: TableauTabKey) => {
      if (key === 'pronos') {
        navigation.navigate('Pronos');
        return;
      }
      setTab(key);
    },
    [navigation],
  );

  const goElimination = useCallback(() => setTab('elimination'), []);

  const renderTabBody = () => {
    if (loading) {
      return (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2979ff" />
        </View>
      );
    }

    switch (tab) {
      case 'apercu':
        return (
          <TableauApercuTab
            picksCount={pathPicks}
            totalMatches={pathStepsTotal}
            submitted={!!submittedAt}
            stats={stats}
            saving={saving}
            onValidate={() => void validate()}
            onScrollToBracket={goElimination}
          />
        );
      case 'groupes':
        return <GroupPhaseSection groups={groups} />;
      case 'elimination':
        return (
          <CountryPathTab
            countryCode={tableauCountry}
            fixtures={fixtures}
            rounds={bracketRounds}
            predictions={predictions}
            saving={saving}
            submittedAt={submittedAt}
            onPickWinner={pickPathWinner}
            onValidate={() => void validate()}
          />
        );
      case 'classement':
        return (
          <TableauClassementTab
            ranking={ranking}
            loading={rankingLoading}
            highlightCode={countryCode}
            userRank={worldRank}
            userPower={nationPower?.power}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenAmbience style={{ flex: 1 }}>
      <View style={s.header}>
        <Pressable style={s.back} onPress={() => navigation.goBack()} accessibilityLabel="Retour">
          <MaterialCommunityIcons name="chevron-left" size={28} color="#e4e9f2" />
        </Pressable>
        <Text style={s.title}>TABLEAU</Text>
        <View style={s.headerSpacer} />
      </View>

      <TableauTopTabs active={tab} onSelect={onTab} />
      <View style={s.separator} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error ? <Text style={s.err}>{error}</Text> : null}
        {renderTabBody()}
      </ScrollView>
      </ScreenAmbience>
    </SafeAreaView>
  );
}
