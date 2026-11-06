import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image as RnImage,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { YoutubePlayerModal } from '../../components/YoutubePlayerModal';
import { COLORS, UNITED_RED } from '../../constants/colors';
import { type VideoCategory } from '../../constants/manUtdYoutube';
import {
  fetchManUtdVideos,
  formatDuration,
  isMatchSummaryTitle,
  sectionTitle,
  withoutFeatured,
  type ManUtdPlaylist,
  type ManUtdVideo,
} from '../../services/manUtdYoutube';

const F = {
  i500: 'Inter_500Medium' as const,
  i600: 'Inter_600SemiBold' as const,
  i700: 'Inter_700Bold' as const,
  i800: 'Inter_800ExtraBold' as const,
} as const;

const W = Dimensions.get('window').width;
const PH = 16;
const GAP = 10;
const HERO_H = Math.min(Math.round(W * 0.98), 420);
const CARD_W = Math.round((W - PH * 2 - GAP) * 0.48);
const CARD_WIDE_W = Math.round(W * 0.62);
const PLAYLIST_W = Math.round(W * 0.44);
const THUMB_H = Math.round(CARD_W * 0.62);
const THUMB_WIDE_H = Math.round(CARD_WIDE_W * 0.56);

const TOP_TABS: { key: 'forYou' | 'now' | 'matches' | 'players'; label: string }[] = [
  { key: 'forYou', label: 'Pour toi' },
  { key: 'now', label: 'En ce moment' },
  { key: 'matches', label: 'Matchs' },
  { key: 'players', label: 'Joueurs' },
];

function youtubeThumb(id: string, preferred?: string | null): string {
  if (preferred && /^https?:\/\//i.test(preferred)) return preferred;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function VideoThumb({
  id,
  uri,
  width,
  height,
}: {
  id: string;
  uri?: string | null;
  width: number;
  height: number;
}) {
  const [src, setSrc] = useState(() => youtubeThumb(id, uri));
  const [failed, setFailed] = useState(false);

  // RN Image est plus fiable que expo-image dans les carrousels horizontaux Android.
  return (
    <View style={{ width, height, backgroundColor: '#241217' }} collapsable={false}>
      {!failed ? (
        <RnImage
          source={{ uri: src }}
          style={{ width, height }}
          resizeMode="cover"
          onError={() => {
            const next = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
            if (src !== next) {
              setSrc(next);
              return;
            }
            const last = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
            if (src !== last) {
              setSrc(last);
              return;
            }
            setFailed(true);
          }}
        />
      ) : (
        <View style={[styles.imgFallback, { width, height }]}>
          <MaterialCommunityIcons name="play-circle-outline" size={28} color={UNITED_RED} />
        </View>
      )}
    </View>
  );
}

