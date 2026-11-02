import React, { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { LIGHT } from '../../../constants/lighting';
import { formatVideoDuration } from '../../../services/contentService';
import type { ContentVideo } from '../../../types/content';

export type MomentsFortsSectionProps = {
  videos: ContentVideo[];
  loading?: boolean;
  onOpen: (index: number) => void;
  /** Limite d’affichage (accueil). Omis = toutes les vidéos. */
  maxItems?: number;
};

export const MomentsFortsSection = memo(function MomentsFortsSection({
  videos,
  loading,
  onOpen,
  maxItems,
}: MomentsFortsSectionProps) {
  const items = maxItems === undefined ? videos : videos.slice(0, maxItems);
  if (loading && items.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTxt}>Moments forts bientôt disponibles</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {items.map((item, index) => (
        <TouchableOpacity key={item.id} activeOpacity={0.92} onPress={() => onOpen(index)} style={styles.card}>
          {item.thumbnailUrl ? (
            <Image source={{ uri: item.thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.ph} />
          )}
          <LinearGradient
            colors={[LIGHT.videoLiftTop, 'transparent', 'rgba(12, 22, 40, 0.58)']}
            locations={[0, 0.38, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.badgeL}>
            <Text style={styles.badgeTxt}>{formatVideoDuration(item.duration)}</Text>
          </View>
          <View style={styles.badgeR}>
            <Text style={styles.badgeTxt}>GOALYA TV</Text>
          </View>
          <View style={styles.playBtn}>
            <MaterialCommunityIcons name="play" size={28} color={COLORS.text} style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.bot}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {item.chapter || item.episodeNumber || 'Coupe du Monde 2026'}
            </Text>
          </View>
          <Text style={styles.count}>
            {index + 1} / {items.length}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  loader: { height: 200, alignItems: 'center', justifyContent: 'center' },
  empty: { minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { color: COLORS.textSecondary, fontSize: 13 },
  card: {
    height: 200,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(180, 206, 240, 0.22)',
    backgroundColor: '#0c121d',
  },
  ph: { flex: 1, backgroundColor: '#1a2438' },
  badgeL: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeR: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeTxt: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  playBtn: {
    position: 'absolute',
    alignSelf: 'center',
    top: 74,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bot: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  sub: { marginTop: 4, color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  count: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
  },
});
