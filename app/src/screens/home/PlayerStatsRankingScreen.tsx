import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { PlayerStatKind } from '../../constants/homeStats';
import { playerStatTitle } from '../../constants/homeStats';
import { useTopAssisters } from '../../hooks/useTopAssisters';
import { useTopScorers } from '../../hooks/useTopScorers';
import { assignDisplayRanks } from '../../utils/statsRank';
import { PlayerAvatar } from './components/PlayerAvatar';

const DS = {
  bg: '#060d1a',
  green: '#2979ff',
  gold: '#bfa968',
  gray: '#8896ab',
  border: 'rgba(255,255,255,0.1)',
} as const;

type Row = { name: string; team: string; photo?: string; value: number };

function usePlayerRows(stat: PlayerStatKind, limit: number) {
  const scorers = useTopScorers(limit);
  const assisters = useTopAssisters(limit);

  const rows = useMemo((): Row[] => {
    if (stat === 'goals') {
      return scorers.rows.map((r) => ({ name: r.name, team: r.team, photo: r.photo, value: r.goals }));
    }
    if (stat === 'assists') {
      return assisters.rows.map((r) => ({ name: r.name, team: r.team, photo: r.photo, value: r.assists }));
    }
    return scorers.rows.map((r) => ({ name: r.name, team: r.team, photo: r.photo, value: 0 }));
  }, [assisters.rows, scorers.rows, stat]);

  const loading = stat === 'assists' ? assisters.loading : scorers.loading;
  const unavailable = stat !== 'goals' && stat !== 'assists';

  return { rows, loading, unavailable };
}

export default function PlayerStatsRankingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'PlayerStatsRanking' | 'TopScorers'>>();
  const stat: PlayerStatKind = route.params?.stat ?? 'goals';
  const title = playerStatTitle(stat);

  const { rows, loading, unavailable } = usePlayerRows(stat, 30);
  const ranked = useMemo(() => assignDisplayRanks(rows, (r) => r.value), [rows]);
  const top1 = ranked[0];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0a1830', '#060d1a']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={DS.green} style={{ marginVertical: 40 }} />
        ) : unavailable ? (
          <Text style={styles.empty}>
            Statistique « {title} » bientôt disponible pour la compétition.
          </Text>
        ) : ranked.length === 0 ? (
          <Text style={styles.empty}>Classement indisponible pour le moment.</Text>
        ) : (
          <>
            {stat === 'goals' && top1 ? (
              <View style={styles.hero}>
                <PlayerAvatar photo={top1.photo} size={80} />
                <Text style={styles.heroKicker}>#1</Text>
                <Text style={styles.heroName}>{top1.name}</Text>
                <Text style={styles.heroTeam}>{top1.team}</Text>
              </View>
            ) : null}

            {ranked.map((row) => (
              <View key={`${row.name}-${row.displayRank}`} style={styles.row}>
                <Text style={styles.rank}>{row.displayRank}</Text>
                <PlayerAvatar photo={row.photo} size={44} />
                <View style={styles.mid}>
                  <Text style={styles.name} numberOfLines={1}>
                    {row.name}
                  </Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    {row.team}
                  </Text>
                </View>
                <Text style={styles.val}>{row.value}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    color: '#fff',
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 40,
    letterSpacing: 0.5,
    textAlign: 'left',
    marginLeft: 4,
  },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 20, marginBottom: 12, gap: 6 },
  heroKicker: { color: DS.gold, fontWeight: '800', fontSize: 12, letterSpacing: 1.2, marginTop: 8 },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  heroTeam: { color: DS.gray, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
  },
  rank: { width: 28, color: 'rgba(255,255,255,0.55)', fontSize: 16, fontWeight: '700' },
  mid: { flex: 1, minWidth: 0 },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sub: { color: DS.gray, fontSize: 13, marginTop: 3 },
  val: { color: '#fff', fontSize: 22, fontWeight: '800', minWidth: 36, textAlign: 'right' },
  empty: { color: DS.gray, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 32, paddingHorizontal: 12 },
});
