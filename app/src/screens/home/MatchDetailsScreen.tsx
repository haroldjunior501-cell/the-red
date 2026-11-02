import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
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
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { useMatchPresentation } from '../../hooks/useMatchPresentation';
import type { FormChar, FormMatchDetail, H2HDetail } from '../../services/footballService';
function extractLineupNames(payload: Record<string, unknown> | null, side: 'home' | 'away'): string[] {
  if (!payload) return [];
  const root = (payload.data as Record<string, unknown> | undefined) ?? payload;
  const block =
    (root[side] as Record<string, unknown> | undefined) ??
    (root[`${side}team`] as Record<string, unknown> | undefined) ??
    (side === 'home' ? (root.localteam as Record<string, unknown>) : (root.visitorteam as Record<string, unknown>));
  const names: string[] = [];
  const lineup = block?.lineup ?? block?.players ?? root[`${side}_lineup`];
  if (Array.isArray(lineup)) {
    for (const p of lineup) {
      if (typeof p === 'string') names.push(p);
      else if (p && typeof p === 'object') {
        const o = p as Record<string, unknown>;
        const n = String(o.name ?? o.player_name ?? o.fullname ?? '').trim();
        if (n) names.push(n);
      }
    }
  }
  return names.slice(0, 11);
}

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

function formLetter(c: FormChar): string {
  if (c === 'G') return 'V';
  if (c === 'N') return 'N';
  return 'P';
}

function formColors(c: FormChar) {
  if (c === 'G') return { bg: 'rgba(41,121,255,0.35)', text: '#fff' };
  if (c === 'N') return { bg: 'rgba(255,255,255,0.2)', text: '#fff' };
  return { bg: 'rgba(239,68,68,0.35)', text: '#fff' };
}

const Section = memo(function Section({
  title,
  children,
  loading,
}: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {loading ? (
        <ActivityIndicator color={DS.green} style={{ marginTop: 12 }} />
      ) : (
        children
      )}
    </View>
  );
});

function FormRows({ label, rows }: { label: string; rows: FormMatchDetail[] }) {
  if (!rows.length) {
    return <Text style={styles.blockText}>Historique récent non disponible pour {label}.</Text>;
  }
  return (
    <>
      <Text style={styles.teamLbl}>{label}</Text>
      {rows.slice(0, 5).map((row, i) => {
        const colors = formColors(row.result);
        return (
          <View key={`${label}-${i}`} style={styles.formRow}>
            <View style={[styles.formPill, { backgroundColor: colors.bg }]}>
              <Text style={[styles.formPillTxt, { color: colors.text }]}>{formLetter(row.result)}</Text>
            </View>
            <View style={styles.formBody}>
              <Text style={styles.formMain}>{row.label}</Text>
              {row.subtitle ? <Text style={styles.formSub}>{row.subtitle}</Text> : null}
            </View>
          </View>
        );
      })}
    </>
  );
}

function H2HBody({ detail, homeName, awayName }: { detail: H2HDetail | null; homeName: string; awayName: string }) {
  if (!detail || !detail.matches.length) {
    return (
      <Text style={styles.blockText}>
        Pas encore de confrontations enregistrées entre ces deux sélections sur cette compétition.
      </Text>
    );
  }
  return (
    <>
      <Text style={styles.blockText}>
        {homeName} : {detail.winsTeam1} victoire(s) · {detail.draws} nul(s) · {detail.goalsTeam1} but(s)
      </Text>
      <Text style={[styles.blockText, { marginTop: 6 }]}>
        {awayName} : {detail.winsTeam2} victoire(s) · {detail.goalsTeam2} but(s)
      </Text>
      {detail.matches.slice(0, 6).map((m) => (
        <View key={m.id} style={styles.h2hRow}>
          <Text style={styles.h2hScore}>
            {m.home.name} {m.goalsHome} - {m.goalsAway} {m.away.name}
          </Text>
          <Text style={styles.h2hMeta}>
            {m.phase}
            {m.dateMs
              ? ` · ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(m.dateMs))}`
              : ''}
          </Text>
        </View>
      ))}
    </>
  );
}

