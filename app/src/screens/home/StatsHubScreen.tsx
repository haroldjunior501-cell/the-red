import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTopAssisters } from '../../hooks/useTopAssisters';
import { useTopScorers } from '../../hooks/useTopScorers';

const DS = {
  bg: '#0b111c',
  card: '#0f1623',
  green: '#2979ff',
  gold: '#bfa968',
  gray: '#8896ab',
  border: 'rgba(255,255,255,0.08)',
  radius: 14,
  ph: 16,
} as const;

type TabKey = 'players' | 'teams';

export default function StatsHubScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<TabKey>('players');
  const { rows: scorers, loading: scorersLoading } = useTopScorers(10);
  const { rows: assisters, loading: assistersLoading } = useTopAssisters(10);

  const loading = tab === 'players' ? scorersLoading || assistersLoading : false;

  const rows = useMemo(() => {
    if (tab === 'players') {
      return [
        {
          label: 'Buts',
          items: scorers.slice(0, 3).map((r) => ({ name: r.name, team: r.team, value: String(r.goals) })),
        },
        {
          label: 'Passes décisives',
          items: assisters.slice(0, 3).map((r) => ({ name: r.name, team: r.team, value: String(r.assists) })),
        },
      ];
    }
    return [
      {
        label: 'Classement équipes',
        items: [
          { name: 'Données live', team: 'Coupe du monde', value: '—' },
        ],
      },
    ];
  }, [assisters, scorers, tab]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={DS.green} />
        </Pressable>
        <Text style={styles.title}>Stats</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab('players')}
            style={[styles.tabBtn, tab === 'players' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === 'players' && styles.tabTextActive]}>Joueurs</Text>
          </Pressable>
          <Pressable onPress={() => setTab('teams')} style={[styles.tabBtn, tab === 'teams' && styles.tabBtnActive]}>
            <Text style={[styles.tabText, tab === 'teams' && styles.tabTextActive]}>Équipes</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={DS.green} style={{ marginTop: 24 }} />
        ) : (
          rows.map((r) => (
            <View key={r.label} style={styles.card}>
              <Text style={styles.cardTitle}>{r.label}</Text>
              {r.items.length ? (
                r.items.map((item, i) => (
                  <View key={`${r.label}-${i}`} style={styles.listRow}>
                    <Text style={styles.rank}>{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.item}>{item.name}</Text>
                      <Text style={styles.teamSub}>{item.team}</Text>
                    </View>
                    <Text style={styles.val}>{item.value}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.cardNote}>Stats en cours de chargement depuis Live Score et FotMob.</Text>
              )}
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
    height: 56,
    paddingHorizontal: DS.ph,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 0.2 },
  content: { paddingHorizontal: DS.ph, paddingTop: 14, paddingBottom: 22, gap: 10 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: DS.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 999,
    padding: 6,
    gap: 8,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabBtnActive: { backgroundColor: 'rgba(41, 121, 255, 0.12)', borderWidth: 1, borderColor: 'rgba(41, 121, 255, 0.25)' },
  tabText: { color: DS.gray, fontWeight: '900', fontSize: 14 },
  tabTextActive: { color: DS.green },
  card: {
    backgroundColor: DS.card,
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: DS.radius,
    padding: 14,
  },
  cardTitle: { color: '#fff', fontWeight: '900', fontSize: 16, marginBottom: 10 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  rank: { color: DS.gray, width: 20, fontWeight: '900' },
  item: { color: 'rgba(255,255,255,0.85)', fontWeight: '800' },
  teamSub: { color: DS.gray, fontSize: 11, marginTop: 2 },
  val: { color: DS.gold, fontWeight: '900' },
  cardNote: { marginTop: 10, color: DS.gray, fontSize: 12 },
});
