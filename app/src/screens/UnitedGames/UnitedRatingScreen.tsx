import React, { useCallback, useEffect, useState } from 'react';
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
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { FOTMOB_MU_TEAM_ID } from '../../constants/fotmobTheRed';
import { PRONO_COLORS as C } from '../../constants/pronosColors';
import { useFirebaseAuthUid } from '../../hooks/useFirebaseAuthUid';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import {
  fetchManchesterUnitedTeam,
  pickUnitedLastFinished,
} from '../../services/fotmobClubApi';
import { fetchFotmobSquad, type SquadMember } from '../../services/fotmobSquad';
import {
  addFanPoints,
  loadPlayerRatings,
  savePlayerRatings,
} from '../../services/unitedGamesService';
import type { UnitedPlayerRating } from '../../types/unitedGames.types';
import type { WorldCupMatch } from '../../services/footballService';

const F = {
  bebas: 'BebasNeue_400Regular' as const,
  i600: 'Inter_600SemiBold' as const,
  i700: 'Inter_700Bold' as const,
  i800: 'Inter_800ExtraBold' as const,
};

export default function UnitedRatingScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const uid = useFirebaseAuthUid();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [match, setMatch] = useState<WorldCupMatch | null>(null);
  const [squad, setSquad] = useState<SquadMember[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [payload, sq] = await Promise.all([
          fetchManchesterUnitedTeam(),
          fetchFotmobSquad(FOTMOB_MU_TEAM_ID),
        ]);
        if (cancelled) return;
        const last = pickUnitedLastFinished(payload);
        setMatch(last);
        setSquad(sq.slice(0, 18));
        if (last && uid) {
          const prev = await loadPlayerRatings(uid, last.fixtureId);
          if (prev?.length) {
            const map: Record<string, number> = {};
            for (const r of prev) map[r.playerId] = r.rating;
            setRatings(map);
            setDone(true);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const setRating = useCallback((playerId: string, rating: number) => {
    setRatings((r) => ({ ...r, [playerId]: rating }));
    setDone(false);
  }, []);

  const submit = useCallback(async () => {
    if (!uid) {
      setError('Connecte-toi pour noter');
      return;
    }
    if (!match) return;
    const rows: UnitedPlayerRating[] = Object.entries(ratings).map(([playerId, rating]) => {
      const p = squad.find((s) => String(s.id) === playerId);
      return {
        matchId: match.fixtureId,
        playerId,
        playerName: p?.name ?? playerId,
        rating,
        submittedAt: Date.now(),
      };
    });
    if (rows.length < 5) {
      setError('Note au moins 5 joueurs');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await savePlayerRatings(uid, match.fixtureId, rows);
      await addFanPoints(uid, 10, 'men');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }, [match, ratings, squad, uid]);

  return (
    <ScreenAmbience>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={C.text2} />
          </Pressable>
          <Text style={styles.title}>NOTE LES JOUEURS</Text>
        </View>
        <Text style={styles.sub}>
          Après chaque match, note les performances United (1–10). +10 pts fan à la validation.
        </Text>

        {loading ? (
          <ActivityIndicator color={C.blue} style={{ marginTop: 40 }} />
        ) : !match ? (
          <Text style={styles.empty}>Pas de match récent à noter.</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.matchLbl}>
              {match.home.name} {match.goals.home ?? '–'}–{match.goals.away ?? '–'} {match.away.name}
            </Text>
            {squad.map((p) => {
              const val = ratings[String(p.id)] ?? 0;
              return (
                <View key={p.id} style={styles.row}>
                  {p.photo ? (
                    <Image source={{ uri: p.photo }} style={styles.photo} />
                  ) : (
                    <View style={[styles.photo, styles.ph]} />
                  )}
                  <View style={styles.mid}>
                    <Text style={styles.name} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <Pressable key={n} onPress={() => setRating(String(p.id), n)} hitSlop={2}>
                          <Text style={[styles.star, n <= val && styles.starOn]}>{n <= val ? '●' : '○'}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.val}>{val || '—'}</Text>
                </View>
              );
            })}
            {error ? <Text style={styles.err}>{error}</Text> : null}
            {done ? <Text style={styles.ok}>Notes enregistrées · +10 pts</Text> : null}
            <Pressable onPress={() => void submit()} disabled={saving} style={styles.cta}>
              <LinearGradient colors={['#9b6dff', '#5a3aad']} style={styles.ctaGrad}>
                <Text style={styles.ctaT}>{saving ? '…' : 'Valider mes notes'}</Text>
              </LinearGradient>
            </Pressable>
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
  sub: { color: C.muted2, paddingHorizontal: 16, marginBottom: 10, fontSize: 13, lineHeight: 18 },
  empty: { color: C.muted, textAlign: 'center', marginTop: 40 },
  scroll: { paddingHorizontal: 16 },
  matchLbl: {
    fontFamily: F.i700,
    color: C.text2,
    marginBottom: 14,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  photo: { width: 40, height: 40, borderRadius: 20 },
  ph: { backgroundColor: 'rgba(255,255,255,0.08)' },
  mid: { flex: 1 },
  name: { color: C.text, fontFamily: F.i700, fontSize: 13, marginBottom: 4 },
  stars: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  star: { color: C.muted, fontSize: 10, width: 12, textAlign: 'center' },
  starOn: { color: '#9b6dff' },
  val: { color: C.text, fontFamily: F.bebas, fontSize: 22, minWidth: 28, textAlign: 'right' },
  err: { color: C.orange, marginTop: 10, fontFamily: F.i600 },
  ok: { color: C.green, marginTop: 10, fontFamily: F.i600 },
  cta: { marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  ctaGrad: { paddingVertical: 16, alignItems: 'center' },
  ctaT: { color: '#fff', fontFamily: F.i800, fontSize: 15 },
});
