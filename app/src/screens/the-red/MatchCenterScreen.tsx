import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, UNITED_GOLD, UNITED_RED } from '../../constants/colors';
import { TheRedApi } from '../../services/theRedApiClient';
import {
  formatKickoff,
  matchStatusLabel,
  unitedScore,
  type RedMatch,
} from '../../services/theRedContent';

export default function MatchCenterScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState<RedMatch[]>([]);
  const [selected, setSelected] = useState<RedMatch | null>(null);

  const load = useCallback(async () => {
    const data = await TheRedApi.getMatches();
    setMatches(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upcoming = matches.filter((match) => match.status !== 'FINISHED');
  const played = matches.filter((match) => match.status === 'FINISHED');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={UNITED_RED}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
      >
        <Text style={styles.kicker}>MANCHESTER UNITED</Text>
        <Text style={styles.title}>Match Center</Text>
        <Text style={styles.lead}>Calendrier, scores et lieux des Red Devils.</Text>

        {loading ? <ActivityIndicator color={UNITED_RED} style={{ marginTop: 24 }} /> : null}

        {selected ? (
          <View style={styles.detail}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backRow}>
              <MaterialCommunityIcons name="chevron-left" size={20} color={UNITED_RED} />
              <Text style={styles.backText}>Tous les matchs</Text>
            </TouchableOpacity>
            <Text style={styles.comp}>{selected.competition}</Text>
            <Text style={styles.detailTeams}>
              Man United {selected.is_home === 'HOME' ? 'vs' : '@'} {selected.opponent}
            </Text>
            <Text style={styles.score}>{unitedScore(selected) ?? 'VS'}</Text>
            <Text style={styles.meta}>{matchStatusLabel(selected.status)}</Text>
            <Text style={styles.meta}>{formatKickoff(selected.kickoff_at)}</Text>
            <Text style={styles.meta}>{selected.venue || 'Old Trafford'}</Text>
            <Text style={styles.meta}>
              {selected.is_home === 'HOME'
                ? 'Manchester United reçoit'
                : selected.is_home === 'AWAY'
                  ? 'Manchester United se déplace'
                  : 'Terrain neutre'}
            </Text>
          </View>
        ) : (
          <>
            <Section title="À venir" matches={upcoming} onOpen={setSelected} />
            <Section title="Résultats" matches={played} onOpen={setSelected} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  matches,
  onOpen,
}: {
  title: string;
  matches: RedMatch[];
  onOpen: (match: RedMatch) => void;
}) {
  if (matches.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {matches.map((match) => {
        const score = unitedScore(match);
        return (
          <TouchableOpacity key={match.id} style={styles.card} onPress={() => onOpen(match)}>
            <View style={styles.cardTop}>
              <Text style={styles.comp}>{match.competition}</Text>
              <Text style={styles.status}>{matchStatusLabel(match.status)}</Text>
            </View>
            <Text style={styles.teams}>Man United · {match.opponent}</Text>
            <Text style={styles.meta}>
              {score ? `${score} · ` : ''}
              {formatKickoff(match.kickoff_at)} · {match.venue || 'Old Trafford'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  kicker: { color: UNITED_GOLD, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  lead: { color: '#94a3b8', marginTop: 6, marginBottom: 16 },
  section: { marginBottom: 8 },
  sectionTitle: { color: '#fff', fontWeight: '800', letterSpacing: 0.6, marginBottom: 10 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(218, 41, 28, 0.28)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  comp: { color: UNITED_GOLD, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  status: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
  teams: { color: '#fff', fontSize: 16, fontWeight: '800' },
  meta: { color: '#94a3b8', marginTop: 6, fontSize: 12 },
  detail: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(218, 41, 28, 0.35)',
  },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backText: { color: UNITED_RED, fontWeight: '700' },
  detailTeams: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 8 },
  score: { color: UNITED_RED, fontSize: 36, fontWeight: '900', marginVertical: 10 },
});
