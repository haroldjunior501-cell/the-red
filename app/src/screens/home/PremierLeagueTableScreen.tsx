import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { COLORS } from '../../constants/colors';
import { FOTMOB_MU_TEAM_ID } from '../../constants/fotmobTheRed';
import { useTheRedHome } from '../../hooks/useTheRedHome';
import { plDisplayName } from '../../utils/plTableWindow';

const PL_LOGO = 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png';

function gdLabel(gd: number): string {
  if (gd > 0) return `+${gd}`;
  return String(gd);
}

export default function PremierLeagueTableScreen() {
  const navigation = useNavigation();
  const { leagueTable, loadingStatic } = useTheRedHome();

  const rows = useMemo(
    () =>
      leagueTable.map((r, i) => ({
        ...r,
        rank: i + 1,
        isUnited: r.id === String(FOTMOB_MU_TEAM_ID),
      })),
    [leagueTable]
  );

  return (
    <ScreenAmbience>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </Pressable>
          <Image source={{ uri: PL_LOGO }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Premier League</Text>
        </View>

        <View style={styles.colHead}>
          <Text style={[styles.colLabel, { flex: 1, marginLeft: 48 }]}>Team</Text>
          <Text style={styles.colNum}>P</Text>
          <Text style={styles.colNum}>W</Text>
          <Text style={styles.colNum}>D</Text>
          <Text style={styles.colNum}>L</Text>
          <Text style={styles.colNum}>GD</Text>
          <Text style={[styles.colNum, { width: 36 }]}>Pts</Text>
        </View>

        {loadingStatic && rows.length === 0 ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {rows.map((row) => (
              <View key={row.id} style={[styles.row, row.isUnited && styles.rowUnited]}>
                {row.isUnited ? (
                  <LinearGradient
                    colors={['rgba(218,41,28,0.22)', 'rgba(0,0,0,0.35)']}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
                <Text style={[styles.rank, row.isUnited && styles.rankHi]}>{row.rank}</Text>
                {row.logo ? (
                  <Image source={{ uri: row.logo }} style={styles.crest} resizeMode="contain" />
                ) : (
                  <View style={[styles.crest, styles.crestPh]} />
                )}
                <Text style={[styles.name, row.isUnited && styles.nameHi]} numberOfLines={1}>
                  {plDisplayName(row)}
                </Text>
                <Text style={styles.cell}>{row.played}</Text>
                <Text style={styles.cell}>{row.wins}</Text>
                <Text style={styles.cell}>{row.draws}</Text>
                <Text style={styles.cell}>{row.losses}</Text>
                <Text style={styles.cell}>{gdLabel(row.gd)}</Text>
                <Text style={[styles.cell, styles.pts]}>{row.pts}</Text>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenAmbience>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  back: { padding: 4 },
  logo: { width: 26, height: 26 },
  title: {
    fontFamily: 'Georgia',
    fontSize: 22,
    color: '#fff',
    flex: 1,
  },
  colHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  colLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  colNum: {
    width: 28,
    textAlign: 'right',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  list: { paddingHorizontal: 12, paddingTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 2,
    overflow: 'hidden',
  },
  rowUnited: {
    borderWidth: 1,
    borderColor: 'rgba(218,41,28,0.4)',
  },
  rank: {
    width: 26,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  rankHi: { color: COLORS.gold, fontFamily: 'Inter_800ExtraBold' },
  crest: { width: 22, height: 22, marginRight: 8 },
  crestPh: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 11 },
  name: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
  },
  nameHi: { color: '#fff', fontFamily: 'Inter_800ExtraBold' },
  cell: {
    width: 28,
    textAlign: 'right',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontVariant: ['tabular-nums'],
  },
  pts: {
    width: 36,
    fontFamily: 'Inter_800ExtraBold',
    color: '#fff',
  },
});
