import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { IMMANQUABLE_FETCH_LIMIT } from '../../constants/videoZones';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { useVideos } from '../../hooks/useVideos';
import { useVideoLikes } from '../../hooks/useVideoLikes';
import { SafeVideo } from '../../components/SafeVideo';
import { incrementVideoShares, incrementVideoViews } from '../../services/contentService';
import type { ContentVideo } from '../../types/content';

const IMMANQUABLE_CTA = '#00E5FF';

const TAB_BAR_STYLE = {
  backgroundColor: COLORS.card,
  borderTopColor: 'rgba(180, 210, 255, 0.14)',
  borderTopWidth: 1,
  height: 72,
  paddingTop: 10,
  paddingBottom: 8,
} as const;

type Route = RouteProp<HomeStackParamList, 'ImmanquableFeed'>;

function SideAction({
  icon,
  count,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  count: number;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.sideAction} onPress={onPress} hitSlop={10}>
      <View style={styles.sideIconCircle}>
        <MaterialCommunityIcons name={icon} size={22} color={active ? '#ff4d6d' : '#fff'} />
      </View>
      <Text style={styles.sideCount}>{count > 999 ? `${Math.floor(count / 1000)}k` : count}</Text>
    </Pressable>
  );
}

function ImmanquablePage({
  item,
  active,
  pageHeight,
}: {
  item: ContentVideo;
  active: boolean;
  pageHeight: number;
}) {
  const counted = useRef(false);
  const [progress] = useState(0);
  const baseLikes = item.likes ?? 0;
  const { liked, likeCount, toggleLike } = useVideoLikes(item.id, baseLikes);
  const [shareCount, setShareCount] = useState(item.shares ?? 0);

  useEffect(() => {
    if (active && !counted.current) {
      counted.current = true;
      void incrementVideoViews(item.id).catch(() => undefined);
    }
  }, [active, item.id]);

  const onShare = async () => {
    try {
      await Share.share({ message: `${item.title} — THE RED` });
      setShareCount((c) => c + 1);
      void incrementVideoShares(item.id).catch(() => undefined);
    } catch {
      /* ignore */
    }
  };

  const cta = item.ctaLabel || item.chapter || item.episodeNumber;

  return (
    <View style={[styles.page, { height: pageHeight }]}>
      {item.videoUrl ? (
        <SafeVideo
          source={{ uri: item.videoUrl }}
          style={styles.video}
          shouldPlay={active}
          isLooping
          isMuted={false}
          titleHint={item.title}
        />
      ) : (
        <View style={styles.noVideoWrap}>
          <Text style={styles.noVideo}>Vidéo indisponible</Text>
        </View>
      )}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.82)']}
        locations={[0, 0.32, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.sideCol}>
        <SideAction
          icon={liked ? 'heart' : 'heart-outline'}
          count={likeCount}
          active={liked}
          onPress={() => void toggleLike()}
        />
        <SideAction icon="share" count={shareCount} onPress={() => void onShare()} />
      </View>

      <View style={styles.bottomMeta}>
        <Text style={styles.captionTitle}>{item.title}</Text>
        <Text style={styles.captionSub}>{item.chapter || item.episodeNumber || 'GOALYA'}</Text>
        {cta ? (
          <View style={styles.ctaPill}>
            <Text style={styles.ctaTxt} numberOfLines={2}>
              {cta}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, progress * 100)}%` }]} />
      </View>
    </View>
  );
}

function resolveStartIndex(videos: ContentVideo[], startIndex: number, videoId?: string): number {
  if (videoId) {
    const byId = videos.findIndex((v) => v.id === videoId);
    if (byId >= 0) return byId;
  }
  return Math.min(Math.max(0, startIndex), Math.max(0, videos.length - 1));
}

export default function TikTokVideoScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { videos, loading } = useVideos(IMMANQUABLE_FETCH_LIMIT, 'immanquable');
  const listRef = useRef<FlatList<ContentVideo>>(null);
  const [pageHeight, setPageHeight] = useState(0);

  const startIndex = useMemo(
    () => resolveStartIndex(videos, route.params.startIndex ?? 0, route.params.videoId),
    [videos, route.params.startIndex, route.params.videoId]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (videos.length > 0) setActiveIndex(startIndex);
  }, [startIndex, videos.length]);

  useFocusEffect(
    useCallback(() => {
      const tab = navigation.getParent();
      tab?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        tab?.setOptions({ tabBarStyle: TAB_BAR_STYLE });
      };
    }, [navigation])
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setActiveIndex(first.index);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 65 }).current;

  const scrollToStart = useCallback(() => {
    if (pageHeight <= 0 || videos.length === 0) return;
    const offset = startIndex * pageHeight;
    listRef.current?.scrollToOffset({ offset, animated: false });
    setActiveIndex(startIndex);
  }, [pageHeight, startIndex, videos.length]);

  useEffect(() => {
    if (pageHeight > 0 && videos.length > 0) {
      const t = setTimeout(scrollToStart, 50);
      return () => clearTimeout(t);
    }
  }, [pageHeight, videos.length, scrollToStart]);

  const onScrollToIndexFailed = useCallback(() => {
    scrollToStart();
  }, [scrollToStart]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageHeight <= 0) return;
      const idx = Math.round(e.nativeEvent.contentOffset.y / pageHeight);
      setActiveIndex(Math.min(Math.max(0, idx), videos.length - 1));
    },
    [pageHeight, videos.length]
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ContentVideo>) => (
      <ImmanquablePage item={item} active={index === activeIndex} pageHeight={pageHeight} />
    ),
    [activeIndex, pageHeight]
  );

  if (loading && videos.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loaderTxt}>Chargement…</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.loader}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backFloating}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.loaderTxt}>Aucun immanquable pour le moment</Text>
        <Text style={styles.loaderSub}>Chargement des contenus @manutd…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View
        style={styles.listHost}
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height);
          if (h > 0 && h !== pageHeight) setPageHeight(h);
        }}
      >
        {pageHeight > 0 ? (
          <FlatList
            ref={listRef}
            data={videos}
            keyExtractor={(v) => v.id}
            renderItem={renderItem}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            snapToAlignment="start"
            disableIntervalMomentum
            initialNumToRender={Math.min(videos.length, Math.max(3, startIndex + 2))}
            maxToRenderPerBatch={3}
            windowSize={5}
            getItemLayout={(_, index) => ({
              length: pageHeight,
              offset: pageHeight * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScrollToIndexFailed={onScrollToIndexFailed}
            onMomentumScrollEnd={onMomentumScrollEnd}
            style={{ width: screenW }}
          />
        ) : (
          <ActivityIndicator color={COLORS.primary} style={styles.listSpinner} />
        )}
      </View>

      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
        </Pressable>
        <Text style={styles.topTitle}>IMMANQUABLE</Text>
        <View style={styles.iconSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  listHost: { flex: 1 },
  listSpinner: { flex: 1, alignSelf: 'center' },
  loader: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  loaderTxt: { color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: 16, textAlign: 'center', marginTop: 12 },
  loaderSub: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 8, textAlign: 'center' },
  backFloating: {
    position: 'absolute',
    top: 56,
    left: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  page: { width: '100%', backgroundColor: '#000', overflow: 'hidden' },
  video: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  noVideoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noVideo: { color: '#888', fontSize: 14 },
  sideCol: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 18,
    zIndex: 4,
  },
  sideAction: { alignItems: 'center', gap: 4 },
  sideIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(10, 14, 33, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideCount: { color: '#fff', fontSize: 12, fontWeight: '800' },
  bottomMeta: {
    position: 'absolute',
    left: 14,
    right: 72,
    bottom: 24,
    zIndex: 4,
  },
  captionTitle: { color: '#fff', fontSize: 17, fontWeight: '900' },
  captionSub: { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 },
  ctaPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: IMMANQUABLE_CTA,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  ctaTxt: { color: '#000', fontSize: 12, fontWeight: '800' },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    zIndex: 5,
  },
  progressFill: { height: '100%', backgroundColor: '#fff' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 10,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: { width: 44 },
});