function FeaturedHero({
  video,
  onPlay,
}: {
  video: ManUtdVideo;
  onPlay: (v: ManUtdVideo) => void;
}) {
  const heroW = W - PH * 2;
  return (
    <View style={styles.heroWrap}>
      <Pressable style={styles.heroCard} onPress={() => onPlay(video)}>
        <VideoThumb id={video.id} uri={video.thumbnail} width={heroW} height={HERO_H} />
        <LinearGradient
          colors={['rgba(12,5,7,0.15)', 'transparent', 'rgba(12,5,7,0.55)', 'rgba(12,5,7,0.96)']}
          locations={[0, 0.28, 0.62, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.heroContent} pointerEvents="box-none">
          <Text style={styles.heroKicker}>Vidéos · @manutd</Text>
          <Text style={styles.heroTitle} numberOfLines={3}>
            {video.title}
          </Text>
          <View style={styles.heroActions}>
            <Pressable style={styles.watchBtn} onPress={() => onPlay(video)}>
              <MaterialCommunityIcons name="play" size={18} color="#fff" />
              <Text style={styles.watchTx}>Regarder</Text>
            </Pressable>
            <Pressable style={styles.listBtn} onPress={() => onPlay(video)}>
              <MaterialCommunityIcons name="plus" size={16} color="#fff" />
              <Text style={styles.listTx}>Ajouter</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function HVideoCard({
  item,
  wide,
  onPlay,
}: {
  item: ManUtdVideo;
  wide?: boolean;
  onPlay: (v: ManUtdVideo) => void;
}) {
  const meta = item.duration ? formatDuration(item.duration) : 'Vidéo';
  const w = wide ? CARD_WIDE_W : CARD_W;
  const h = wide ? THUMB_WIDE_H : THUMB_H;
  return (
    <Pressable style={[styles.hCard, { width: w }]} onPress={() => onPlay(item)}>
      <View style={styles.hThumbWrap} collapsable={false}>
        <VideoThumb id={item.id} uri={item.thumbnail} width={w} height={h} />
        <View style={styles.playBadge} pointerEvents="none">
          <MaterialCommunityIcons name="play" size={13} color="#fff" />
        </View>
      </View>
      <View style={styles.hBody}>
        <Text style={styles.hTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.hMeta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </Pressable>
  );
}

function PlaylistCard({
  item,
  onPlay,
}: {
  item: ManUtdPlaylist;
  onPlay: (v: { id: string; title: string; url: string }) => void;
}) {
  const thumbId = item.thumbnail?.match(/\/vi\/([\w-]{11})\//)?.[1];
  return (
    <Pressable
      style={styles.pCard}
      onPress={() =>
        onPlay({
          id: thumbId || item.id,
          title: item.title,
          url: item.url,
        })
      }
    >
      {item.thumbnail ? (
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.pThumb}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={160}
        />
      ) : (
        <View style={[styles.pThumb, styles.imgFallback]}>
          <MaterialCommunityIcons name="playlist-play" size={28} color={UNITED_RED} />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(12,5,7,0.5)', 'rgba(12,5,7,0.96)']}
        locations={[0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {item.badge ? (
        <View style={styles.pBadge}>
          <Text style={styles.pBadgeTx}>{item.badge}</Text>
        </View>
      ) : null}
      <View style={styles.pBody}>
        <Text style={styles.pTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.pMeta}>
          {item.count != null ? `${item.count} vidéos` : 'Collection'}
        </Text>
      </View>
    </Pressable>
  );
}

function SectionRow({
  title,
  videos,
  onSeeAll,
  onPlay,
  wide,
}: {
  title: string;
  videos: ManUtdVideo[];
  onSeeAll?: () => void;
  onPlay: (v: ManUtdVideo) => void;
  wide?: boolean;
}) {
  if (!videos.length) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle} numberOfLines={1}>
          {title}
        </Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text style={styles.seeAll}>Tout voir</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
      >
        {videos.map((item) => (
          <HVideoCard key={item.id} item={item} wide={wide} onPlay={onPlay} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function VideosScreen() {
  const [tab, setTab] = useState<(typeof TOP_TABS)[number]['key']>('forYou');
  const [player, setPlayer] = useState<{ id: string; title: string; subtitle?: string } | null>(
    null
  );

  const query = useQuery({
    queryKey: ['thered', 'youtube', 'manutd', 'v5'] as const,
    queryFn: () => fetchManUtdVideos(true),
    staleTime: 3 * 60_000,
  });

  const data = query.data;
  const featured = data?.featured ?? null;
  const featuredId = featured?.id;

  const feed = useMemo(() => {
    const items = data?.items ?? [];
    const rest = withoutFeatured(items, featuredId);
    const sec = data?.sections;
    const summaries = withoutFeatured(
      data?.matchSummaries?.length ? data.matchSummaries : sec?.highlights ?? [],
      featuredId
    );

    return {
      latest: withoutFeatured(sec?.latest ?? rest, featuredId).slice(0, 12),
      matchSummaries: summaries,
      inside: withoutFeatured(sec?.inside ?? [], featuredId),
      training: withoutFeatured(sec?.training ?? [], featuredId),
      press: withoutFeatured(sec?.press ?? [], featuredId),
      academy: withoutFeatured(sec?.academy ?? [], featuredId),
      playlists: data?.playlists ?? [],
    };
  }, [data, featuredId]);

  const filtered = useMemo(() => {
    const items = withoutFeatured(data?.items ?? [], featuredId);
    if (tab === 'matches') {
      return feed.matchSummaries.length
        ? feed.matchSummaries
        : items.filter((v) => isMatchSummaryTitle(v.title));
    }
    if (tab === 'players') {
      return items.filter((v) =>
        /mainoo|bruno|cunha|rashford|carrick|yoro|maguire|fernandes|lacey|beckham|fortune|brown/i.test(
          v.title
        )
      );
    }
    if (tab === 'now') {
      return [...feed.training, ...feed.press, ...feed.inside].slice(0, 20);
    }
    return items;
  }, [data?.items, featuredId, feed.inside, feed.matchSummaries, feed.press, feed.training, tab]);

  const playVideo = useCallback((v: { id: string; title: string; url?: string }) => {
    // Si c’est une playlist (id trop long), on lance le premier résumé dispo
    const id = /^[\w-]{11}$/.test(v.id) ? v.id : null;
    if (!id) {
      const first = feed.matchSummaries[0];
      if (first) {
        setPlayer({ id: first.id, title: first.title, subtitle: 'Résumé de match' });
      }
      return;
    }
    setPlayer({ id, title: v.title, subtitle: '@manutd · THE RED' });
  }, [feed.matchSummaries]);

  const openChannel = useCallback(() => {
    setTab('forYou');
  }, []);

  const openHighlights = useCallback(() => {
    setTab('matches');
  }, []);

  return (
    <ScreenAmbience style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <YoutubePlayerModal
          visible={!!player}
          videoIdOrUrl={player?.id ?? null}
          title={player?.title}
          subtitle={player?.subtitle}
          onClose={() => setPlayer(null)}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              tintColor={UNITED_RED}
              onRefresh={() => void query.refetch()}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topTabs}
          >
            {TOP_TABS.map((t) => {
              const on = tab === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={[styles.topTab, on && styles.topTabOn]}
                >
                  <Text style={[styles.topTabTx, on && styles.topTabTxOn]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {query.isPending && !data ? (
            <ActivityIndicator color={UNITED_RED} style={{ marginTop: 48 }} />
          ) : null}

          {query.isError && !data ? (
            <Text style={styles.empty}>Impossible de charger les vidéos. Tire pour réessayer.</Text>
          ) : null}

          {featured && tab === 'forYou' ? (
            <FeaturedHero video={featured} onPlay={playVideo} />
          ) : null}

          {tab !== 'forYou' ? (
            filtered.length ? (
              <SectionRow
                title={
                  tab === 'matches'
                    ? 'Résumés des matchs'
                    : TOP_TABS.find((t) => t.key === tab)?.label ?? 'Vidéos'
                }
                videos={filtered}
                onSeeAll={tab === 'matches' ? openHighlights : openChannel}
                onPlay={playVideo}
                wide
              />
            ) : (
              <Text style={styles.empty}>Aucune vidéo pour ce filtre.</Text>
            )
          ) : (
            <>
              <SectionRow
                title="Résumés des matchs"
                videos={feed.matchSummaries}
                onSeeAll={openHighlights}
                onPlay={playVideo}
                wide
              />
              <SectionRow
                title="À ne pas manquer"
                videos={feed.latest}
                onSeeAll={openChannel}
                onPlay={playVideo}
              />
              <SectionRow
                title={sectionTitle('inside' as VideoCategory)}
                videos={feed.inside}
                onSeeAll={openChannel}
                onPlay={playVideo}
              />
              <SectionRow
                title={sectionTitle('training' as VideoCategory)}
                videos={feed.training}
                onSeeAll={openChannel}
                onPlay={playVideo}
              />
              <SectionRow
                title={sectionTitle('press' as VideoCategory)}
                videos={feed.press}
                onSeeAll={openChannel}
                onPlay={playVideo}
              />
              <SectionRow
                title={sectionTitle('academy' as VideoCategory)}
                videos={feed.academy}
                onSeeAll={openChannel}
                onPlay={playVideo}
              />

              {feed.playlists.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHead}>
                    <Text style={styles.sectionTitle}>Collections</Text>
                    <Pressable onPress={openChannel} hitSlop={8}>
                      <Text style={styles.seeAll}>Tout voir</Text>
                    </Pressable>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hList}
                  >
                    {feed.playlists.map((item) => (
                      <PlaylistCard key={item.id} item={item} onPlay={playVideo} />
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              {!query.isPending && data && !featured && feed.latest.length === 0 ? (
                <Text style={styles.empty}>Aucune vidéo pour le moment.</Text>
              ) : null}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenAmbience>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 36 },
  topTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: PH,
    paddingTop: 2,
    paddingBottom: 12,
  },
  topTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  topTabOn: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  topTabTx: {
    color: COLORS.text,
    fontFamily: F.i700,
    fontSize: 12,
  },
  topTabTxOn: { color: '#111' },
  heroWrap: {
    paddingHorizontal: PH,
    marginBottom: 20,
  },
  heroCard: {
    borderRadius: 22,
    overflow: 'hidden',
    height: HERO_H,
    backgroundColor: '#1a1012',
  },
  imgFallback: {
    backgroundColor: COLORS.card2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: F.i600,
    fontSize: 12,
    marginBottom: 8,
  },
  heroTitle: {
    color: '#fff',
    fontFamily: F.i800,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 14,
  },
  heroActions: { flexDirection: 'row', gap: 10 },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: UNITED_RED,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
  },
  watchTx: { color: '#fff', fontFamily: F.i800, fontSize: 13 },
  listBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  listTx: { color: '#fff', fontFamily: F.i700, fontSize: 13 },
  section: { marginBottom: 20 },
  sectionHead: {
    paddingHorizontal: PH,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: F.i800,
    fontSize: 20,
    letterSpacing: -0.2,
    flex: 1,
  },
  seeAll: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: F.i600,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  hList: { paddingHorizontal: PH, gap: GAP },
  hCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: 'hidden',
  },
  hThumbWrap: {
    backgroundColor: '#241217',
    overflow: 'hidden',
    position: 'relative',
  },
  playBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  hBody: {
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 11,
    minHeight: 64,
  },
  hTitle: {
    color: COLORS.text,
    fontFamily: F.i700,
    fontSize: 13,
    lineHeight: 17,
  },
  hMeta: {
    color: COLORS.textMuted,
    fontFamily: F.i500,
    fontSize: 11,
    marginTop: 5,
  },
  pCard: {
    width: PLAYLIST_W,
    height: Math.round(PLAYLIST_W * 1.4),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  pThumb: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.card2 },
  pBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: UNITED_RED,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pBadgeTx: { color: '#fff', fontFamily: F.i800, fontSize: 10 },
  pBody: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  pTitle: {
    color: '#fff',
    fontFamily: F.i800,
    fontSize: 13,
    lineHeight: 17,
  },
  pMeta: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: F.i500,
    fontSize: 11,
    marginTop: 5,
  },
  empty: {
    color: COLORS.textMuted,
    fontFamily: F.i500,
    textAlign: 'center',
    paddingHorizontal: PH,
    paddingVertical: 28,
  },
});
