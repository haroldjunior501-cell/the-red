import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { COLORS, UNITED_GOLD, UNITED_RED } from '../../constants/colors';
import { FOTMOB_MU_TEAM_ID } from '../../constants/fotmobTheRed';
import {
  filterProgramme,
  useUnitedProgramme,
  type ProgrammeFilter,
} from '../../hooks/useUnitedProgramme';
import type { TabsParamList } from '../../navigation/AppTabs';
import type { UnitedProgrammeMatch } from '../../services/fotmobClubApi';

type Nav = BottomTabNavigationProp<TabsParamList>;

const MU = String(FOTMOB_MU_TEAM_ID);

const STATUS_CHIPS: { id: ProgrammeFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'upcoming', label: 'À venir' },
  { id: 'played', label: 'Joués' },
];

function shortComp(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('premier')) return 'PL';
  if (n.includes('champions')) return 'UCL';
  if (n.includes('efl') || n.includes('league cup') || n.includes('carabao')) return 'EFL Cup';
  if (n.includes('fa cup')) return 'FA Cup';
  if (n.includes('friendl')) return 'Amical';
  return name;
}

function monthLabel(ms: number): string {
  const d = new Date(ms);
  const raw = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function kickoffLabel(m: UnitedProgrammeMatch): string {
  if (m.statusShort === 'LIVE') return 'LIVE';
  if (m.statusShort === 'FT' || m.resultVsUnited != null) {
    const h = m.goals.home ?? '–';
    const a = m.goals.away ?? '–';
    return `${h} – ${a}`;
  }
  if (m.statusShort === 'CANC') return 'Annulé';
  const d = new Date(m.kickoffMs);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function dayLabel(ms: number): { dow: string; day: string } {
  const d = new Date(ms);
  return {
    dow: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
    day: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
  };
}

function ResultPill({ result }: { result: 1 | 0 | -1 | null }) {
  if (result == null) return null;
  const label = result === 1 ? 'V' : result === 0 ? 'N' : 'D';
  const bg = result === 1 ? '#16a34a' : result === 0 ? '#64748b' : UNITED_RED;
  return (
    <View style={[styles.resultPill, { backgroundColor: bg }]}>
      <Text style={styles.resultText}>{label}</Text>
    </View>
  );
}

type Row =
  | { kind: 'month'; key: string; label: string }
  | { kind: 'match'; key: string; match: UnitedProgrammeMatch };

function buildRows(matches: UnitedProgrammeMatch[]): Row[] {
  const rows: Row[] = [];
  let lastMonth = '';
  for (const m of matches) {
    const label = monthLabel(m.kickoffMs);
    if (label !== lastMonth) {
      lastMonth = label;
      rows.push({ kind: 'month', key: `m-${label}`, label });
    }
    rows.push({ kind: 'match', key: m.fixtureId, match: m });
  }
  return rows;
}

function MatchRow({
  match,
  isNext,
  onPress,
}: {
  match: UnitedProgrammeMatch;
  isNext: boolean;
  onPress: () => void;
}) {
  const day = dayLabel(match.kickoffMs);
  const unitedHome = match.home.id === MU;
  const scoreOrTime = kickoffLabel(match);
  const isLive = match.statusShort === 'LIVE';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.matchCard,
        isNext && styles.matchNext,
        pressed && { opacity: 0.88 },
      ]}
    >
      <View style={styles.dateCol}>
        <Text style={styles.dow}>{day.dow}</Text>
        <Text style={styles.day}>{day.day}</Text>
      </View>

      <View style={styles.matchBody}>
        <View style={styles.compRow}>
          <Text style={styles.comp}>{shortComp(match.competition)}</Text>
          {isNext ? <Text style={styles.nextTag}>PROCHAIN</Text> : null}
          {isLive ? <Text style={styles.liveTag}>LIVE</Text> : null}
        </View>

        <View style={styles.teamsRow}>
          <View style={styles.teamSide}>
            {match.home.logo ? (
              <Image source={{ uri: match.home.logo }} style={styles.crest} />
            ) : (
              <View style={[styles.crest, styles.crestPh]} />
            )}
            <Text
              style={[styles.teamName, unitedHome && styles.teamUnited]}
              numberOfLines={1}
            >
              {match.home.name}
            </Text>
          </View>

          <View style={styles.scoreWrap}>
            <Text style={[styles.score, isLive && styles.scoreLive]}>{scoreOrTime}</Text>
            <ResultPill result={match.resultVsUnited} />
          </View>

          <View style={[styles.teamSide, styles.teamAway]}>
            <Text
              style={[styles.teamName, styles.teamNameRight, !unitedHome && styles.teamUnited]}
              numberOfLines={1}
            >
              {match.away.name}
            </Text>
            {match.away.logo ? (
              <Image source={{ uri: match.away.logo }} style={styles.crest} />
            ) : (
              <View style={[styles.crest, styles.crestPh]} />
            )}
          </View>
        </View>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
    </Pressable>
  );
}

