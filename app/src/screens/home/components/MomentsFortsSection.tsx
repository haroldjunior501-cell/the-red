import React, { memo } from 'react';
import {
  ActivityIndicator,
  Image as RnImage,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, UNITED_RED } from '../../../constants/colors';
import { formatVideoDuration, isVideoNew } from '../../../services/contentService';
import type { ContentVideo } from '../../../types/content';

function scoreFromTitle(title: string): string | null {
  const m = title.match(/(\d+)\s*[-–]\s*(\d+)/);
  return m ? `${m[1]}-${m[2]}` : null;
}

export type MomentsFortsSectionProps = {
  videos: ContentVideo[];
  loading?: boolean;
  onOpen: (index: number) => void;
  onSeeAll?: () => void;
  maxItems?: number;
};

export const MomentsFortsSection = memo(function MomentsFortsSection({
  videos,
  loading,
  onOpen,
  onSeeAll,
  maxItems = 6,
}: MomentsFortsSectionProps) {
  const items = videos.slice(0, maxItems);
  const featured = items[0] ?? null;
  const rest = items.slice(1);

  if (loading && items.length === 0) {
    return (
      <View style={[styles.wrap, styles.loader]}>
        <ActivityIndicator color={UNITED_RED} size="large" />
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.wrap}>
        <View style={styles.head}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="play-circle-outline" size={18} color={UNITED_RED} />
            <Text style={styles.title}>MOMENTS FORTS</Text>
          </View>
        </View>
        <Text style={styles.lead}>Résumés des matchs bientôt disponibles</Text>
      </View>
    );
  }

  const score = featured ? scoreFromTitle(featured.title) : null;
  const featuredNew = featured ? isVideoNew(featured.publishedAt) : false;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="play-circle-outline" size={18} color={UNITED_RED} />
          <Text style={styles.title}>MOMENTS FORTS</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTx}>RÉSUMÉS</Text>
        </View>
      </View>
      <Text style={styles.lead}>Les résumés des matchs Manchester United déjà joués</Text>

      {featured ? (
        <Pressable
          onPress={() => onOpen(0)}
          style={({ pressed }) => [styles.preview, pressed && styles.pressed]}
        >
          <Text style={styles.previewLabel}>DERNIER MATCH</Text>
          <View style={styles.imageWrap}>
            {featured.thumbnailUrl ? (
              <RnImage
                source={{ uri: featured.thumbnailUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.image, styles.ph]} />
            )}
            <View style={styles.playOverlay} pointerEvents="none">
              <View style={styles.playBtn}>
                <MaterialCommunityIcons name="play" size={22} color="#fff" style={{ marginLeft: 2 }} />
              </View>
            </View>
            {score ? (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreTx}>{score}</Text>
              </View>
            ) : null}
            {featuredNew ? (
              <View style={styles.newBadge}>
                <Text style={styles.newTx}>NEW</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.imageCaption}>
            <Text style={styles.previewTitle} numberOfLines={2}>
              {featured.title}
            </Text>
            <Text style={styles.previewMeta}>
              <Text style={styles.metaCat}>{featured.chapter || 'Résumé'}</Text>
              <Text style={styles.metaSep}>{'  ·  '}</Text>
              <Text>{formatVideoDuration(featured.duration) || 'Vidéo'}</Text>
            </Text>
          </View>
        </Pressable>
      ) : null}

      {rest.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.strip}
        >
          {rest.map((item, i) => {
            const idx = i + 1;
            const s = scoreFromTitle(item.title);
            return (
              <Pressable
                key={item.id}
                onPress={() => onOpen(idx)}
                style={({ pressed }) => [styles.mini, pressed && styles.pressed]}
              >
                <View style={styles.miniThumbWrap}>
                  {item.thumbnailUrl ? (
                    <RnImage
                      source={{ uri: item.thumbnailUrl }}
                      style={styles.miniThumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.miniThumb, styles.ph]} />
                  )}
                  {s ? (
                    <View style={styles.miniScore}>
                      <Text style={styles.miniScoreTx}>{s}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.miniTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <Pressable
        onPress={onSeeAll ?? (() => onOpen(0))}
        style={styles.cta}
        hitSlop={8}
      >
        <Text style={styles.ctaTx}>Voir tous les résumés</Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color={UNITED_RED} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: '#262626',
    padding: 12,
    overflow: 'hidden',
  },
  loader: { minHeight: 180, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.92 },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    color: COLORS.text,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(218,41,28,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: UNITED_RED },
  liveTx: { color: UNITED_RED, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  lead: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 10 },
  preview: {
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  previewLabel: {
    color: UNITED_RED,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  imageWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  image: { width: '100%', height: 168 },
  ph: { backgroundColor: '#1a1a1a' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(218,41,28,0.92)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: UNITED_RED,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scoreTx: { color: '#fff', fontFamily: 'Inter_800ExtraBold', fontSize: 13 },
  newBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newTx: { color: '#111', fontFamily: 'Inter_800ExtraBold', fontSize: 10 },
  imageCaption: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#262626',
  },
  previewTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  previewMeta: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  metaCat: { color: UNITED_RED, fontWeight: '800' },
  metaSep: { color: 'rgba(255,255,255,0.35)' },
  strip: { gap: 10, paddingBottom: 4 },
  mini: { width: 132 },
  miniThumbWrap: {
    width: 132,
    height: 74,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom: 6,
  },
  miniThumb: { width: 132, height: 74 },
  miniScore: {
    position: 'absolute',
    left: 6,
    top: 6,
    backgroundColor: UNITED_RED,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  miniScoreTx: { color: '#fff', fontSize: 10, fontWeight: '800' },
  miniTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    paddingHorizontal: 2,
    marginTop: 10,
  },
  ctaTx: { color: UNITED_RED, fontSize: 12, fontWeight: '700' },
});
