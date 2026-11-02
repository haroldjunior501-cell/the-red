import React, { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../constants/colors';
import { LIGHT } from '../../../constants/lighting';
import { isVideoNew } from '../../../services/contentService';
import type { ContentVideo } from '../../../types/content';

export type ImmanquableGridProps = {
  videos: ContentVideo[];
  loading?: boolean;
  onOpen: (index: number) => void;
  /** Limite d’affichage (accueil = 4). Omis = toutes les vidéos. */
  maxItems?: number;
  /** Padding horizontal de la grille (défaut 18). */
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
  const cardW = Math.max(140, (width - horizontalPadding * 2 - 8) / 2);
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
        <Text style={styles.emptyTxt}>Contenus immanquables bientôt disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {items.map((item, i) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.95}
          onPress={() => onOpen(i)}
          style={[styles.card, { width: cardW }]}
        >
          {item.thumbnailUrl ? (
            <Image source={{ uri: item.thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.ph} />
          )}
          <LinearGradient
            colors={[LIGHT.videoLiftTop, 'transparent', 'rgba(12, 22, 40, 0.62)']}
            locations={[0, 0.42, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {isVideoNew(item.publishedAt) ? (
            <View style={styles.newBadge}>
              <Text style={styles.newTxt}>NEW</Text>
            </View>
          ) : null}
          <View style={styles.bot}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {item.chapter || item.episodeNumber || 'Coupe du Monde 2026'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  loader: { height: 160, alignItems: 'center', justifyContent: 'center' },
  empty: { minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  card: {
    height: 155,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  ph: { flex: 1, backgroundColor: '#1a2438' },
  newBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.primary,
  },
  newTxt: { color: '#0b111c', fontWeight: '800', fontSize: 9 },
  bot: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  title: { color: COLORS.text, fontWeight: '800', fontSize: 13 },
  sub: { marginTop: 4, color: 'rgba(255,255,255,0.58)', fontSize: 11 },
});
