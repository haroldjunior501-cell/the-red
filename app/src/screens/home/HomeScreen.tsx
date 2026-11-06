import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useQuery } from '@tanstack/react-query';
import { ClubNewsCard } from './components/ClubNewsCard';
import { VenezJouer } from './components/VenezJouer';
import { PremierLeagueTableCard } from './components/PremierLeagueTableCard';
import {
  categoryLabel,
  fetchUnitedClubNews,
  relativeTimeFr,
} from '../../services/oneFootballNews';
import { useClubNewsWatch } from '../../hooks/useClubNewsWatch';
import { useClubNewsNotificationOpen } from '../../hooks/useClubNewsNotificationOpen';
import { COUNTRIES } from '../../constants/countries';
import { fotmobTeamLogoUrl } from '../../constants/fotmob';
import { FOTMOB_MU_FULL_NAME, FOTMOB_MU_TEAM_ID, FOTMOB_MU_TEAM_NAME } from '../../constants/fotmobTheRed';
import { useTheRedHome } from '../../hooks/useTheRedHome';
import { useUnitedPlayerStatRanking } from '../../hooks/useUnitedPlayerStatRanking';
import {
  PLAYER_TAB_TO_KIND,
  playerStatColumnLabel,
  type PlayerStatKind,
} from '../../constants/homeStats';
import type { PreMatchModalKind } from '../../hooks/usePreMatchInsights';
import { PreMatchModals } from './components/PreMatchModals';
import { useFantasyEconomy } from '../../hooks/useFantasyEconomy';
import { useUserStore } from '../../store/useUserStore';
import { UserAvatar } from '../../components/arena/UserAvatar';
import { COLORS } from '../../constants/colors';
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

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

function countdownParts(targetUtcMs: number, nowMs: number) {
  const ms = Math.max(0, targetUtcMs - nowMs);
  const totalSec = Math.floor(ms / 1000);
  return {
    days: pad2(Math.floor(totalSec / 86400)),
    hours: pad2(Math.floor((totalSec % 86400) / 3600)),
    mins: pad2(Math.floor((totalSec % 3600) / 60)),
    secs: pad2(totalSec % 60),
  };
}

function normalizeName(s: string) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isManchesterUnitedName(name: string) {
  const n = normalizeName(name);
  return (
    n.includes('manchester united') ||
    n === 'man united' ||
    n === 'man utd' ||
    n.includes('man united')
  );
}

function pickSides(match: WorldCupMatch) {
  const mu = String(FOTMOB_MU_TEAM_ID);
  if (match.home.id === mu || isManchesterUnitedName(match.home.name)) {
    return { self: match.home, opp: match.away };
  }
  if (match.away.id === mu || isManchesterUnitedName(match.away.name)) {
    return { self: match.away, opp: match.home };
  }
  return { self: match.home, opp: match.away };
}

function shortClubCode(name: string): string {
  const n = normalizeName(name);
  if (n.includes('manchester united') || n.includes('man united')) return 'MU';
  if (n.includes('manchester city') || n.includes('man city')) return 'MCI';
  if (n.includes('aston villa')) return 'AVL';
  if (n.includes('liverpool')) return 'LIV';
  if (n.includes('arsenal')) return 'ARS';
  if (n.includes('chelsea')) return 'CHE';
  if (n.includes('tottenham') || n.includes('spurs')) return 'TOT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1].slice(0, 2)).toUpperCase();
}