export default function MatchDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'MatchDetails'>>();
  const p = route.params ?? {};

  const data = useMatchPresentation(p);

  const heroTeams = useMemo(() => {
    if (data.wc) {
      return {
        home: { name: data.wc.home.name, flag: data.wc.home.flag },
        away: { name: data.wc.away.name, flag: data.wc.away.flag },
      };
    }
    return {
      home: { name: data.homeName, flag: '' },
      away: { name: data.awayName, flag: '' },
    };
  }, [data.awayName, data.homeName, data.wc]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={DS.green} />
        </Pressable>
        <Text style={styles.title}>Présentation du match</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>MATCH À VENIR</Text>
          <View style={styles.heroTeams}>
            <View style={styles.heroSide}>
              {data.homeLogo ? (
                <Image source={{ uri: data.homeLogo }} style={styles.logo} resizeMode="contain" />
              ) : (
                <Text style={styles.flag}>{heroTeams.home.flag}</Text>
              )}
              <Text style={styles.heroTeam} numberOfLines={2}>
                {heroTeams.home.name}
              </Text>
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.heroSide}>
              {data.awayLogo ? (
                <Image source={{ uri: data.awayLogo }} style={styles.logo} resizeMode="contain" />
              ) : (
                <Text style={styles.flag}>{heroTeams.away.flag}</Text>
              )}
              <Text style={styles.heroTeam} numberOfLines={2}>
                {heroTeams.away.name}
              </Text>
            </View>
          </View>
          {data.kickoffLabel ? <Text style={styles.heroLine}>{data.kickoffLabel}</Text> : null}
          <Text style={styles.heroSub}>{data.phaseLabel}</Text>
        </View>

        <Section title="OÙ REGARDER">
          <Text style={styles.blockText}>
            Retrouve la retransmission officielle de la Coupe du monde sur les chaînes partenaires FIFA dans ton
            pays (France : beIN Sports / TF1 selon les matchs).
          </Text>
        </Section>

        <Section title="COMPOSITIONS PROBABLES" loading={data.lineupsLoading}>
          {(() => {
            const homeL = extractLineupNames(data.lineups, 'home');
            const awayL = extractLineupNames(data.lineups, 'away');
            if (!homeL.length && !awayL.length) {
              return (
                <Text style={styles.blockText}>
                  Les compositions sont publiées en général 1 à 2 h avant le coup d&apos;envoi.
                </Text>
              );
            }
            return (
              <View style={styles.lineupCols}>
                <View style={styles.lineupCol}>
                  <Text style={styles.teamLbl}>{data.homeName}</Text>
                  {homeL.map((n, i) => (
                    <Text key={`h-${i}`} style={styles.lineupPlayer}>
                      {n}
                    </Text>
                  ))}
                </View>
                <View style={styles.lineupCol}>
                  <Text style={styles.teamLbl}>{data.awayName}</Text>
                  {awayL.map((n, i) => (
                    <Text key={`a-${i}`} style={styles.lineupPlayer}>
                      {n}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })()}
        </Section>

        <Section title="FACE-À-FACE" loading={data.h2hLoading}>
          <H2HBody detail={data.h2h} homeName={data.homeName} awayName={data.awayName} />
        </Section>

        <Section title="FORME DU MOMENT" loading={data.formLoading}>
          <FormRows label={data.homeName} rows={data.formSelf} />
          {data.formOpp.length ? (
            <View style={{ marginTop: 14 }}>
              <FormRows label={data.awayName} rows={data.formOpp} />
            </View>
          ) : null}
        </Section>

        <Section title="ABSENTS / BLESSÉS">
          <Text style={styles.blockText}>
            Les listes officielles des indisponibles sont communiquées par les fédérations avant chaque match.
            Consulte l&apos;onglet « Ne joue pas » sur l&apos;accueil pour le détail de ton équipe.
          </Text>
        </Section>

        <Section title="STADE & VILLE">
          <Text style={styles.blockText}>
            {data.venueLabel ||
              'Lieu exact communiqué par la FIFA à l\'approche du match (États-Unis, Canada, Mexique).'}
          </Text>
        </Section>

        <Section title="DÉCLARATIONS / INTERVIEWS" loading={data.commentaryLoading}>
          {data.commentary.length ? (
            data.commentary.map((line, i) => (
              <Text key={`c-${i}`} style={[styles.blockText, i > 0 && { marginTop: 8 }]}>
                {line}
              </Text>
            ))
          ) : (
            <Text style={styles.blockText}>
              Aucune déclaration en direct pour l&apos;instant. Les conférences de presse apparaîtront ici quand
              l&apos;API les diffuse.
            </Text>
          )}
        </Section>

        <View style={{ height: 24 }} />
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
  title: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.2 },
  content: { paddingHorizontal: DS.ph, paddingTop: 14 },
  heroCard: {
    backgroundColor: DS.card,
    borderWidth: 1,
    borderColor: DS.border,
    borderRadius: DS.radius,
    padding: 14,
    marginBottom: 12,
  },
  heroKicker: { color: DS.gold, fontWeight: '900', letterSpacing: 1.1, fontSize: 11 },
  heroTeams: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  heroSide: { flex: 1, alignItems: 'center', gap: 6 },
  logo: { width: 44, height: 44 },
  flag: { fontSize: 36 },
  heroTeam: { color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  vs: { color: DS.gray, fontWeight: '900', fontSize: 14 },
  heroLine: { color: '#fff', fontWeight: '800', fontSize: 15, marginTop: 14, textAlign: 'center' },
  heroSub: { color: DS.gray, marginTop: 8, textAlign: 'center', fontSize: 12 },
  block: {
    backgroundColor: DS.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: DS.radius,
    padding: 14,
    marginTop: 10,
  },
  blockTitle: { color: DS.gray, fontWeight: '900', letterSpacing: 1.4, fontSize: 11 },
  blockText: { color: 'rgba(255,255,255,0.75)', marginTop: 8, lineHeight: 18, fontSize: 13 },
  lineupCols: { flexDirection: 'row', gap: 12, marginTop: 8 },
  lineupCol: { flex: 1 },
  lineupPlayer: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 5 },
  teamLbl: { color: DS.green, fontWeight: '800', fontSize: 12, marginTop: 10, marginBottom: 6 },
  formRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10, gap: 10 },
  formPill: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formPillTxt: { fontWeight: '900', fontSize: 12 },
  formBody: { flex: 1 },
  formMain: { color: '#fff', fontWeight: '700', fontSize: 13 },
  formSub: { color: DS.gray, fontSize: 11, marginTop: 3 },
  h2hRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  h2hScore: { color: '#fff', fontWeight: '700', fontSize: 13 },
  h2hMeta: { color: DS.gray, fontSize: 11, marginTop: 4 },
});