export default function ProgrammeScreen() {
  const navigation = useNavigation<Nav>();
  const { fixtures, competitions, nextUpcomingId, loading, refreshing, error, refresh } =
    useUnitedProgramme();
  const [status, setStatus] = useState<ProgrammeFilter>('all');
  const [competition, setCompetition] = useState<string | null>(null);
  const listRef = useRef<FlatList<Row>>(null);
  const didScroll = useRef(false);

  const filtered = useMemo(
    () => filterProgramme(fixtures, status, competition),
    [fixtures, status, competition]
  );
  const rows = useMemo(() => buildRows(filtered), [filtered]);

  const openMatch = useCallback(
    (m: UnitedProgrammeMatch) => {
      navigation.navigate('Accueil', {
        screen: 'MatchDetails',
        params: {
          fixtureId: m.fixtureId,
          selfCode: 'MU',
          homeName: m.home.name,
          awayName: m.away.name,
          homeId: m.home.id,
          awayId: m.away.id,
          homeLogo: m.home.logo,
          awayLogo: m.away.logo,
          date: m.date,
          phase: m.competition,
          venue: m.competition,
        },
      } as never);
    },
    [navigation]
  );

  const tryScrollToNext = useCallback(() => {
    if (didScroll.current || !nextUpcomingId || status !== 'all' || competition) return;
    const idx = rows.findIndex((r) => r.kind === 'match' && r.match.fixtureId === nextUpcomingId);
    if (idx < 0) return;
    didScroll.current = true;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: Math.max(0, idx - 1), animated: true, viewPosition: 0.15 });
    });
  }, [nextUpcomingId, rows, status, competition]);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.kind === 'month') {
        return (
          <View style={styles.monthHeader}>
            <Text style={styles.monthText}>{item.label}</Text>
          </View>
        );
      }
      return (
        <MatchRow
          match={item.match}
          isNext={item.match.fixtureId === nextUpcomingId}
          onPress={() => openMatch(item.match)}
        />
      );
    },
    [nextUpcomingId, openMatch]
  );

  return (
    <ScreenAmbience>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="calendar-month" size={24} color={UNITED_RED} />
          <Text style={styles.title}>Programme</Text>
          <Text style={styles.sub}>{fixtures.length} matchs · saison</Text>
        </View>

        <View style={styles.chipsRow}>
          {STATUS_CHIPS.map((c) => {
            const on = status === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setStatus(c.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.chipsRow}>
          <Pressable
            onPress={() => setCompetition(null)}
            style={[styles.chipSm, competition == null && styles.chipOn]}
          >
            <Text style={[styles.chipTextSm, competition == null && styles.chipTextOn]}>Toutes</Text>
          </Pressable>
          {competitions.map((name) => {
            const on = competition === name;
            return (
              <Pressable
                key={name}
                onPress={() => setCompetition(on ? null : name)}
                style={[styles.chipSm, on && styles.chipOn]}
              >
                <Text style={[styles.chipTextSm, on && styles.chipTextOn]}>{shortComp(name)}</Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator color={UNITED_RED} style={{ marginTop: 48 }} />
        ) : error && fixtures.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Impossible de charger le programme</Text>
            <Pressable onPress={() => refresh()} style={styles.retry}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={rows}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={tryScrollToNext}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                listRef.current?.scrollToIndex({ index: info.index, animated: true });
              }, 250);
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => refresh()}
                tintColor={UNITED_RED}
                colors={[UNITED_RED]}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Aucun match</Text>
                <Text style={styles.emptySub}>Change de filtre pour voir le calendrier.</Text>
              </View>
            }
            ListFooterComponent={<View style={{ height: 28 }} />}
          />
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 24,
    color: '#fff',
    flexShrink: 0,
  },
  sub: {
    marginLeft: 'auto',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipSm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  chipOn: {
    backgroundColor: 'rgba(218,41,28,0.22)',
    borderColor: UNITED_RED,
  },
  chipText: { color: '#cbd5e1', fontWeight: '800', fontSize: 13 },
  chipTextSm: { color: '#94a3b8', fontWeight: '700', fontSize: 12 },
  chipTextOn: { color: '#fff' },
  list: { paddingHorizontal: 12, paddingTop: 4 },
  monthHeader: {
    paddingHorizontal: 4,
    paddingTop: 14,
    paddingBottom: 8,
  },
  monthText: {
    color: UNITED_GOLD,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  matchNext: {
    borderColor: 'rgba(218,41,28,0.55)',
    backgroundColor: 'rgba(218,41,28,0.12)',
  },
  dateCol: {
    width: 52,
    alignItems: 'center',
  },
  dow: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  day: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  matchBody: { flex: 1, minWidth: 0 },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  comp: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  nextTag: {
    color: UNITED_RED,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveTag: {
    color: UNITED_GOLD,
    fontSize: 10,
    fontWeight: '900',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  teamAway: { justifyContent: 'flex-end' },
  crest: { width: 22, height: 22 },
  crestPh: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4 },
  teamName: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
  },
  teamNameRight: { textAlign: 'right' },
  teamUnited: { color: '#fff', fontWeight: '900' },
  scoreWrap: { alignItems: 'center', minWidth: 54, gap: 4 },
  score: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  scoreLive: { color: UNITED_GOLD },
  resultPill: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  empty: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 24 },
  emptyTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  emptySub: { color: '#94a3b8', marginTop: 6, textAlign: 'center' },
  retry: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: UNITED_RED,
  },
  retryText: { color: '#fff', fontWeight: '800' },
});
