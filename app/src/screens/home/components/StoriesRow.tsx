import React, { memo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../constants/colors';
import { LIGHT } from '../../../constants/lighting';
import { STORY_RING_SEEN, STORY_RING_UNREAD } from '../../../constants/storyTheme';
import type { ContentStory } from '../../../types/content';

const STORY_SIZE = 72;
const RING_PAD = 3;

export type StoriesRowProps = {
  stories: ContentStory[];
  loading?: boolean;
  isSeen: (id: string) => boolean;
  onOpen: (index: number) => void;
};

export const StoriesRow = memo(function StoriesRow({ stories, loading, isSeen, onOpen }: StoriesRowProps) {
  if (loading && stories.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!stories.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTxt}>Stories bientôt disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {stories.map((item, index) => {
          const seen = isSeen(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => onOpen(index)}
              style={styles.storyWrap}
            >
              <View style={[styles.ring, seen ? styles.ringSeen : styles.ringUnread]}>
                <View style={styles.storyCircle}>
                  {item.thumbnailUrl ? (
                    <Image source={{ uri: item.thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  ) : (
                    <View style={styles.ph} />
                  )}
                  <LinearGradient
                    pointerEvents="none"
                    colors={[LIGHT.videoStorySheen, 'transparent', LIGHT.videoStoryVignette]}
                    locations={[0, 0.45, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              </View>
              <Text style={[styles.storyLabel, seen && styles.storyLabelSeen]} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const outer = STORY_SIZE + RING_PAD * 2;

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  scroll: { paddingHorizontal: 18, gap: 12, paddingVertical: 6 },
  storyWrap: { alignItems: 'center', width: 84 },
  ring: {
    width: outer,
    height: outer,
    borderRadius: outer / 2,
    padding: RING_PAD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringUnread: {
    backgroundColor: STORY_RING_UNREAD,
    shadowColor: STORY_RING_UNREAD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 8,
  },
  ringSeen: {
    backgroundColor: STORY_RING_SEEN,
    shadowOpacity: 0,
    elevation: 0,
  },
  storyCircle: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.bgDeep,
    backgroundColor: '#0f1726',
  },
  ph: { flex: 1, backgroundColor: '#1a2438' },
  storyLabel: { marginTop: 8, color: COLORS.text, fontSize: 11, fontWeight: '700', maxWidth: 80, textAlign: 'center' },
  storyLabelSeen: { color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  loader: { height: 100, alignItems: 'center', justifyContent: 'center' },
  empty: { height: 80, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  emptyTxt: { color: COLORS.textSecondary, fontSize: 13 },
});
