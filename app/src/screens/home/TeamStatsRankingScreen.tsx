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
import { flagEmoji } from '../../constants/mapHub';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { TeamStatKind } from '../../constants/homeStats';
import { teamStatTitle } from '../../constants/homeStats';
import { useTeamStatsRanking } from '../../hooks/useTeamStatsRanking';
import { teamStatFootnote } from '../../services/teamStatsRanking';
import { assignDisplayRanks } from '../../utils/statsRank';

const DS = {
  bg: '#060d1a',
  green: '#2979ff',
  gray: '#8896ab',
  border: 'rgba(255,255,255,0.1)',
} as const;

export default function TeamStatsRankingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'TeamStatsRanking'>>();
  const stat: TeamStatKind = route.params?.stat ?? 'goals';
  const title = teamStatTitle(stat);
  const footnote = teamStatFootnote(stat);

  const { rows, loading } = useTeamStatsRanking(stat, 40);
  const ranked = useMemo(() => assignDisplayRanks(rows, (r) => r.value), [rows]);

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
        {footnote ? <Text style={styles.note}>{footnote}</Text> : null}
        {loading ? (
          <ActivityIndicator color={DS.green} style={{ marginVertical: 40 }} />
        ) : ranked.length === 0 ? (
          <Text style={styles.empty}>Classement équipes indisponible.</Text>
        ) : (
          ranked.map((row) => (
            <View key={`${row.countryCode}-${row.teamName}`} style={styles.row}>
              <Text style={styles.rank}>{row.displayRank}</Text>
              <Text style={styles.flag}>{flagEmoji(row.countryCode)}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {row.teamName}
              </Text>
              <Text style={styles.val}>{row.value}</Text>
            </View>
          ))
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
    marginLeft: 4,
  },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  note: { color: DS.gray, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
  },
  rank: { width: 28, color: 'rgba(255,255,255,0.55)', fontSize: 16, fontWeight: '700' },
  flag: { fontSize: 28, width: 36, textAlign: 'center' },
  name: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '700' },
  val: { color: '#fff', fontSize: 22, fontWeight: '800', minWidth: 40, textAlign: 'right' },
  empty: { color: DS.gray, fontSize: 14, textAlign: 'center', marginTop: 32 },
});
