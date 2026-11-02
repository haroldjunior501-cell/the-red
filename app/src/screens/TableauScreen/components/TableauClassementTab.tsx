import React, { memo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatPower } from '../../../services/gamesService';
import { NATION_POWER_SOURCES } from '../../../constants/nationRanking';
import { TABLEAU } from '../../../constants/tableauTheme';
import type { NationRank } from '../../../types/games.types';

type Props = {
  ranking: NationRank[];
  loading: boolean;
  highlightCode?: string;
  userRank?: number;
  userPower?: number;
};

function PodiumMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.medalGold}>🥇</Text>;
  if (rank === 2) return <Text style={styles.medalSilver}>🥈</Text>;
  if (rank === 3) return <Text style={styles.medalBronze}>🥉</Text>;
  return <Text style={styles.rankNum}>#{rank}</Text>;
}

export const TableauClassementTab = memo(function TableauClassementTab({
  ranking,
  loading,
  highlightCode,
  userRank,
  userPower,
}: Props) {
  const hi = highlightCode?.toUpperCase();
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Classement des nations</Text>
      <Text style={styles.sub}>
        Chaque nation cumule la puissance de tous ses supporters GOALYA. Plus tu pronostiques bien pour ton pays, plus tu
        fais monter ta nation.
      </Text>

      {hi && userRank != null ? (
        <View style={styles.userCard}>
          <Text style={styles.userLbl}>TA NATION</Text>
          <View style={styles.userRow}>
            <Text style={styles.userFlag}>
              {ranking.find((r) => r.code.toUpperCase() === hi)?.flag ?? '🏳️'}
            </Text>
            <View style={styles.userMeta}>
              <Text style={styles.userName}>
                {ranking.find((r) => r.code.toUpperCase() === hi)?.name ?? hi}
              </Text>
              <Text style={styles.userPts}>{formatPower(userPower ?? 0)} pts nation</Text>
            </View>
            <Text style={styles.userRank}>#{userRank}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.sourcesCard}>
        <Text style={styles.sourcesTitle}>D&apos;où viennent les points ?</Text>
        {NATION_POWER_SOURCES.map((s) => (
          <View key={s.label} style={styles.sourceRow}>
            <Text style={styles.sourceDot}>•</Text>
            <Text style={styles.sourceTxt}>
              <Text style={styles.sourceLbl}>{s.label}</Text> — {s.detail}
            </Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={TABLEAU.link} style={{ marginVertical: 24 }} />
      ) : ranking.length === 0 ? (
        <Text style={styles.empty}>Classement en cours de chargement…</Text>
      ) : (
        <>
          {top3.length > 0 ? (
            <View style={styles.podium}>
              {top3.map((row) => (
                <View
                  key={row.code}
                  style={[
                    styles.podiumSlot,
                    row.rank === 1 && styles.podiumFirst,
                    hi === row.code.toUpperCase() && styles.rowHi,
                  ]}
                >
                  <PodiumMedal rank={row.rank} />
                  <Text style={styles.podiumFlag}>{row.flag}</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {row.name}
                  </Text>
                  <Text style={styles.podiumPts}>{formatPower(row.power)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <ScrollView style={styles.list} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {rest.map((row) => {
              const active = hi === row.code.toUpperCase();
              return (
                <View key={row.code} style={[styles.row, active && styles.rowHi]}>
                  <Text style={styles.rank}>#{row.rank}</Text>
                  <Text style={styles.flag}>{row.flag}</Text>
                  <View style={styles.nameCol}>
                    <Text style={styles.name} numberOfLines={1}>
                      {row.name}
                    </Text>
                    {row.dailyGain != null && row.dailyGain > 0 ? (
                      <Text style={styles.gain}>+{formatPower(row.dailyGain)} aujourd&apos;hui</Text>
                    ) : null}
                  </View>
                  <Text style={styles.power}>{formatPower(row.power)}</Text>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginBottom: 12, flexGrow: 0 },
  title: { fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: TABLEAU.text },
  sub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: TABLEAU.textMuted,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 14,
  },
  userCard: {
    backgroundColor: 'rgba(41, 121, 255, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.3)',
    padding: 12,
    marginBottom: 12,
  },
  userLbl: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1,
    color: TABLEAU.link,
    marginBottom: 8,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userFlag: { fontSize: 28 },
  userMeta: { flex: 1 },
  userName: { fontFamily: 'Inter_700Bold', fontSize: 15, color: TABLEAU.text },
  userPts: { fontFamily: 'Inter_500Medium', fontSize: 11, color: TABLEAU.textSoft, marginTop: 2 },
  userRank: { fontFamily: 'BebasNeue_400Regular', fontSize: 28, color: TABLEAU.gold },
  sourcesCard: {
    backgroundColor: TABLEAU.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TABLEAU.border,
    padding: 12,
    marginBottom: 14,
  },
  sourcesTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: TABLEAU.textSoft,
    marginBottom: 8,
  },
  sourceRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  sourceDot: { color: TABLEAU.link, fontSize: 12 },
  sourceTxt: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 11, color: TABLEAU.textMuted, lineHeight: 16 },
  sourceLbl: { fontFamily: 'Inter_700Bold', color: TABLEAU.text },
  empty: { fontFamily: 'Inter_500Medium', fontSize: 13, color: TABLEAU.textMuted, textAlign: 'center', padding: 20 },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 14,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: TABLEAU.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TABLEAU.border,
    paddingVertical: 12,
    paddingHorizontal: 6,
    minHeight: 100,
  },
  podiumFirst: { minHeight: 118, borderColor: 'rgba(240, 180, 41, 0.35)' },
  medalGold: { fontSize: 22 },
  medalSilver: { fontSize: 20 },
  medalBronze: { fontSize: 18 },
  rankNum: { fontFamily: 'Inter_700Bold', fontSize: 12, color: TABLEAU.textMuted },
  podiumFlag: { fontSize: 22, marginTop: 4 },
  podiumName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: TABLEAU.text,
    marginTop: 4,
    textAlign: 'center',
  },
  podiumPts: { fontFamily: 'Inter_800ExtraBold', fontSize: 11, color: TABLEAU.gold, marginTop: 2 },
  list: { maxHeight: 320 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: TABLEAU.border,
    borderRadius: 8,
  },
  rowHi: { backgroundColor: 'rgba(41, 121, 255, 0.1)' },
  rank: { width: 32, fontFamily: 'Inter_700Bold', fontSize: 12, color: TABLEAU.textMuted },
  flag: { fontSize: 20 },
  nameCol: { flex: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: TABLEAU.text },
  gain: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#00e676', marginTop: 2 },
  power: { fontFamily: 'Inter_800ExtraBold', fontSize: 12, color: TABLEAU.link },
});
