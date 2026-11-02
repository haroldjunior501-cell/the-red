import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { TabsParamList } from '../../navigation/AppTabs';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { useNationPower } from '../../hooks/useNationPower';
import { useWorldRanking } from '../../hooks/useWorldRanking';
import { NationPowerBar } from './components/NationPowerBar';
import { VenezJouer } from './components/VenezJouer';
import { WorldRanking } from './components/WorldRanking';
import { COUNTRIES } from '../../constants/countries';
import { findWc2026MatchById } from '../../data/wc2026Matches';
import { useWorldCup } from '../../hooks/useWorldCup';
import { useTopAssisters } from '../../hooks/useTopAssisters';
import { useTeamStatsRanking } from '../../hooks/useTeamStatsRanking';
import {
  PLAYER_TAB_TO_KIND,
  TEAM_TAB_TO_KIND,
  playerStatColumnLabel,
  type PlayerStatKind,
  type TeamStatKind,
} from '../../constants/homeStats';
import { usePreMatchInsights, type PreMatchModalKind } from '../../hooks/usePreMatchInsights';
import { PreMatchModals } from './components/PreMatchModals';
import { useFantasyEconomy } from '../../hooks/useFantasyEconomy';
import { useUserStore } from '../../store/useUserStore';
import { UserAvatar } from '../../components/arena/UserAvatar';
import { COLORS } from '../../constants/colors';
import { LIGHT } from '../../constants/lighting';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import type { FormChar, WorldCupMatch } from '../../services/footballService';
import { StoriesRow } from './components/StoriesRow';
import { StoryPlayerModal } from './components/StoryPlayerModal';
import { MomentsFortsSection } from './components/MomentsFortsSection';
import { ImmanquableGrid } from './components/ImmanquableGrid';
import { HomeLoopVideo } from './components/HomeLoopVideo';
import { useStories } from '../../hooks/useStories';
import { useVideos } from '../../hooks/useVideos';
import { useSeenStories } from '../../hooks/useSeenStories';

const HERO_BG_VIDEO = require('../../../assets/the-red/home-bg.mp4');

type Mdi = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const F = {
  bebas: 'BebasNeue_400Regular' as const,
  i400: 'Inter_400Regular' as const,
  i500: 'Inter_500Medium' as const,
  i600: 'Inter_600SemiBold' as const,
  i700: 'Inter_700Bold' as const,
  i800: 'Inter_800ExtraBold' as const,
  i900: 'Inter_900Black' as const,
};

const DS = {
  bg: COLORS.bgSecondary,
  card: COLORS.card,
  border: COLORS.borderLight,
  green: COLORS.primary,
  greenDeep: COLORS.primaryDim,
  gold: COLORS.accentGold,
  red: COLORS.live,
  gray: COLORS.textSecondary,
  white: COLORS.text,
  radius: 16,
  ph: 16,
} as const;

const STORY_SIZE = 80;
const WC_JUNE_11_UTC = Date.UTC(2026, 5, 11, 0, 0, 0);

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

