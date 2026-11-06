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
import { COLORS } from '../../constants/colors';
import { useUnitedPlayerStatRanking } from '../../hooks/useUnitedPlayerStatRanking';
import { assignDisplayRanks } from '../../utils/statsRank';
import { PlayerAvatar } from './components/PlayerAvatar';

type Row = { name: string; team: string; photo?: string; value: number };

export default function PlayerStatsRankingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'PlayerStatsRanking' | 'TopScorers'>>();
  const stat: PlayerStatKind = route.params?.stat ?? 'goals';
  const title = playerStatTitle(stat);

  const { rows: raw, loading } = useUnitedPlayerStatRanking(stat, 30);
  const rows = useMemo(
    (): Row[] =>
      raw.map((r) => ({
        name: r.name,
        team: r.team,
        photo: r.photo,
        value: r.value,
      })),
    [raw]
  );
  const ranked = useMemo(() => assignDisplayRanks(rows, (r) => r.value), [rows]);
  const top1 = ranked[0];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#1c0a0e', '#0c0507']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
        </Pressable>
        <View style={styles.titleCol}>
          <Text style={styles.eyebrow}>MANCHESTER UNITED</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 40 }} />
        ) : ranked.length === 0 ? (
          <Text style={styles.empty}>Classement indisponible pour le moment.</Text>
        ) : (
          <>
            {top1 ? (
              <View style={styles.hero}>
                <PlayerAvatar photo={top1.photo} size={80} />
                <Text style={styles.heroKicker}>#1</Text>
                <Text style={styles.heroName}>{top1.name}</Text>
                <Text style={styles.heroTeam}>{top1.team}</Text>
                <Text style={styles.heroVal}>{top1.value}</Text>
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
                  <Text style={styles.team} numberOfLines={1}>
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
  safe: { flex: 1, backgroundColor: COLORS.bgDeep },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backBtn: { width: 40, alignItems: 'center' },
  titleCol: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1.6,
    color: COLORS.gold,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 2,
    color: '#fff',
  },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  empty: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Inter_600SemiBold',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    backgroundColor: COLORS.primaryFillSoft,
  },
  heroKicker: {
    marginTop: 8,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: COLORS.gold,
    letterSpacing: 2,
  },
  heroName: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 20,
    color: '#fff',
    marginTop: 4,
  },
  heroTeam: { color: COLORS.textMuted, marginTop: 2, fontSize: 13 },
  heroVal: {
    marginTop: 8,
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 32,
    color: COLORS.primaryLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  rank: {
    width: 28,
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    color: COLORS.textMuted,
  },
  mid: { flex: 1, minWidth: 0 },
  name: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 },
  team: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  val: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    color: COLORS.gold,
    minWidth: 40,
    textAlign: 'right',
  },
});
