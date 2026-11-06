import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { PRONO_COLORS as C } from '../../constants/pronosColors';
import { useFirebaseAuthUid } from '../../hooks/useFirebaseAuthUid';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { fetchFanStandings } from '../../services/unitedGamesService';
import type { UnitedFanStanding } from '../../types/unitedGames.types';

const F = {
  bebas: 'BebasNeue_400Regular' as const,
  i600: 'Inter_600SemiBold' as const,
  i700: 'Inter_700Bold' as const,
  i800: 'Inter_800ExtraBold' as const,
};

export default function UnitedStandingsScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const uid = useFirebaseAuthUid();
  const [period, setPeriod] = useState<'monthly' | 'season'>('monthly');
  const [rows, setRows] = useState<UnitedFanStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await fetchFanStandings(period, 50);
    setRows(list);
  }, [period]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <ScreenAmbience>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={C.text2} />
          </Pressable>
          <Text style={styles.title}>CLASSEMENT FANS</Text>
        </View>
        <Text style={styles.sub}>
          Points Hommes + Femmes combinés. Top mensuel · bon £100 boutique · saison · £500.
        </Text>

        <View style={styles.segRow}>
          {(['monthly', 'season'] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.seg, period === p && styles.segOn]}
            >
              <Text style={[styles.segT, period === p && styles.segTOn]}>
                {p === 'monthly' ? 'Mensuel' : 'Saison'}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={C.blue} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blue} />}
          >
            {rows.length === 0 ? (
              <Text style={styles.empty}>Pas encore de classements — joue aux pronos pour apparaître.</Text>
            ) : (
              rows.map((r, i) => {
                const pts = period === 'monthly' ? r.monthlyPoints : r.seasonPoints;
                const me = r.userId === uid;
                return (
                  <View key={r.userId} style={[styles.row, me && styles.rowMe]}>
                    <Text style={styles.rank}>#{i + 1}</Text>
                    <View style={styles.mid}>
                      <Text style={styles.name}>{r.displayName || 'Fan'}</Text>
                      <Text style={styles.meta}>
                        H {r.menPoints ?? 0} · F {r.womenPoints ?? 0}
                      </Text>
                    </View>
                    <Text style={styles.pts}>{pts}</Text>
                  </View>
                );
              })
            )}
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
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: { fontFamily: F.bebas, fontSize: 24, letterSpacing: 2, color: C.text },
  sub: {
    color: C.muted2,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  segRow: { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 12 },
  seg: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.card,
  },
  segOn: { borderColor: C.blueBorder, backgroundColor: C.blueFill },
  segT: { color: C.muted2, fontFamily: F.i700 },
  segTOn: { color: C.blue2 },
  scroll: { paddingHorizontal: 16 },
  empty: { color: C.muted, textAlign: 'center', marginTop: 24, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    marginBottom: 8,
    gap: 10,
  },
  rowMe: { borderColor: C.gold, backgroundColor: 'rgba(240,180,41,0.08)' },
  rank: { fontFamily: F.bebas, fontSize: 20, color: C.muted2, width: 36 },
  mid: { flex: 1 },
  name: { color: C.text, fontFamily: F.i700, fontSize: 14 },
  meta: { color: C.muted, fontSize: 11, marginTop: 2 },
  pts: { fontFamily: F.bebas, fontSize: 22, color: C.gold },
});