function findCountry(teamName: string) {
  const n = normalizeName(teamName);
  return COUNTRIES.find((c) => normalizeName(c.name) === n);
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
  const insets = useSafeAreaInsets();
  const name = useUserStore((st) => st.name);
  const countryCode = useUserStore((st) => st.countryCode);
  const userId = useUserStore((st) => st.userId);
  const { fantasyPoints, loading: fpLoading, refresh: refreshFantasyPoints } = useFantasyEconomy(userId);
  useClubNewsWatch(true);
  useClubNewsNotificationOpen();

  useFocusEffect(
    useCallback(() => {
      void refreshFantasyPoints();
    }, [refreshFantasyPoints])
  );

  const {
    nextMatch,
    liveMatch,
    liveDetail,
    topScorers,
    formSelf,
    formOpp,
    formSelfDetail,
    formOppDetail,
    injuries,
    injuriesOpp,
    h2h,
    h2hDetail,
    h2hLoading,
    formLoading,
    loadingStatic,
    loadingLive,
    emptyData,
    muStanding,
    leagueTable,
    matchStadium,
  } = useTheRedHome();

  const [prepModal, setPrepModal] = useState<PreMatchModalKind>(null);

  const openPrepModal = useCallback((kind: PreMatchModalKind) => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrepModal(kind);
  }, []);

  const matchUi = nextMatch ?? liveMatch;
  const sides = useMemo(() => (matchUi ? pickSides(matchUi) : null), [matchUi]);

  const muLogo = fotmobTeamLogoUrl(FOTMOB_MU_TEAM_ID);

  const self = useMemo(() => {
    if (!sides) {
      return {
        flag: '🔴',
        code: 'MU',
        name: FOTMOB_MU_TEAM_NAME,
        logo: muLogo,
      };
    }
    return {
      flag: '🔴',
      code: 'MU',
      name: sides.self.name || FOTMOB_MU_FULL_NAME,
      logo: sides.self.logo || muLogo,
    };
  }, [muLogo, sides]);

  const opp = useMemo(() => {
    if (!sides) return { flag: '', code: '—', name: '—', logo: undefined as string | undefined };
    return {
      flag: '',
      code: shortClubCode(sides.opp.name),
      name: sides.opp.name,
      logo: sides.opp.logo || fotmobTeamLogoUrl(sides.opp.id),
    };
  }, [sides]);

  const [tickMs, setTickMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTickMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdownMs = useMemo(
    () => (nextMatch ? new Date(nextMatch.date).getTime() : tickMs),
    [nextMatch, tickMs]
  );
  const isLiveNow = !!(liveMatch && !nextMatch);
  const cd = useMemo(() => countdownParts(countdownMs, tickMs), [countdownMs, tickMs]);

  const phaseStr = useMemo(() => {
    const r = (nextMatch?.phase ?? liveMatch?.phase ?? '').trim();
    return r ? r.replace(/\s+/g, ' ').toUpperCase() : 'PREMIER LEAGUE';
  }, [liveMatch?.phase, nextMatch?.phase]);

  const { stories, loading: storiesLoading } = useStories(20);
  const { isSeen: isStorySeen, markSeen: markStorySeen } = useSeenStories();
  const { videos: momentsVideos, loading: momentsVideosLoading } = useVideos(40, 'moments_forts');
  const { videos: immanquableVideos, loading: immanquableVideosLoading } = useVideos(40, 'immanquable');

  const [storyOpen, setStoryOpen] = useState(false);
  const [storyStart, setStoryStart] = useState(0);

  const [tabP, setTabP] = useState('Buts');

  const clubNewsPreview = useQuery({
    queryKey: ['thered', 'clubNews', 'united'] as const,
    queryFn: () => fetchUnitedClubNews(),
    staleTime: 60_000,
  });
  const topNews =
    clubNewsPreview.data?.find((n) => n.language === 'fr' && !!n.image_url) ??
    clubNewsPreview.data?.find((n) => !!n.image_url) ??
    clubNewsPreview.data?.[0] ??
    null;

  const goPlayHub = useCallback(() => navigation.navigate('PlayHub'), [navigation]);
  const goPremierLeagueTable = useCallback(
    () => navigation.navigate('PremierLeagueTable'),
    [navigation]
  );
  const goClubNews = useCallback(() => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ClubNews');
  }, [navigation]);
  const goPronos = useCallback(() => navigation.navigate('Pronos'), [navigation]);
  const goPickXi = useCallback(() => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('Fantasy');
    else navigation.navigate('PickYourXi');
  }, [navigation]);
  const goUnitedQuiz = useCallback(() => navigation.navigate('UnitedQuiz'), [navigation]);
  const goUnitedRating = useCallback(() => navigation.navigate('UnitedRating'), [navigation]);
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

  const playerStatKind = PLAYER_TAB_TO_KIND[tabP] ?? 'goals';
  const { rows: unitedStatRows } = useUnitedPlayerStatRanking(playerStatKind, 10);

  const playerPreviewRows = useMemo(
    () =>
      unitedStatRows.slice(0, 3).map((r) => ({
        name: r.name,
        team: r.team,
        photo: r.photo,
        value: r.value,
      })),
    [unitedStatRows]
  );
  const goMatchOverview = useCallback(() => {
    if (!matchUi) return;
    navigation.navigate('MatchDetails', {
      fixtureId: matchUi.fixtureId,
      selfCode: 'MU',
      oppCode: opp.code !== '—' ? opp.code : undefined,
      homeName: matchUi.home.name,
      awayName: matchUi.away.name,
      homeId: matchUi.home.id,
      awayId: matchUi.away.id,
      homeLogo: matchUi.home.logo,
      awayLogo: matchUi.away.logo,
      date: matchUi.date,
      phase: matchUi.phase,
      venue: matchUi.phase || 'Premier League',
    });
  }, [matchUi, navigation, opp.code]);
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

  const muStories = useMemo(
    () =>
      stories.filter((st) => {
        const blob = `${st.label ?? ''} ${st.country ?? ''} ${st.chapter ?? ''}`.toLowerCase();
        if (!blob.trim()) return true;
        const wc =
          blob.includes('world cup') ||
          blob.includes('coupe du monde') ||
          blob.includes('fifa') ||
          blob.includes('neymar') ||
          blob.includes('qatar') ||
          blob.includes('cdm');
        return !wc;
      }),
    [stories]
  );

  return (
    <View style={s.safe}>
      <ScreenAmbience centerGlow>
      {/* Profil collé sous la status bar — hors ScrollView */}
      <View style={[s.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
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
              <UserAvatar userId={userId} displayName={name} countryCode={countryCode} size={36} />
            </View>
            <View style={s.hdrNameWrap}>
              <Text style={s.hdrName} numberOfLines={1}>
                {(name || 'HAROLD').toUpperCase()}
              </Text>
              <Text style={s.hdrSub} numberOfLines={1}>
                Manchester United
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
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[s.wrap, { paddingHorizontal: DS.ph }]}>
          {emptyData && !loadingStatic ? (
            <View style={s.emptyBanner}>
              <Text style={s.emptyBannerT}>
                Connexion FotMob en cours. Le prochain match United s’affichera dès que le flux répond.
              </Text>
            </View>
          ) : null}

          {/* Hero */}
          <View style={[s.hero, { marginBottom: 12 }]}>
            <View style={StyleSheet.absoluteFill} collapsable={false}>
              <HomeLoopVideo source={HERO_BG_VIDEO} shouldPlay isLooping isMuted style={s.heroVid} />
            </View>
            <LinearGradient
              colors={['rgba(12,5,7,0.35)', 'transparent', 'rgba(12,5,7,0.88)']}
              locations={[0, 0.4, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={s.heroMid}>
              <Text style={s.heroT1}>THE RED</Text>
              <Text style={s.heroT2}>UNITED</Text>
              <View style={s.heroSubRow}>
                <View style={s.heroDot} />
                <Text style={s.heroSub}>Premier League · Fans United</Text>
              </View>
            </View>
          </View>

          {/* 3 Stories (filtre CDM) */}
          {muStories.length || storiesLoading ? (
            <StoriesRow
              stories={muStories}
              loading={storiesLoading}
              isSeen={isStorySeen}
              onOpen={(i) => {
                if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStoryStart(i);
                setStoryOpen(true);
              }}
            />
          ) : null}

          {/* 4 Prochain Match MU */}
          <View style={{ marginBottom: 16 }}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>PROCHAIN MATCH</Text>
              <TouchableOpacity onPress={goMatchOverview}>
                <Text style={s.sectionAction}>Détails</Text>
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
                <Text style={s.emptyMatchS}>Calendrier Manchester United via FotMob.</Text>
              </View>
            ) : (
              <View style={s.nxInner}>
                <View style={s.nxCtx}>
                  <Text style={s.nxCtxT} numberOfLines={1}>
                    {isLiveNow && liveDetail?.minute != null
                      ? `En direct · ${liveDetail.minute}'`
                      : phaseStr}
                  </Text>
                </View>

                <View style={s.nxTeams}>
                  <View style={s.nxTeam}>
                    {self.logo ? <Image source={{ uri: self.logo }} style={s.logo44} resizeMode="contain" /> : null}
                    <Text style={s.teamNm} numberOfLines={2}>
                      {self.name.toUpperCase()}
                    </Text>
                    <Text style={s.teamCd}>{self.code}</Text>
                  </View>

                  <View style={s.nxMid}>
                    {isLiveNow && liveDetail ? (
                      <Text style={s.scoreLive}>{`${liveDetail.score.home}–${liveDetail.score.away}`}</Text>
                    ) : (
                      <Text style={s.vsTxt}>VS</Text>
                    )}
                  </View>

                  <View style={[s.nxTeam, s.nxTeamRight]}>
                    {opp.logo ? <Image source={{ uri: opp.logo }} style={s.logo44} resizeMode="contain" /> : null}
                    <Text style={[s.teamNm, s.teamNmRight]} numberOfLines={2}>
                      {opp.name.toUpperCase()}
                    </Text>
                    <Text style={[s.teamCd, s.teamCdRight]}>{opp.code}</Text>
                  </View>
                </View>

                <View style={s.cdBlock}>
                  {isLiveNow ? (
                    <Text style={s.cdLiveBadge}>EN DIRECT</Text>
                  ) : (
                    <View style={s.cdRow}>
                      {(
                        [
                          [cd.days, 'J'],
                          [cd.hours, 'H'],
                          [cd.mins, 'M'],
                          [cd.secs, 'S'],
                        ] as const
                      ).map(([val, unit], i) => (
                        <View key={unit} style={s.cdItem}>
                          {i > 0 ? <Text style={s.cdSep}>:</Text> : null}
                          <View style={s.cdCell}>
                            <Text style={s.cdNum}>{val}</Text>
                            <Text style={s.cdUnit}>{unit}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={s.liveLn}>
                    <View style={s.liveDotS} />
                    <Text style={s.liveTx}>
                      {muStanding
                        ? `${muStanding.rank}e PL · ${muStanding.pts} pts`
                        : 'Données FotMob'}
                      {matchStadium ? ` · ${matchStadium}` : ''}
                    </Text>
                    {loadingLive ? <ActivityIndicator color={DS.green} size="small" /> : null}
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 4, paddingHorizontal: 12, paddingBottom: 4 }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={s.sub}
                    onPress={() => openPrepModal('h2h')}
                    accessibilityRole="button"
                    accessibilityLabel="Voir le face-à-face"
                  >
                    <Text style={s.subH}>FACE-À-FACE</Text>
                    {h2hLoading && !h2h ? (
                      <ActivityIndicator color={DS.green} style={{ marginTop: 12 }} />
                    ) : h2h ? (
                      <>
                        <Text style={s.subP}>
                          {self.code} — {h2h.winsTeam1}V · {h2h.draws}N · {h2h.winsTeam2}D
                        </Text>
                        <View style={s.subDiv} />
                        <Text style={s.subP}>
                          {opp.code} — {h2h.winsTeam2}V · {h2h.draws}N · {h2h.winsTeam1}D
                        </Text>
                      </>
                    ) : (
                      <Text style={s.subP}>Historique en cours de chargement…</Text>
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
                    {formLoading && !formSelf.length ? (
                      <ActivityIndicator color={DS.green} style={{ marginTop: 8 }} />
                    ) : (
                      renderFormPills(formSelf)
                    )}
                    <Text style={[s.subLbl, { marginTop: 10 }]}>{opp.code}</Text>
                    {formLoading && !formOpp.length ? (
                      <ActivityIndicator color={DS.green} style={{ marginTop: 8 }} />
                    ) : (
                      renderFormPills(formOpp)
                    )}
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
                      injuries.slice(0, 5).map((inj, i) => (
                        <Text key={`${inj.name}-${i}`} style={s.subP} numberOfLines={2}>
                          {inj.name}
                          {inj.reason ? `\n${inj.reason}` : ''}
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

          {/* 6 Moments Forts — même cadrage que Actus du club */}
          <MomentsFortsSection
            videos={momentsVideos}
            loading={momentsVideosLoading}
            onOpen={openMomentsFortsFeed}
            onSeeAll={goMomentsFortsAll}
            maxItems={8}
          />

          <ClubNewsCard
            onPress={goClubNews}
            headline={topNews?.title}
            imageUrl={topNews?.image_url}
            meta={
              topNews
                ? `${categoryLabel(topNews.category)} · ${relativeTimeFr(topNews.published_at)}`
                : null
            }
          />

          <VenezJouer
            onPronos={goPronos}
            onPickXi={goPickXi}
            onQuiz={goUnitedQuiz}
            onRating={goUnitedRating}
            onShowAll={goPlayHub}
          />

          <PremierLeagueTableCard
            table={leagueTable}
            loading={loadingStatic}
            onPress={goPremierLeagueTable}
          />

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
              maxItems={6}
            />
          </View>

          {/* 9 Meilleurs Buteurs United */}
          <View style={{ marginBottom: 16 }}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>MEILLEURS BUTEURS</Text>
              <TouchableOpacity onPress={goTopScorers}>
                <Text style={s.sectionAction}>Tout voir</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.95} onPress={goTopScorers} style={s.topHero}>
              <LinearGradient colors={['rgba(218,41,28,0.45)', '#0c0507']} style={StyleSheet.absoluteFill} />
              <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(20,5,8,0.9)']} style={StyleSheet.absoluteFill} />
              <View style={s.topRow}>
                <LinearGradient colors={['#FBE122', '#B8860B']} style={s.topBadgeGrad}>
                  <Text style={s.topBadgeT}>#1 UNITED · SAISON</Text>
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
                  <Text style={s.topSub}>{top1?.team ?? FOTMOB_MU_FULL_NAME}</Text>
                </View>
                <View style={s.topGoalRing}>
                  <Text style={s.topGoalNum}>{top1 != null ? String(top1.goals) : '—'}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={s.list3}>
              {topScorers.slice(1, 4).map((row, idx) => {
                const r = idx + 2;
                return (
                  <View key={`${row.name}-${r}`}>
                    <View style={s.listRow}>
                      <Text style={s.listRank}>#{r}</Text>
                      <LinearGradient colors={['rgba(218,41,28,0.35)', 'rgba(12,5,7,0.96)']} style={s.listAv}>
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

          {/* 10 Stats Joueurs United */}
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
                        <LinearGradient colors={['rgba(218,41,28,0.2)', 'rgba(12,5,7,0.95)']} style={s.listAv}>
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
                        <Text style={s.tblV}>{String(row.value ?? '—')}</Text>
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
        injuriesOpp={injuriesOpp}
      />

      <StoryPlayerModal
        visible={storyOpen}
        stories={muStories}
        startIndex={storyStart}
        onStorySeen={markStorySeen}
        onClose={() => setStoryOpen(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.bg },
  scroll: { flex: 1 },
  topBar: {
    paddingHorizontal: DS.ph,
    paddingBottom: 6,
    zIndex: 2,
  },
  wrap: { width: '100%', alignSelf: 'center' },
  mb16: { marginBottom: 16 },
  emptyBanner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.22)',
    backgroundColor: 'rgba(41, 121, 255, 0.06)',
    padding: 12,
    marginBottom: 12,
  },
  emptyBannerT: { color: 'rgba(255,255,255,0.82)', fontFamily: F.i600, fontSize: 13, lineHeight: 18, textAlign: 'center' },

  hdrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
    paddingBottom: 4,
    gap: 12,
  },
  hdrL: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  hdrNameWrap: { flex: 1, minWidth: 0, justifyContent: 'center' },
  hdrSub: { color: 'rgba(255,255,255,0.45)', fontFamily: F.i500, fontSize: 11, marginTop: 1 },
  hdrR: { flexShrink: 0, alignItems: 'flex-end' },
  avRing: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: DS.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
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
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(218, 41, 28, 0.28)',
    overflow: 'hidden',
    backgroundColor: '#120608',
    elevation: 3,
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
    borderRadius: 14,
    backgroundColor: DS.card,
    overflow: 'hidden',
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(218, 41, 28, 0.22)',
  },
  nxCtx: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  nxCtxT: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: F.i700,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  nxTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 8,
  },
  nxTeam: { flex: 1, alignItems: 'center', gap: 6 },
  nxTeamRight: {},
  nxMid: { width: 52, alignItems: 'center', justifyContent: 'center' },
  logo44: { width: 44, height: 44 },
  teamNm: {
    color: DS.white,
    fontFamily: F.i800,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 16,
  },
  teamNmRight: {},
  teamCd: { color: 'rgba(255,255,255,0.45)', fontFamily: F.i600, fontSize: 10 },
  teamCdRight: {},
  vsTxt: { color: 'rgba(255,255,255,0.4)', fontFamily: F.i800, fontSize: 12, letterSpacing: 1 },
  scoreLive: { color: DS.white, fontFamily: F.i800, fontSize: 20 },
  cdBlock: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  cdLiveBadge: {
    color: DS.red,
    fontFamily: F.i800,
    fontSize: 13,
    letterSpacing: 1.4,
  },
  cdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cdItem: { flexDirection: 'row', alignItems: 'center' },
  cdCell: {
    width: 48,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,184,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.32)',
    alignItems: 'center',
  },
  cdNum: { color: DS.gold, fontFamily: F.bebas, fontSize: 22, letterSpacing: 1, lineHeight: 24 },
  cdUnit: { color: 'rgba(255,184,0,0.7)', fontFamily: F.i700, fontSize: 9, marginTop: 1 },
  cdSep: {
    color: 'rgba(255,184,0,0.5)',
    fontFamily: F.bebas,
    fontSize: 18,
    width: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  liveLn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDotS: { width: 6, height: 6, borderRadius: 3, backgroundColor: DS.green },
  liveTx: { color: 'rgba(255,255,255,0.55)', fontFamily: F.i600, fontSize: 11 },

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
