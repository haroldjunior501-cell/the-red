import React, { memo } from 'react';
import {
  ActivityIndicator,
  Image as RnImage,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, UNITED_RED } from '../../../constants/colors';
import { isVideoNew } from '../../../services/contentService';
import type { ContentVideo } from '../../../types/content';

const F = {
  i600: 'Inter_600SemiBold' as const,
  i700: 'Inter_700Bold' as const,
  i800: 'Inter_800ExtraBold' as const,
} as const;

export type ImmanquableGridProps = {
  videos: ContentVideo[];
  loading?: boolean;
  onOpen: (index: number) => void;
  maxItems?: number;
  horizontalPadding?: number;
};

export const ImmanquableGrid = memo(function ImmanquableGrid({
  videos,
  loading,
  onOpen,
  maxItems,
  horizontalPadding = 18,
}: ImmanquableGridProps) {
  const { width } = useWindowDimensions();
  const gap = 10;
  const cardW = Math.max(150, (width - horizontalPadding * 2 - gap) / 2);
  const cardH = Math.round(cardW * 1.15);
  const items = maxItems === undefined ? videos : videos.slice(0, maxItems);

  if (loading && items.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTxt}>Contenus @manutd bientôt disponibles</Text>
      </View>
    );
  }

  return (
    <View style={[styles.grid, { gap }]}>
      {items.map((item, i) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.95}
          onPress={() => onOpen(i)}
          style={[styles.card, { width: cardW, height: cardH }]}
        >
          <View collapsable={false}>
            {item.thumbnailUrl ? (
              <RnImage
                source={{ uri: item.thumbnailUrl }}
                style={{ width: cardW, height: cardH }}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.ph, { width: cardW, height: cardH }]} />
            )}
          </View>
          <LinearGradient
            colors={['rgba(12,5,7,0.05)', 'transparent', 'rgba(12,5,7,0.92)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {isVideoNew(item.publishedAt) ? (
            <View style={styles.newBadge}>
              <Text style={styles.newTxt}>NEW</Text>
            </View>
          ) : (
            <View style={styles.playMini}>
              <MaterialCommunityIcons name="play" size={12} color="#fff" />
            </View>
          )}
          <View style={styles.bot}>
            <Text style={styles.sub} numberOfLines={1}>
              {item.chapter || 'THE RED'}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  loader: { height: 180, alignItems: 'center', justifyContent: 'center' },
  empty: { minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: F.i600,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(218, 41, 28, 0.18)',
  },
  ph: { backgroundColor: COLORS.card2 },
  newBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: UNITED_RED,
  },
  newTxt: { color: '#fff', fontFamily: F.i800, fontSize: 10 },
  playMini: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bot: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  sub: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: F.i600,
    fontSize: 11,
    marginBottom: 3,
  },
  title: {
    color: COLORS.text,
    fontFamily: F.i800,
    fontSize: 13,
    lineHeight: 17,
  },
});
