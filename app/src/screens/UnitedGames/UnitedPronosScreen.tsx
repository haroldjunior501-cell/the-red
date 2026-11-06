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
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { UNITED_FORMATIONS, UNITED_PRONO_POINTS } from '../../constants/unitedGames';
import { PRONO_COLORS as C } from '../../constants/pronosColors';
import { useUnitedPronos } from '../../hooks/useUnitedPronos';
import type { HomeStackParamList } from '../../navigation/HomeStack';

const F = {
  bebas: 'BebasNeue_400Regular' as const,
  i600: 'Inter_600SemiBold' as const,
  i700: 'Inter_700Bold' as const,
  i800: 'Inter_800ExtraBold' as const,
};

function ScoreStepper({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const v = value ?? 0;
  return (
    <View style={styles.stepper}>
      <Pressable
        disabled={disabled}
        onPress={() => onChange(Math.max(0, v - 1))}
        style={[styles.stepBtn, disabled && styles.disabled]}
      >
        <Text style={styles.stepBtnT}>−</Text>
      </Pressable>
      <Text style={styles.stepVal}>{value == null ? '—' : value}</Text>
      <Pressable
        disabled={disabled}
        onPress={() => onChange(Math.min(15, v + 1))}
        style={[styles.stepBtn, disabled && styles.disabled]}
      >
        <Text style={styles.stepBtnT}>+</Text>
      </Pressable>
    </View>
  );
}

export default function UnitedPronosScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const {
    segment,
    setSegment,
    match,
    squad,
    draft,
    saved,
    loading,
    saving,
    error,
    lineupOpen,
    marketsOpen,
    minsToLineupLock,
    unitedIsHome,
    updateDraft,
    toggleStarter,
    submit,
  } = useUnitedPronos();

  const kickLabel = useMemo(() => {
    if (!match?.date) return '';
    return new Date(match.date).toLocaleString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [match?.date]);

  const maxLineupPts =
    UNITED_PRONO_POINTS.lineupFormation + 11 * UNITED_PRONO_POINTS.lineupStarterEach;

  return (
    <ScreenAmbience>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={C.text2} />
          </Pressable>
          <Text style={styles.title}>PRONOS UNITED</Text>
          <Pressable
            onPress={() => navigation.navigate('UnitedStandings')}
            style={styles.rankBtn}
            hitSlop={8}
          >
            <MaterialCommunityIcons name="trophy-outline" size={22} color={C.gold} />
          </Pressable>
        </View>

        <View style={styles.segRow}>
          {(['men', 'women'] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSegment(s)}
              style={[styles.seg, segment === s && styles.segOn]}
            >
              <Text style={[styles.segT, segment === s && styles.segTOn]}>
                {s === 'men' ? 'Hommes' : 'Femmes'}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={C.blue} style={{ marginTop: 40 }} />
        ) : !match ? (
          <View style={styles.empty}>
            <Text style={styles.emptyT}>Aucun prochain match</Text>
            <Text style={styles.emptyS}>Reviens bientôt pour pronostiquer.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={['rgba(41,121,255,0.16)', 'rgba(12,8,20,0.9)']}
              style={styles.matchCard}
            >
              <Text style={styles.phase}>{match.phase}</Text>
              <View style={styles.teams}>
                <View style={styles.teamCol}>
                  {match.home.logo ? (
                    <Image source={{ uri: match.home.logo }} style={styles.logo} />
                  ) : null}
                  <Text style={styles.teamName} numberOfLines={2}>
                    {match.home.name}
                  </Text>
                </View>
                <View style={styles.vsCol}>
                  <Text style={styles.vs}>VS</Text>
                  <Text style={styles.kick}>{kickLabel}</Text>
                </View>
                <View style={styles.teamCol}>
                  {match.away.logo ? (
                    <Image source={{ uri: match.away.logo }} style={styles.logo} />
                  ) : null}
                  <Text style={styles.teamName} numberOfLines={2}>
                    {match.away.name}
                  </Text>
                </View>
              </View>
              <View style={styles.lockRow}>
                <Text style={styles.lockTxt}>
                  {lineupOpen
                    ? `Composition · verrou dans ${minsToLineupLock} min`
                    : 'Composition verrouillée (−90′)'}
                </Text>
                <Text style={styles.lockTxt}>
                  {marketsOpen ? 'Score / buteur / POTM · jusqu’au KO' : 'Marchés verrouillés (KO)'}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.scale}>
              <Text style={styles.secTitle}>BARÈME</Text>
              <Text style={styles.scaleLine}>
                Composition · +{UNITED_PRONO_POINTS.lineupFormation} formation · +
                {UNITED_PRONO_POINTS.lineupStarterEach}/joueur (max {maxLineupPts})
              </Text>
              <Text style={styles.scaleLine}>
                Premier buteur United · +{UNITED_PRONO_POINTS.firstScorer} · Homme du match · +
                {UNITED_PRONO_POINTS.playerOfTheMatch} · Score exact · +
                {UNITED_PRONO_POINTS.finalResult}
              </Text>
              <Text style={styles.scaleHint}>
                Points Hommes + Femmes → classement mensuel & saison · bons boutique club
              </Text>
            </View>

            <Text style={styles.secTitle}>RÉSULTAT FINAL · +{UNITED_PRONO_POINTS.finalResult}</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreSide}>
                <Text style={styles.scoreLabel}>{unitedIsHome ? 'United' : match.home.name}</Text>
                <ScoreStepper
                  value={unitedIsHome ? draft.homeScore : draft.awayScore}
                  disabled={!marketsOpen}
                  onChange={(n) =>
                    updateDraft(unitedIsHome ? { homeScore: n } : { awayScore: n })
                  }
                />
              </View>
              <Text style={styles.scoreDash}>–</Text>
              <View style={styles.scoreSide}>
                <Text style={styles.scoreLabel}>{unitedIsHome ? match.away.name : 'United'}</Text>
                <ScoreStepper
                  value={unitedIsHome ? draft.awayScore : draft.homeScore}
                  disabled={!marketsOpen}
                  onChange={(n) =>
                    updateDraft(unitedIsHome ? { awayScore: n } : { homeScore: n })
                  }
                />
              </View>
            </View>

            <Text style={styles.secTitle}>
              PREMIER BUTEUR UNITED · +{UNITED_PRONO_POINTS.firstScorer}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {squad
                .filter((p) => p.roleKey !== 'keeper')
                .slice(0, 24)
                .map((p) => {
                  const on = draft.firstScorerId === String(p.id);
                  return (
                    <Pressable
                      key={`sc-${p.id}`}
                      disabled={!marketsOpen}
                      onPress={() =>
                        updateDraft({
                          firstScorerId: String(p.id),
                          firstScorerName: p.name,
                        })
                      }
                      style={[styles.chip, on && styles.chipOn, !marketsOpen && styles.disabled]}
                    >
                      <Text style={[styles.chipT, on && styles.chipTOn]} numberOfLines={1}>
                        {p.name}
                      </Text>
                    </Pressable>
                  );
                })}
            </ScrollView>

            <Text style={styles.secTitle}>
              HOMME DU MATCH · +{UNITED_PRONO_POINTS.playerOfTheMatch}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {squad.slice(0, 28).map((p) => {
                const on = draft.potmId === String(p.id);
                return (
                  <Pressable
                    key={`pm-${p.id}`}
                    disabled={!marketsOpen}
                    onPress={() => updateDraft({ potmId: String(p.id), potmName: p.name })}
                    style={[styles.chip, on && styles.chipOn, !marketsOpen && styles.disabled]}
                  >
                    <Text style={[styles.chipT, on && styles.chipTOn]} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.secTitle}>
              COMPOSITION · +{UNITED_PRONO_POINTS.lineupFormation} +{' '}
              {UNITED_PRONO_POINTS.lineupStarterEach}/titulaire
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {UNITED_FORMATIONS.map((f) => {
                const on = draft.formation === f;
                return (
                  <Pressable
                    key={f}
                    disabled={!lineupOpen}
                    onPress={() => updateDraft({ formation: f })}
                    style={[styles.chip, on && styles.chipOn, !lineupOpen && styles.disabled]}
                  >
                    <Text style={[styles.chipT, on && styles.chipTOn]}>{f}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text style={styles.pickCount}>{draft.starters.length}/11 titularisés</Text>
            <View style={styles.squadGrid}>
              {squad.map((p) => {
                const on = draft.starters.includes(String(p.id));
                return (
                  <Pressable
                    key={p.id}
                    disabled={!lineupOpen}
                    onPress={() => toggleStarter(String(p.id))}
                    style={[styles.playerCell, on && styles.playerOn, !lineupOpen && styles.disabled]}
                  >
                    {p.photo ? (
                      <Image source={{ uri: p.photo }} style={styles.playerPhoto} />
                    ) : (
                      <View style={[styles.playerPhoto, styles.photoPh]} />
                    )}
                    <Text style={styles.playerName} numberOfLines={1}>
                      {p.shirtNumber != null ? `${p.shirtNumber}. ` : ''}
                      {p.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {error ? <Text style={styles.err}>{error}</Text> : null}
            {saved ? (
              <Text style={styles.saved}>Pronostic enregistré — modifiable jusqu’aux verrous</Text>
            ) : null}

            <Pressable
              onPress={() => void submit()}
              disabled={saving || (!marketsOpen && !lineupOpen)}
              style={[styles.cta, (!marketsOpen && !lineupOpen) && styles.disabled]}
            >
              <LinearGradient
                colors={[C.blue, '#1a4fb8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGrad}
              >
                <Text style={styles.ctaT}>{saving ? 'Enregistrement…' : 'Valider mes pronos'}</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  back: { padding: 4 },
  title: {
    flex: 1,
    fontFamily: F.bebas,
    fontSize: 26,
    letterSpacing: 2,
    color: C.text,
    marginLeft: 4,
  },
  rankBtn: { padding: 8 },
  segRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
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
  segT: { color: C.muted2, fontFamily: F.i700, fontSize: 13 },
  segTOn: { color: C.blue2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  matchCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  phase: { color: C.muted2, fontFamily: F.i600, fontSize: 12, marginBottom: 10 },
  teams: { flexDirection: 'row', alignItems: 'center' },
  teamCol: { flex: 1, alignItems: 'center', gap: 6 },
  logo: { width: 48, height: 48 },
  teamName: {
    color: C.text,
    fontFamily: F.i700,
    fontSize: 13,
    textAlign: 'center',
  },
  vsCol: { alignItems: 'center', paddingHorizontal: 8 },
  vs: { fontFamily: F.bebas, fontSize: 22, color: C.blue2 },
  kick: { color: C.muted, fontSize: 11, marginTop: 4, textAlign: 'center' },
  lockRow: { marginTop: 12, gap: 4 },
  lockTxt: { color: C.muted2, fontSize: 12, fontFamily: F.i600 },
  scale: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 18,
  },
  scaleLine: { color: C.text2, fontSize: 12, lineHeight: 18, marginTop: 4 },
  scaleHint: { color: C.gold, fontSize: 11, marginTop: 8, fontFamily: F.i600 },
  secTitle: {
    fontFamily: F.bebas,
    fontSize: 18,
    letterSpacing: 1,
    color: C.text,
    marginBottom: 10,
    marginTop: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  scoreSide: { alignItems: 'center', gap: 8, flex: 1 },
  scoreLabel: { color: C.muted2, fontFamily: F.i600, fontSize: 12, textAlign: 'center' },
  scoreDash: { color: C.text, fontSize: 28, fontFamily: F.bebas },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.blueFill,
    borderWidth: 1,
    borderColor: C.blueBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnT: { color: C.text, fontSize: 20, fontFamily: F.i700 },
  stepVal: {
    minWidth: 28,
    textAlign: 'center',
    color: C.text,
    fontFamily: F.bebas,
    fontSize: 28,
  },
  chipScroll: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    marginRight: 8,
    maxWidth: 160,
  },
  chipOn: { borderColor: C.blueBorder, backgroundColor: C.blueFill },
  chipT: { color: C.muted2, fontFamily: F.i600, fontSize: 12 },
  chipTOn: { color: C.text },
  pickCount: { color: C.muted2, fontFamily: F.i600, fontSize: 12, marginBottom: 8 },
  squadGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  playerCell: {
    width: '31%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    padding: 8,
    alignItems: 'center',
  },
  playerOn: { borderColor: C.greenBorder, backgroundColor: C.greenBg },
  playerPhoto: { width: 40, height: 40, borderRadius: 20, marginBottom: 6 },
  photoPh: { backgroundColor: 'rgba(255,255,255,0.08)' },
  playerName: { color: C.text2, fontSize: 10, fontFamily: F.i600, textAlign: 'center' },
  err: { color: C.orange, marginTop: 12, fontFamily: F.i600 },
  saved: { color: C.green, marginTop: 10, fontFamily: F.i600, fontSize: 13 },
  cta: { marginTop: 18, borderRadius: 14, overflow: 'hidden' },
  ctaGrad: { paddingVertical: 16, alignItems: 'center' },
  ctaT: { color: '#fff', fontFamily: F.i800, fontSize: 15, letterSpacing: 0.3 },
  disabled: { opacity: 0.45 },
  empty: { padding: 32, alignItems: 'center' },
  emptyT: { color: C.text, fontFamily: F.i800, fontSize: 16 },
  emptyS: { color: C.muted, marginTop: 8 },
});