function formatCountdownUtc(targetUtcMs: number, nowMs: number) {
  const ms = Math.max(0, targetUtcMs - nowMs);
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${pad2(days)}j · ${pad2(hours)}h · ${pad2(mins)}m · ${pad2(secs)}s`;
}

function normalizeName(s: string) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function findCountry(teamName: string) {
  const n = normalizeName(teamName);
  return COUNTRIES.find((c) => normalizeName(c.name) === n);
}

function pickSides(match: WorldCupMatch, userCountryName: string) {
  const u = normalizeName(userCountryName);
  const h = normalizeName(match.home.name);
  const a = normalizeName(match.away.name);
  if (u && (h === u || h.includes(u) || u.includes(h))) return { self: match.home, opp: match.away };
  if (u && (a === u || a.includes(u) || u.includes(a))) return { self: match.away, opp: match.home };
  return { self: match.home, opp: match.away };
}

function getCountryColor(code: string): string {
  const c = (code || '').toUpperCase();
  const map: Record<string, string> = {
    FR: '#1A3A8A',
    BR: '#1A6B1A',
    AR: '#87CEEB',
    DE: '#888888',
    MA: '#C41E3A',
    PT: '#006600',
    ES: '#FFD700',
    IT: '#0066CC',
    NL: '#FF6600',
    BE: '#C8102E',
    EN: '#FFFFFF',
    US: '#3C3B6E',
    MX: '#006847',
    SN: '#00853F',
    JP: '#BC002D',
    KR: '#C60C30',
    AU: '#FFCD00',
    CA: '#D80621',
  };
  return map[c] ?? '#1A3520';
}

function getHeroAmbient(code: string): readonly [string, string, string] {
  const a = getCountryColor(code);
  return [`${a}33`, `${a}18`, 'rgba(8,12,9,0.92)'] as const;
}

function chapterLabelFromRound(round: string): { n: number; label: string } {
  const r = normalizeName(round);
  if (!r) return { n: 1, label: 'PHASE EN COURS' };
  if (r.includes('group')) return { n: 1, label: 'PHASE DE GROUPES' };
  if (r.includes('16') || r.includes('round of 16') || r.includes('8th')) return { n: 2, label: 'HUITIÈMES' };
  if (r.includes('quarter')) return { n: 3, label: 'QUARTS' };
  if (r.includes('semi')) return { n: 4, label: 'DEMI-FINALES' };
  if (r.includes('final')) return { n: 5, label: 'FINALE' };
  return { n: 1, label: round.replace(/\s+/g, ' ').toUpperCase() };
}

const TabPill = memo(function TabPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={active ? s.tabOnWrap : s.tabOff}>
      {active ? (
        <View style={s.tabGradFill}>
          <Text style={s.tabTxtOn}>{label}</Text>
        </View>
      ) : (
        <Text style={s.tabTxtOff}>{label}</Text>
      )}
    </TouchableOpacity>
  );
});

type HomeNav = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'HomeFeed'>,
  BottomTabNavigationProp<TabsParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const name = useUserStore((st) => st.name);
  const countryCode = useUserStore((st) => st.countryCode);
  const userId = useUserStore((st) => st.userId);
  const { fantasyPoints, loading: fpLoading, refresh: refreshFantasyPoints } = useFantasyEconomy(userId);

  useFocusEffect(
    useCallback(() => {
      void refreshFantasyPoints();
    }, [refreshFantasyPoints])
  );

  const country = useMemo(() => COUNTRIES.find((c) => c.code === countryCode), [countryCode]);
  const flag = country?.flag ?? '';
  const countryName = country?.name ?? 'Ton pays';

  const {
    nextMatch,
    liveMatch,
    liveDetail,
    topScorers,
    teamStats,
    formSelf,
    formOpp,
    injuries,
    h2h,
    oppCode,
    loadingStatic,
    loadingLive,
    emptyData,
  } = useWorldCup(countryCode?.trim() || 'FR');

  const [prepModal, setPrepModal] = useState<PreMatchModalKind>(null);
  const {
    h2hDetail,
    h2hLoading,
    formSelf: formSelfDetail,
    formOpp: formOppDetail,
    formLoading,
  } = usePreMatchInsights(prepModal, countryCode || '', oppCode);

  const openPrepModal = useCallback((kind: PreMatchModalKind) => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrepModal(kind);
  }, []);

  const matchUi = nextMatch ?? liveMatch;
  const sides = useMemo(() => (matchUi ? pickSides(matchUi, countryName) : null), [matchUi, countryName]);

  const self = useMemo(() => {
    if (!sides) return { flag, code: countryCode || '—', name: countryName, logo: undefined as string | undefined };
    const m = findCountry(sides.self.name);
    return { flag: m?.flag ?? flag, code: m?.code ?? (countryCode || '—'), name: m?.name ?? countryName, logo: sides.self.logo };
  }, [countryCode, countryName, flag, sides]);

  const opp = useMemo(() => {
    if (!sides) return { flag: '', code: '—', name: '—', logo: undefined as string | undefined };
    const m = findCountry(sides.opp.name);
    return { flag: m?.flag ?? '', code: m?.code ?? '—', name: m?.name ?? sides.opp.name, logo: sides.opp.logo };
  }, [sides]);

  const [tickMs, setTickMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTickMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdownMs = useMemo(() => (nextMatch ? new Date(nextMatch.date).getTime() : WC_JUNE_11_UTC), [nextMatch]);
  const countdownStr = useMemo(
    () => (liveMatch && !nextMatch ? 'EN DIRECT' : formatCountdownUtc(countdownMs, tickMs)),
    [countdownMs, liveMatch, nextMatch, tickMs]
  );

  const chapterLine = useMemo(() => {
    if (tickMs < WC_JUNE_11_UTC) return "CHAPITRE 0 · AVANT LE COUP D'ENVOI";
    const round = nextMatch?.phase ?? liveMatch?.phase ?? '';
    const { n, label } = chapterLabelFromRound(round);
    return `CHAPITRE ${n} · ${label}`;
  }, [liveMatch?.phase, nextMatch?.phase, tickMs]);

  const phaseStr = useMemo(() => {
    const r = (nextMatch?.phase ?? liveMatch?.phase ?? '').trim();
    return r ? r.replace(/\s+/g, ' ').toUpperCase() : 'PHASE';
  }, [liveMatch?.phase, nextMatch?.phase]);

  const { stories, loading: storiesLoading } = useStories(20);
  const { isSeen: isStorySeen, markSeen: markStorySeen } = useSeenStories();
  const { videos: momentsVideos, loading: momentsVideosLoading } = useVideos(20, 'moments_forts');
  const { videos: immanquableVideos, loading: immanquableVideosLoading } = useVideos(20, 'immanquable');

  const [storyOpen, setStoryOpen] = useState(false);
  const [storyStart, setStoryStart] = useState(0);

  const [tabP, setTabP] = useState('Buts');
  const [tabT, setTabT] = useState('Buts');

  const activeFixtureId = nextMatch?.fixtureId ?? liveMatch?.fixtureId;
  const accent = getCountryColor(countryCode || 'FR');
  const ambient = getHeroAmbient(countryCode || 'FR');

  const { power, worldRank, flag: nationFlag, nationLabel } = useNationPower();
  const { ranking: worldRanking, loading: rankingLoading } = useWorldRanking(8);

  const goPlayHub = useCallback(() => navigation.navigate('PlayHub'), [navigation]);
  const goTableau = useCallback(() => navigation.navigate('Tableau'), [navigation]);
  const goPronos = useCallback(() => navigation.navigate('Pronos'), [navigation]);
  const goArena = useCallback(() => {
    navigation.navigate('Arena');
  }, [navigation]);
  const goFantasy = useCallback(() => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('Fantasy');
    else navigation.navigate('Fantasy' as never);
  }, [navigation]);
  const goTopScorers = useCallback(
    () => navigation.navigate('PlayerStatsRanking', { stat: 'goals' }),
    [navigation]
  );

  const goMomentsFortsAll = useCallback(() => {
    navigation.navigate('MomentsFortsAll');
  }, [navigation]);

  const openMomentsFortsFeed = useCallback(
    (startIndex: number) => {
      if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const videoId = momentsVideos[startIndex]?.id;
      navigation.navigate('MomentsFortsFeed', { startIndex, videoId });
    },
    [navigation, momentsVideos]
  );

  const goImmanquableAll = useCallback(() => {
    navigation.navigate('ImmanquableAll');
  }, [navigation]);

  const openImmanquableFeed = useCallback(
    (startIndex: number) => {
      if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const videoId = immanquableVideos[startIndex]?.id;
      navigation.navigate('ImmanquableFeed', { startIndex, videoId });
    },
    [navigation, immanquableVideos]
  );

  const goPlayerStatsRanking = useCallback(
    (kind: PlayerStatKind) => navigation.navigate('PlayerStatsRanking', { stat: kind }),
    [navigation]
  );

  const goTeamStatsRanking = useCallback(
    (kind: TeamStatKind) => navigation.navigate('TeamStatsRanking', { stat: kind }),
    [navigation]
  );

  const playerStatKind = PLAYER_TAB_TO_KIND[tabP] ?? 'goals';
  const teamStatKind = TEAM_TAB_TO_KIND[tabT] ?? 'goals';
  const { rows: topAssisters } = useTopAssisters(5);
  const { rows: teamPreviewRows } = useTeamStatsRanking(teamStatKind, 5);

  const playerPreviewRows = useMemo(() => {
    if (playerStatKind === 'assists') {
      return topAssisters.slice(0, 3).map((r) => ({
        name: r.name,
        team: r.team,
        photo: r.photo,
        value: r.assists,
      }));
    }
    return topScorers.slice(0, 3).map((r) => ({
      name: r.name,
      team: r.team,
      photo: r.photo,
      value: playerStatKind === 'goals' ? r.goals : 0,
    }));
  }, [playerStatKind, topAssisters, topScorers]);
  const goMatchOverview = useCallback(() => {
    if (!matchUi) return;
    const wcLocal = findWc2026MatchById(matchUi.fixtureId);
    navigation.navigate('MatchDetails', {
      fixtureId: matchUi.fixtureId,
      selfCode: countryCode || self.code,
      oppCode: opp.code !== '—' ? opp.code : undefined,
      homeName: matchUi.home.name,
      awayName: matchUi.away.name,
      homeId: matchUi.home.id,
      awayId: matchUi.away.id,
      homeLogo: matchUi.home.logo,
      awayLogo: matchUi.away.logo,
      date: matchUi.date,
      phase: matchUi.phase,
      venue: wcLocal ? `${wcLocal.group} · ${wcLocal.date} · ${wcLocal.time}` : undefined,
    });
  }, [countryCode, matchUi, navigation, opp.code, self.code]);
  const goProfile = useCallback(() => navigation.navigate('Profile'), [navigation]);

  const avatarPressScale = useSharedValue(1);
  const avatarPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarPressScale.value }],
  }));
  const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);
  const renderFormPills = (chars: FormChar[]) =>
    chars.length ? (
      <View style={s.pills}>
        {chars.map((x, i) => (
          <View key={`${x}${i}`} style={[s.pill, x === 'G' ? s.pG : x === 'P' ? s.pP : s.pN]}>
            <Text style={s.pillT}>{x}</Text>
          </View>
        ))}
      </View>
    ) : (
      <Text style={s.subMuted}>—</Text>
    );

  const top1 = topScorers[0];

  return (
    <SafeAreaView style={s.safe}>
      <ScreenAmbience centerGlow>
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
        <View style={[s.wrap, { paddingHorizontal: DS.ph }]}>
          {emptyData && !loadingStatic ? (
            <View style={s.emptyBanner}>
              <Text style={s.emptyBannerT}>
                Calendrier Manchester United chargé. Les scores live s’affichent dès que le flux est disponible.
              </Text>
            </View>
          ) : null}

          {/* 1 Header */}
          <View style={s.hdrRow}>
            <AnimatedPressable
              style={[s.hdrL, avatarPressStyle]}
              onPress={goProfile}
              onPressIn={() => {
                avatarPressScale.value = withTiming(0.98, { duration: 120 });
              }}
              onPressOut={() => {
                avatarPressScale.value = withTiming(1, { duration: 120 });
              }}
              accessibilityRole="button"
              accessibilityLabel="Mon profil"
            >
              <View style={[s.avRing, { shadowColor: COLORS.primaryLight }]}>
                <UserAvatar userId={userId} displayName={name} countryCode={countryCode} size={40} />
              </View>
              <View style={s.hdrNameWrap}>
                <Text style={s.hdrName} numberOfLines={1}>
                  {(name || 'HAROLD').toUpperCase()}
                </Text>
              </View>
            </AnimatedPressable>
            <View style={s.hdrR}>
              <TouchableOpacity
                style={s.fpPill}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Fantasy')}
                accessibilityLabel="Fantasy Points"
              >
                <MaterialCommunityIcons name="diamond-stone" size={17} color={COLORS.primaryLight} />
                <Text style={s.fpAmt}>
                  {fpLoading ? '…' : fantasyPoints.toLocaleString('fr-FR')}
                </Text>
                <Text style={s.fpSuffix}>FP</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2 Hero vidéo */}
          <View style={[s.hero, { marginBottom: 16 }]}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <LinearGradient
                colors={[LIGHT.skyTop, LIGHT.skyMid, 'transparent']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={[s.radBlob, { backgroundColor: COLORS.primaryLight, opacity: 0.28, width: 320, height: 320, top: -24 }]} />
              <View style={[s.radBlob, { backgroundColor: accent, opacity: 0.18, width: 240, height: 240, top: 24 }]} />
              <LinearGradient colors={ambient} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
            </View>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <LinearGradient
                colors={[LIGHT.skyTop, LIGHT.skyMid, 'transparent']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={[s.radBlob, { backgroundColor: COLORS.primaryLight, opacity: 0.16, width: 320, height: 320, top: -24 }]} />
              <View style={[s.radBlob, { backgroundColor: accent, opacity: 0.1, width: 240, height: 240, top: 24 }]} />
              <LinearGradient colors={ambient} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
            </View>
            <View style={StyleSheet.absoluteFill} collapsable={false}>
              <HomeLoopVideo source={HERO_BG_VIDEO} shouldPlay isLooping isMuted style={s.heroVid} />
            </View>
            <LinearGradient
              colors={[LIGHT.videoLiftTop, 'transparent', LIGHT.videoTintBottom]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={s.heroMid}>
              <Text style={s.heroT1}>THE RED</Text>
              <Text style={s.heroT2}>UNITED</Text>
              <View style={s.heroSubRow}>
                <View style={s.heroDot} />
                <Text style={s.heroSub}>Live · Saison 1 · Aventure</Text>
              </View>
            </View>
          </View>

          {/* 3 Badge Chapitre */}
          <View style={[s.chap, { marginBottom: 16 }]}>
            <MaterialCommunityIcons name="book-open-page-variant" size={18} color={DS.gold} />
            <Text style={s.chapTxt} numberOfLines={2}>
              {chapterLine}
            </Text>
          </View>

          {/* 4 Bulles Stories */}
          <StoriesRow
            stories={stories}
            loading={storiesLoading}
            isSeen={isStorySeen}
            onOpen={(i) => {
              if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStoryStart(i);
              setStoryOpen(true);
            }}
          />

          {/* 5 Prochain Match */}
          <View style={{ marginBottom: 16 }}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>PROCHAIN MATCH</Text>
              <TouchableOpacity onPress={goMatchOverview}>
                <Text style={s.sectionAction}>Tout afficher</Text>
              </TouchableOpacity>
            </View>
            {loadingStatic ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={DS.green} size="large" />
              </View>
            ) : !matchUi ? (
              <View style={s.emptyMatch}>
                <MaterialCommunityIcons name="soccer" size={44} color={COLORS.primaryLight} />
                <Text style={s.emptyMatchT}>Match bientôt disponible</Text>
                <Text style={s.emptyMatchS}>Les données arrivent dès que le calendrier est publié.</Text>
              </View>
            ) : (
              <View style={s.nxInner}>
                <View style={s.nxCtx}>
                  <Text style={s.nxCtxT} numberOfLines={2}>
                    {liveMatch && liveDetail && !nextMatch
                      ? `En direct${liveDetail.minute != null ? ` · ${liveDetail.minute}'` : ''}`
                      : `Prochain rendez-vous`}
                  </Text>
                </View>
                <View style={s.nxRow}>
                  <View style={s.colL}>
                    {self.logo ? <Image source={{ uri: self.logo }} style={s.logo48} resizeMode="contain" /> : null}
                    <Text style={s.teamNm}>{self.name.toUpperCase()}</Text>
                    <Text style={s.teamCd}>{self.code}</Text>
                  </View>
                  <View style={s.colC}>
                    <Text style={s.vsTxt}>VS</Text>
                    {liveMatch && liveDetail ? (
                      <Text style={s.scoreLive}>{`${liveDetail.score.home} — ${liveDetail.score.away}`}</Text>
                    ) : null}
                    <Text style={s.cdBig}>{countdownStr}</Text>
                    <View style={s.liveLn}>
                      <View style={s.liveDotS} />
                      <Text style={s.liveTx}>Données live</Text>
                      {loadingLive ? <ActivityIndicator color={DS.green} size="small" style={{ marginLeft: 6 }} /> : null}
                    </View>
                  </View>
                  <View style={s.colR}>
                    {opp.logo ? <Image source={{ uri: opp.logo }} style={s.logo48} resizeMode="contain" /> : null}
                    <Text style={[s.teamNm, { textAlign: 'right' }]}>{opp.name.toUpperCase()}</Text>
                    <Text style={[s.teamCd, { textAlign: 'right' }]}>{opp.code}</Text>
                  </View>
                </View>
                <View style={s.nxFoot}>
                  <View style={s.phBadge}>
                    <Text style={s.phBadgeT}>{phaseStr}</Text>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 12, paddingRight: DS.ph }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={s.sub}
                    onPress={() => openPrepModal('h2h')}
                    accessibilityRole="button"
                    accessibilityLabel="Voir le face-à-face"
                  >
                    <Text style={s.subH}>FACE-À-FACE</Text>
                    {h2h ? (
                      <>
                        <Text style={s.subP}>
                          {self.code} {self.name} — {h2h.winsTeam1}V · {h2h.draws}N · {h2h.winsTeam2}P
                        </Text>
                        <View style={s.subDiv} />
                        <Text style={s.subP}>
                          {opp.code} {opp.name} — {h2h.winsTeam2}V · {h2h.draws}N · {h2h.winsTeam1}P
                        </Text>
                      </>
                    ) : (
                      <Text style={s.subP}>Historique direct indisponible.</Text>
                    )}
                    <Text style={s.subTap}>Voir le détail ›</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={s.sub}
                    onPress={() => openPrepModal('form')}
                    accessibilityRole="button"
                    accessibilityLabel="Voir la forme du moment"
                  >
                    <Text style={s.subH}>FORME DU MOMENT</Text>
                    <Text style={s.subLbl}>{self.code}</Text>
                    {renderFormPills(formSelf)}
                    <Text style={[s.subLbl, { marginTop: 10 }]}>{opp.code}</Text>
                    {renderFormPills(formOpp)}
                    <Text style={s.subTap}>Voir le détail ›</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={s.sub}
                    onPress={() => openPrepModal('injuries')}
                    accessibilityRole="button"
                    accessibilityLabel="Voir les absents"
                  >
                    <Text style={s.subH}>NE JOUE PAS</Text>
                    {injuries.length ? (
                      injuries.slice(0, 6).map((inj, i) => (
                        <Text key={`${inj.name}-${i}`} style={s.subP}>
                          {inj.name}
                          {inj.reason ? ` · ${inj.reason}` : ''}
                        </Text>
                      ))
                    ) : (
                      <Text style={s.subP}>Aucune blessure signalée.</Text>
                    )}
                    <Text style={s.subTap}>Voir le détail ›</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
          </View>

          {/* 6 Moments Forts */}
          <View style={{ marginBottom: 16 }}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>MOMENTS FORTS</Text>
              <TouchableOpacity onPress={goMomentsFortsAll}>
                <Text style={s.sectionAction}>Tout voir</Text>
              </TouchableOpacity>
            </View>
            <MomentsFortsSection
              videos={momentsVideos}
              loading={momentsVideosLoading}
              onOpen={openMomentsFortsFeed}
              maxItems={3}
            />
          </View>

          <NationPowerBar
            countryCode={countryCode || 'FR'}
            flag={nationFlag}
            countryName={nationLabel}
            power={power?.power ?? 0}
            rank={worldRank}
            supporterCount={power?.supporterCount ?? 0}
            dailyGain={power?.dailyGain ?? 0}
          />

          <VenezJouer
            onTableau={goTableau}
            onPronos={goPronos}
            onArena={goArena}
            onFantasy={goFantasy}
            onShowAll={goPlayHub}
          />

          <WorldRanking ranking={worldRanking} loading={rankingLoading} highlightCode={countryCode} />

          {/* 8 Immanquable — padding horizontal 18 par spec */}
          <View style={{ marginHorizontal: -DS.ph, paddingHorizontal: 18, marginBottom: 16 }}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>IMMANQUABLE</Text>
              <TouchableOpacity onPress={goImmanquableAll}>
                <Text style={s.sectionAction}>Tout voir</Text>
              </TouchableOpacity>
            </View>
            <ImmanquableGrid
              videos={immanquableVideos}
              loading={immanquableVideosLoading}
              onOpen={openImmanquableFeed}
              maxItems={4}
            />
          </View>

          {/* 9 Meilleurs Buteurs */}
          <View style={{ marginBottom: 16 }}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>MEILLEURS BUTEURS</Text>
              <TouchableOpacity onPress={goTopScorers}>
                <Text style={s.sectionAction}>Tout voir</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.95} onPress={goTopScorers} style={s.topHero}>
              <LinearGradient colors={['rgba(255,184,0,0.35)', '#0A120E']} style={StyleSheet.absoluteFill} />
              <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,30,10,0.85)']} style={StyleSheet.absoluteFill} />
              <View style={s.topRow}>
                <LinearGradient colors={['#bfa968', '#B8860B']} style={s.topBadgeGrad}>
                  <Text style={s.topBadgeT}>#1 MEILLEUR BUTEUR</Text>
                </LinearGradient>
              </View>
              <View style={s.topBot}>
                {top1?.photo ? (
                  <Image source={{ uri: top1.photo }} style={s.topHeroPhoto} resizeMode="cover" />
                ) : (
                  <View style={s.topHeroPhotoPh}>
                    <MaterialCommunityIcons name="account" size={36} color="rgba(255,255,255,0.35)" />
                  </View>
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.topName}>{top1?.name ?? '—'}</Text>
                  <Text style={s.topSub}>{top1?.team ?? 'Coupe du Monde'}</Text>
                </View>
                <View style={s.topGoalRing}>
                  <Text style={s.topGoalNum}>{top1 != null ? String(top1.goals) : '—'}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={s.list3}>
              {topScorers.slice(1, 4).map((row, idx) => {
                const r = idx + 2;
                const fc = (findCountry(row.team)?.code ?? countryCode) || 'FR';
                return (
                  <View key={`${row.name}-${r}`}>
                    <View style={s.listRow}>
                      <Text style={s.listRank}>#{r}</Text>
                      <LinearGradient colors={[`${getCountryColor(fc)}55`, 'rgba(8,12,9,0.96)']} style={s.listAv}>
                        <View style={s.listAvIcon}>
                          {row.photo ? (
                            <Image source={{ uri: row.photo }} style={{ width: 32, height: 32, borderRadius: 16 }} resizeMode="cover" />
                          ) : (
                            <MaterialCommunityIcons name="account" size={20} color="rgba(255,255,255,0.45)" />
                          )}
                        </View>
                      </LinearGradient>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={s.listName} numberOfLines={1}>
                          {row.name}
                        </Text>
                        <Text style={s.listSub} numberOfLines={1}>
                          {row.team}
                        </Text>
                      </View>
                      <Text style={s.listG}>{String(row.goals ?? '—')}</Text>
                    </View>
                    {idx < 2 ? <View style={s.rowSep} /> : null}
                  </View>
                );
              })}
            </View>
            <TouchableOpacity onPress={goTopScorers} style={{ paddingTop: 12 }}>
              <Text style={s.linkC}>Tout afficher ›</Text>
            </TouchableOpacity>
          </View>

          {/* 10 Stats Joueurs */}
          <View style={{ marginBottom: 16 }}>
            <Text style={s.h2}>STATS JOUEURS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 10, paddingRight: DS.ph }}>
              {Object.keys(PLAYER_TAB_TO_KIND).map((t) => (
                <TabPill key={t} label={t} active={tabP === t} onPress={() => setTabP(t)} />
              ))}
            </ScrollView>
            <TouchableOpacity activeOpacity={0.95} onPress={() => goPlayerStatsRanking(playerStatKind)}>
              <View style={s.tbl}>
                <View style={s.tblH}>
                  <Text style={s.tblHL}>JOUEUR</Text>
                  <Text style={s.tblHR}>{playerStatColumnLabel(playerStatKind)}</Text>
                </View>
                {playerPreviewRows.map((row, idx) => {
                  const r = idx + 1;
                  return (
                    <View key={`${row.name}-tbl-${r}`}>
                      <View style={s.tblR}>
                        <Text style={s.tblRank}>#{r}</Text>
                        <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(8,12,9,0.95)']} style={s.listAv}>
                          {row.photo ? (
                            <Image source={{ uri: row.photo }} style={{ width: 36, height: 36, borderRadius: 18 }} resizeMode="cover" />
                          ) : (
                            <MaterialCommunityIcons name="account" size={22} color="rgba(255,255,255,0.45)" />
                          )}
                        </LinearGradient>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={s.tblN} numberOfLines={1}>
                            {row.name}
                          </Text>
                          <Text style={s.tblS} numberOfLines={1}>
                            {row.team}
                          </Text>
                        </View>
                        <Text style={s.tblV}>
                          {playerStatKind === 'goals' || playerStatKind === 'assists'
                            ? String(row.value ?? '—')
                            : '—'}
                        </Text>
                      </View>
                      {idx < playerPreviewRows.length - 1 ? <View style={s.rowSep} /> : null}
                    </View>
                  );
                })}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goPlayerStatsRanking(playerStatKind)}>
              <Text style={[s.linkC, { marginTop: 12 }]}>Tout afficher ›</Text>
            </TouchableOpacity>
          </View>

          {/* 11 Stats Équipes */}
          <View style={{ marginBottom: 16 }}>
            <Text style={s.h2}>STATS PAR ÉQUIPES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 10, paddingRight: DS.ph }}>
              {Object.keys(TEAM_TAB_TO_KIND).map((t) => (
                <TabPill key={t} label={t} active={tabT === t} onPress={() => setTabT(t)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 10, paddingRight: DS.ph }}>
              {teamPreviewRows.slice(0, 3).map((row, idx) => (
                <TouchableOpacity
                  key={`${row.countryCode}-${idx}`}
                  activeOpacity={0.9}
                  onPress={() => goTeamStatsRanking(teamStatKind)}
                >
                  <LinearGradient colors={['#0E1A10', '#0A1409']} style={s.tc}>
                    <Text style={s.tcH}>{tabT.toUpperCase()}</Text>
                    <View style={s.tcR}>
                      <Text style={s.tcN}>{idx + 1}</Text>
                      <Text style={s.tcFlag}>{findCountry(row.teamName)?.flag ?? '🏳️'}</Text>
                      <Text style={s.tcP} numberOfLines={1}>
                        {row.teamName}
                      </Text>
                      <Text style={s.tcV}>{String(row.value)}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => goTeamStatsRanking(teamStatKind)}>
              <Text style={[s.linkC, { marginTop: 12 }]}>Tout afficher ›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </ScreenAmbience>

      <PreMatchModals
        visible={prepModal != null}
        kind={prepModal}
        onClose={() => setPrepModal(null)}
        self={self}
        opp={opp}
        h2hDetail={h2hDetail}
        h2hLoading={h2hLoading}
        formSelf={formSelfDetail}
        formOpp={formOppDetail}
        formLoading={formLoading}
        injuries={injuries}
      />

      <StoryPlayerModal
        visible={storyOpen}
        stories={stories}
        startIndex={storyStart}
        onStorySeen={markStorySeen}
        onClose={() => setStoryOpen(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.bg },
  wrap: { width: '100%', alignSelf: 'center' },
  mb16: { marginBottom: 16 },
  emptyBanner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.22)',
    backgroundColor: 'rgba(41, 121, 255, 0.06)',
    padding: 12,
    marginBottom: 16,
  },
  emptyBannerT: { color: 'rgba(255,255,255,0.82)', fontFamily: F.i600, fontSize: 13, lineHeight: 18, textAlign: 'center' },

  hdrRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, gap: 12 },
  hdrL: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  hdrNameWrap: { flex: 1, minWidth: 0, justifyContent: 'center' },
  hdrR: { flexShrink: 0, alignItems: 'flex-end' },
  avRing: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: DS.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
  avIn: { width: 40, height: 40, borderRadius: 999 },
  hdrName: { color: DS.white, fontFamily: F.bebas, fontSize: 22, letterSpacing: 2 },
  fpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    backgroundColor: COLORS.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  fpAmt: { color: '#E8F4FF', fontFamily: F.i800, fontSize: 14, letterSpacing: 0.3 },
  fpSuffix: { color: COLORS.primaryLight, fontFamily: F.i700, fontSize: 10, letterSpacing: 0.8 },

  hero: {
    height: 240,
    borderRadius: DS.radius,
    borderWidth: 1,
    borderColor: 'rgba(180, 206, 240, 0.2)',
    borderTopColor: LIGHT.cardHighlight,
    overflow: 'hidden',
    backgroundColor: '#0a1020',
    shadowColor: '#c8dcfa',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
  heroVid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  radBlob: { position: 'absolute', alignSelf: 'center', borderRadius: 999 },
  heroMid: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  heroT1: { color: DS.white, fontFamily: F.bebas, fontSize: 22, letterSpacing: 3 },
  heroT2: { color: DS.green, fontFamily: F.bebas, fontSize: 44, letterSpacing: 4, marginTop: -6 },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: DS.red },
  heroSub: { color: 'rgba(255,255,255,0.72)', fontFamily: F.i500, fontSize: 13 },

  chap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: DS.card, borderWidth: 1, borderColor: 'rgba(255,184,0,0.2)', borderRadius: 12, padding: 11 },
  chapTxt: { flex: 1, color: DS.gold, fontFamily: F.i700, fontSize: 12 },

  storiesScroll: { paddingHorizontal: 18, gap: 14, paddingVertical: 4 },
  storyWrap: { alignItems: 'center', width: 92 },
  storyCircle: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(180, 206, 240, 0.45)',
    backgroundColor: '#0f1726',
    shadowColor: '#b8cff0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  storyLabel: { marginTop: 8, color: DS.white, fontFamily: F.i600, fontSize: 11 },
  storySub: { marginTop: 2, color: 'rgba(255,255,255,0.6)', fontFamily: F.i400, fontSize: 10 },

  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: DS.white, fontFamily: F.i800, fontSize: 20 },
  sectionAction: { fontFamily: F.i700, fontSize: 13, color: DS.green },

  loadingBox: { height: 120, borderRadius: DS.radius, borderWidth: 1, borderColor: DS.border, backgroundColor: DS.card, alignItems: 'center', justifyContent: 'center' },
  emptyMatch: { minHeight: 120, borderRadius: DS.radius, borderWidth: 1, borderColor: DS.border, backgroundColor: DS.card, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8 },
  emptyMatchT: { color: DS.white, fontFamily: F.i700, fontSize: 16 },
  emptyMatchS: { color: DS.gray, fontFamily: F.i400, fontSize: 13, textAlign: 'center' },

  nxInner: {
    borderRadius: DS.radius,
    backgroundColor: DS.card,
    overflow: 'hidden',
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: DS.border,
  },
  nxCtx: { backgroundColor: 'rgba(41, 121, 255, 0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(41, 121, 255, 0.10)', paddingVertical: 10, paddingHorizontal: 12 },
  nxCtxT: { textAlign: 'center', color: 'rgba(255,255,255,0.78)', fontFamily: F.i600, fontSize: 12 },
  nxRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 14 },
  colL: { flex: 1, alignItems: 'flex-start', gap: 8 },
  colC: { flex: 0.95, alignItems: 'center', gap: 6 },
  colR: { flex: 1, alignItems: 'flex-end', gap: 8 },
  logo48: { width: 48, height: 48 },
  teamNm: { color: DS.white, fontFamily: F.i900, fontSize: 22 },
  teamCd: { color: 'rgba(255,255,255,0.55)', fontFamily: F.i600, fontSize: 11 },
  vsTxt: { color: 'rgba(255,255,255,0.15)', fontFamily: F.i700, fontSize: 14 },
  scoreLive: { color: DS.white, fontFamily: F.i700, fontSize: 18, marginBottom: 2 },
  cdBig: { color: DS.gold, fontFamily: F.bebas, fontSize: 32, letterSpacing: 4 },
  liveLn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  liveDotS: { width: 6, height: 6, borderRadius: 3, backgroundColor: DS.green },
  liveTx: { color: DS.green, fontFamily: F.i700, fontSize: 11 },
  nxFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 12, paddingTop: 14 },
  phBadge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(41, 121, 255, 0.12)', borderWidth: 1, borderColor: 'rgba(41, 121, 255, 0.20)' },
  phBadgeT: { color: DS.green, fontFamily: F.i800, fontSize: 11 },

  sub: { width: 210, borderRadius: 14, borderWidth: 1, borderColor: DS.border, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12 },
  subTap: { marginTop: 10, color: DS.green, fontFamily: F.i700, fontSize: 12 },
  subH: { color: 'rgba(255,255,255,0.5)', fontFamily: F.i700, fontSize: 11 },
  subP: { marginTop: 10, color: 'rgba(255,255,255,0.92)', fontFamily: F.i700, fontSize: 15, lineHeight: 20 },
  subLbl: { marginTop: 8, color: 'rgba(255,255,255,0.9)', fontFamily: F.i700, fontSize: 12 },
  subDiv: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 8 },
  subMuted: { marginTop: 10, color: 'rgba(255,255,255,0.45)', fontFamily: F.i500, fontSize: 12 },
  pills: { flexDirection: 'row', gap: 6, marginTop: 8 },
  pill: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pillT: { fontSize: 12, fontFamily: F.i900, color: DS.bg },
  pG: { backgroundColor: DS.green },
  pP: { backgroundColor: DS.red },
  pN: { backgroundColor: 'rgba(255,255,255,0.28)' },

  vCard: { height: 200, width: '100%', borderRadius: DS.radius, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: 'rgba(180, 206, 240, 0.22)', backgroundColor: '#0c121d' },
  badgeL: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  badgeR: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  badgeTxt: { color: DS.white, fontSize: 12, fontWeight: '700' },
  playBtn: { position: 'absolute', alignSelf: 'center', top: 74, width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  playCardIconWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  vBot: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  vTitle: { color: DS.white, fontFamily: F.i800, fontSize: 17 },
  vSub: { marginTop: 4, color: 'rgba(255,255,255,0.6)', fontFamily: F.i400, fontSize: 12 },
  vCount: { position: 'absolute', top: 10, alignSelf: 'center', color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: F.i700 },

  playCard: { minWidth: 160, width: 168, borderRadius: 16, borderWidth: 1, borderColor: DS.border, overflow: 'hidden', backgroundColor: '#0f1623' },
  playImg: { height: 100, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  playBody: { padding: 12 },
  playTitle: { color: DS.white, fontFamily: F.i800, fontSize: 15 },
  playDesc: { marginTop: 6, color: DS.gray, fontFamily: F.i400, fontSize: 12, lineHeight: 16 },
  playCta: { marginTop: 8, color: DS.green, fontFamily: F.i700, fontSize: 13 },

  immGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  immCard: { height: 155, borderRadius: 14, borderWidth: 1, borderColor: DS.border, overflow: 'hidden', backgroundColor: DS.card },
  immDecoIcon: { position: 'absolute', alignSelf: 'center', top: 36, alignItems: 'center', justifyContent: 'center' },
  immNew: {
    position: 'absolute',
    left: 10,
    top: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#2979ff',
  },
  immNewT: { color: '#0b111c', fontFamily: F.i800, fontSize: 9 },
  immBot: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  immTitle: { color: DS.white, fontFamily: F.i800, fontSize: 13 },
  immSub: { marginTop: 4, color: 'rgba(255,255,255,0.58)', fontFamily: F.i400, fontSize: 11 },

  topHero: { height: 160, borderRadius: DS.radius, borderWidth: 1, borderColor: DS.border, overflow: 'hidden', backgroundColor: DS.card, padding: 14, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  topBadgeGrad: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  topBadgeT: { color: DS.bg, fontFamily: F.i800, fontSize: 11, letterSpacing: 0.5 },
  topBot: { position: 'absolute', left: 14, right: 14, bottom: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  topName: { color: DS.white, fontFamily: F.i900, fontSize: 20 },
  topSub: { marginTop: 4, color: 'rgba(255,255,255,0.58)', fontFamily: F.i400, fontSize: 13 },
  topGoalRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: DS.green,
    backgroundColor: 'rgba(41, 121, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topGoalNum: { color: DS.green, fontFamily: F.bebas, fontSize: 34 },
  topHeroPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topHeroPhotoPh: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  list3: { marginTop: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  listRank: { width: 36, color: DS.gray, fontFamily: F.bebas, fontSize: 16 },
  listAv: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  listAvIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  listName: { color: DS.white, fontFamily: F.i700, fontSize: 14 },
  listSub: { marginTop: 3, color: 'rgba(255,255,255,0.55)', fontFamily: F.i400, fontSize: 11 },
  listG: { color: DS.white, fontFamily: F.i900, fontSize: 18 },
  linkC: { textAlign: 'center', color: DS.green, fontFamily: F.i800, fontSize: 15 },
  rowSep: { height: 1, marginVertical: 2, backgroundColor: 'rgba(255,255,255,0.06)' },

  h2: { color: DS.white, fontFamily: F.i800, fontSize: 20, marginTop: 6, marginBottom: 6 },
  tabOnWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: DS.green,
    shadowColor: DS.green,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  tabGradFill: { paddingHorizontal: 14, paddingVertical: 10 },
  tabTxtOn: { color: DS.bg, fontFamily: F.i700, fontSize: 12, textAlign: 'center' },
  tabOff: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabTxtOff: { color: 'rgba(255,255,255,0.78)', fontFamily: F.i700, fontSize: 12 },
  tbl: { marginTop: 10 },
  tblH: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  tblHL: { color: 'rgba(255,255,255,0.4)', fontFamily: F.i700, fontSize: 10, letterSpacing: 2 },
  tblHR: { color: 'rgba(255,255,255,0.4)', fontFamily: F.i700, fontSize: 10, letterSpacing: 2 },
  tblR: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  tblRank: { width: 34, color: DS.gray, fontFamily: F.bebas, fontSize: 14 },
  tblN: { color: DS.white, fontFamily: F.i900, fontSize: 16 },
  tblS: { marginTop: 3, color: 'rgba(255,255,255,0.55)', fontFamily: F.i400, fontSize: 12 },
  tblV: { color: DS.white, fontFamily: F.i900, fontSize: 16 },

  tc: { minWidth: 155, borderRadius: DS.radius, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 12 },
  tcH: { color: 'rgba(255,255,255,0.4)', fontFamily: F.i700, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  tcR: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  tcN: { width: 18, color: DS.gray, fontFamily: F.bebas, fontSize: 14 },
  tcF: { width: 24, alignItems: 'center', justifyContent: 'center' },
  tcFlag: { fontSize: 18, width: 28, textAlign: 'center' },
  tcP: { flex: 1, color: DS.white, fontFamily: F.i600, fontSize: 13 },
  tcV: { color: DS.white, fontFamily: F.i800, fontSize: 14 },
  tcSep: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginTop: 8 },

  modalRoot: { flex: 1, backgroundColor: '#000' },
  storyModalTop: { position: 'absolute', left: 0, right: 0, top: 0, paddingTop: 48, paddingHorizontal: 12, zIndex: 10 },
  storyProgTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.20)', borderRadius: 999, overflow: 'hidden' },
  storyProgFill: { height: 3, backgroundColor: DS.white },
  storyModalHeaderRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  storyModalTitle: { color: DS.white, fontFamily: F.i700, fontSize: 15, maxWidth: '70%' },
  storyModalX: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', zIndex: 2 },
  tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', zIndex: 2 },

  uclTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    zIndex: 10,
  },
  uclIconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  uclCenterTitle: { color: DS.white, fontFamily: F.i700, fontSize: 15, flex: 1, textAlign: 'center' },
  uclBottomPanel: { position: 'absolute', left: 16, right: 16, bottom: 28, zIndex: 10 },
  uclModalTitle: { color: DS.white, fontFamily: F.i800, fontSize: 20 },
  uclModalSub: { marginTop: 6, color: 'rgba(255,255,255,0.6)', fontFamily: F.i400, fontSize: 14 },
  uclNavRow: { marginTop: 14, flexDirection: 'row', gap: 12 },
  uclNavBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: DS.border, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  uclNavTxt: { color: DS.white, fontFamily: F.i800, fontSize: 14 },
});
