import React, { memo } from 'react';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fotmobTeamLogoUrl } from '../../../../constants/fotmob';
import type { H2HDetail } from '../../../../services/footballService';
import { DS } from '../../LiveScreen.styles';

type Props = {
  detail: H2HDetail | null;
  homeName: string;
  awayName: string;
  loading?: boolean;
};

function formatDateFr(ms: number): string {
  if (!ms) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ms));
}

function SegmentedBar({
  segments,
}: {
  segments: { pct: number; color: string; label: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.pct, 0) || 1;
  return (
    <View>
      <View style={styles.bar}>
        {segments.map((s) =>
          s.pct > 0 ? (
            <View
              key={s.label}
              style={[styles.seg, { flex: Math.max(s.pct, 8) / total, backgroundColor: s.color }]}
            >
              <Text style={styles.segPct}>{s.pct}%</Text>
            </View>
          ) : null
        )}
      </View>
      <View style={styles.legend}>
        {segments.map((s) => (
          <Text key={s.label} style={styles.legendTxt} numberOfLines={1}>
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function TeamCrest({ logo, name }: { logo?: string; name: string }) {
  const uri = logo || undefined;
  if (uri) {
    return <Image source={{ uri }} style={styles.crest} contentFit="contain" />;
  }
  return (
    <View style={[styles.crest, styles.crestFallback]}>
      <Text style={styles.crestLetter}>{name.slice(0, 1)}</Text>
    </View>
  );
}

export const LiveH2HPanel = memo(function LiveH2HPanel({
  detail,
  homeName,
  awayName,
  loading,
}: Props) {
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Chargement du face-à-face…</Text>
      </View>
    );
  }

  if (!detail || detail.matches.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>
          Aucune confrontation terminée entre ces deux équipes pour le moment.
        </Text>
        <Text style={styles.emptyHint}>Les scores s’affichent via le calendrier FotMob dès qu’un match est joué.</Text>
      </View>
    );
  }

  const total = detail.winsTeam1 + detail.draws + detail.winsTeam2 || 1;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Bilan face-à-face</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryNum}>{detail.winsTeam1}</Text>
          <Text style={styles.summaryLbl}>Victoires {homeName}</Text>
        </View>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryNum}>{detail.draws}</Text>
          <Text style={styles.summaryLbl}>Nuls</Text>
        </View>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryNum}>{detail.winsTeam2}</Text>
          <Text style={styles.summaryLbl}>Victoires {awayName}</Text>
        </View>
      </View>

      <Text style={[styles.subStats, { marginTop: 8 }]}>
        Buts : {homeName} {detail.goalsTeam1} — {awayName} {detail.goalsTeam2}
      </Text>

      <Text style={[styles.title, { marginTop: 20 }]}>Répartition des résultats</Text>
      <SegmentedBar
        segments={[
          { pct: Math.round((detail.winsTeam1 / total) * 100), color: '#2979ff', label: homeName },
          { pct: Math.round((detail.draws / total) * 100), color: '#6b7280', label: 'Nul' },
          { pct: Math.round((detail.winsTeam2 / total) * 100), color: '#ef4444', label: awayName },
        ]}
      />

      <Text style={[styles.title, { marginTop: 24 }]}>Scores des matchs</Text>
      {detail.matches.map((m) => {
        const homeLogo = m.home.logo ?? fotmobTeamLogoUrl(m.home.id);
        const awayLogo = m.away.logo ?? fotmobTeamLogoUrl(m.away.id);
        return (
          <View key={m.id} style={styles.matchCard}>
            <Text style={styles.matchPhase}>{m.phase}</Text>
            <Text style={styles.matchDate}>{formatDateFr(m.dateMs)}</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.teamName} numberOfLines={1}>
                {m.home.name}
              </Text>
              <TeamCrest logo={homeLogo} name={m.home.name} />
              <Text style={styles.scoreTxt}>
                {m.goalsHome} - {m.goalsAway}
              </Text>
              <TeamCrest logo={awayLogo} name={m.away.name} />
              <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={1}>
                {m.away.name}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  empty: { color: DS.muted, fontSize: 13, textAlign: 'center' },
  emptyHint: { color: DS.muted, fontSize: 11, textAlign: 'center', opacity: 0.85 },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subStats: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: DS.muted,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryCol: { flex: 1, alignItems: 'center', gap: 4 },
  summaryNum: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    color: '#fff',
    letterSpacing: 1,
  },
  summaryLbl: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: DS.muted,
    textAlign: 'center',
  },
  bar: {
    flexDirection: 'row',
    height: 36,
    borderRadius: 6,
    overflow: 'hidden',
  },
  seg: { justifyContent: 'center', alignItems: 'center', minWidth: 28 },
  segPct: { fontFamily: 'Inter_800ExtraBold', fontSize: 11, color: '#fff' },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 6 },
  legendTxt: { fontFamily: 'Inter_500Medium', fontSize: 10, color: DS.muted, flex: 1 },
  matchCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  matchPhase: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: DS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  matchDate: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  teamName: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#e8f0ff',
  },
  teamNameRight: { textAlign: 'right' },
  scoreTxt: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    color: '#fff',
    letterSpacing: 1,
    minWidth: 56,
    textAlign: 'center',
  },
  crest: { width: 28, height: 28, borderRadius: 14 },
  crestFallback: {
    backgroundColor: 'rgba(41,121,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestLetter: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#fff' },
});
