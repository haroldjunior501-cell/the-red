import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { MOMENTS_FORTS_FETCH_LIMIT } from '../../constants/videoZones';
import type { RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { useVideos } from '../../hooks/useVideos';
import { SafeVideo } from '../../components/SafeVideo';
import { incrementVideoViews } from '../../services/contentService';
import type { ContentVideo } from '../../types/content';

const TAB_BAR_STYLE = {
  backgroundColor: COLORS.card,
  borderTopColor: 'rgba(180, 210, 255, 0.14)',
  borderTopWidth: 1,
  height: 72,
  paddingTop: 10,
  paddingBottom: 8,
} as const;

type Route = RouteProp<HomeStackParamList, 'MomentsFortsFeed'>;

function VideoPage({
  item,
  active,
  pageHeight,
}: {
  item: ContentVideo;
  active: boolean;
  pageHeight: number;
}) {
  const counted = useRef(false);

  useEffect(() => {
    if (active && !counted.current) {
      counted.current = true;
      void incrementVideoViews(item.id).catch(() => undefined);
    }
  }, [active, item.id]);

  return (
    <View style={[styles.page, { height: pageHeight }]}>
      {item.videoUrl ? (
        <SafeVideo
          source={{ uri: item.videoUrl }}
          style={styles.video}
          shouldPlay={active}
          isLooping={false}
          isMuted={false}
          titleHint={item.title}
          youtubeMode="watch"
        />
      ) : (
        <Text style={styles.noVideo}>Vidéo indisponible</Text>
      )}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.75)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.caption}>
        <Text style={styles.captionTitle}>{item.title}</Text>
        <Text style={styles.captionSub}>{item.chapter || item.episodeNumber || 'THE RED · @manutd'}</Text>
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

/** Feed vertical plein écran — format d’origine pour Moments Forts. */
export default function MomentsFortsVideoScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { videos, loading } = useVideos(MOMENTS_FORTS_FETCH_LIMIT, 'moments_forts');
  const listRef = useRef<FlatList<ContentVideo>>(null);
  const [pageHeight, setPageHeight] = useState(0);
  const startIndex = resolveStartIndex(
    videos,
    route.params.startIndex ?? 0,
    route.params.videoId
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
    listRef.current?.scrollToOffset({ offset: startIndex * pageHeight, animated: false });
    setActiveIndex(startIndex);
  }, [pageHeight, startIndex, videos.length]);

  useEffect(() => {
    if (pageHeight > 0 && videos.length > 0) {
      const t = setTimeout(scrollToStart, 50);
      return () => clearTimeout(t);
    }
  }, [pageHeight, videos.length, scrollToStart]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ContentVideo>) => (
      <VideoPage item={item} active={index === activeIndex} pageHeight={pageHeight} />
    ),
    [activeIndex, pageHeight]
  );

  const onShare = async () => {
    const v = videos[activeIndex];
    if (!v) return;
    try {
      await Share.share({ message: `${v.title} — THE RED · ${v.videoUrl}` });
    } catch {
      /* ignore */
    }
  };

  if (loading && videos.length === 0) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderTxt}>Chargement…</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.loader}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="chevron-down" size={32} color="#fff" />
        </Pressable>
        <Text style={styles.loaderTxt}>Aucun moment fort disponible</Text>
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
            initialNumToRender={Math.min(videos.length, Math.max(3, startIndex + 2))}
            getItemLayout={(_, index) => ({
              length: pageHeight,
              offset: pageHeight * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScrollToIndexFailed={scrollToStart}
            onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              if (pageHeight <= 0) return;
              const idx = Math.round(e.nativeEvent.contentOffset.y / pageHeight);
              setActiveIndex(Math.min(Math.max(0, idx), videos.length - 1));
            }}
          />
        ) : (
          <ActivityIndicator color={COLORS.primary} style={styles.listSpinner} />
        )}
      </View>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-down" size={32} color="#fff" />
        </Pressable>
        <Text style={styles.topTitle}>
          {activeIndex + 1} / {videos.length}
        </Text>
        <Pressable onPress={onShare} style={styles.iconBtn} hitSlop={12}>
          <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  listHost: { flex: 1 },
  listSpinner: { flex: 1, alignSelf: 'center' },
  loader: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  loaderTxt: { color: 'rgba(255,255,255,0.6)', marginTop: 16 },
  page: { width: '100%', backgroundColor: '#000', overflow: 'hidden' },
  video: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  noVideo: { color: '#888', textAlign: 'center', marginTop: 120 },
  caption: { position: 'absolute', left: 16, right: 16, bottom: 48 },
  captionTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  captionSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  topTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});
