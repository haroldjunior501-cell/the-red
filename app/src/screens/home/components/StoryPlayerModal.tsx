import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { STORY_VIEWER_ASPECT } from '../../../constants/storyTheme';
import { incrementStoryViews } from '../../../services/contentService';
import { SafeVideo } from '../../../components/SafeVideo';
import type { ContentStory } from '../../../types/content';

export type StoryPlayerModalProps = {
  visible: boolean;
  stories: ContentStory[];
  startIndex: number;
  onClose: () => void;
  onStorySeen?: (id: string) => void;
};

export function StoryPlayerModal({
  visible,
  stories,
  startIndex,
  onClose,
  onStorySeen,
}: StoryPlayerModalProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tapZoneTop = insets.top + 96;
  const [idx, setIdx] = useState(startIndex);
  const prog = useRef(new Animated.Value(0)).current;
  const countedRef = useRef<Set<string>>(new Set());

  const frame = useMemo(() => {
    const maxH = screenH * 0.88;
    let h = maxH;
    let w = h * STORY_VIEWER_ASPECT;
    if (w > screenW * 0.92) {
      w = screenW * 0.92;
      h = w / STORY_VIEWER_ASPECT;
    }
    return { width: Math.round(w), height: Math.round(h) };
  }, [screenH, screenW]);

  useEffect(() => {
    if (visible) {
      StatusBar.setHidden(true);
      setIdx(startIndex);
      prog.setValue(0);
    } else {
      StatusBar.setHidden(false);
    }
    return () => StatusBar.setHidden(false);
  }, [prog, startIndex, visible]);

  const goNext = useCallback(() => {
    setIdx((p) => {
      if (p >= stories.length - 1) {
        onClose();
        return p;
      }
      return p + 1;
    });
  }, [onClose, stories.length]);

  const goPrev = useCallback(() => {
    setIdx((p) => (p <= 0 ? 0 : p - 1));
  }, []);

  useEffect(() => {
    if (!visible) return;
    const story = stories[idx];
    if (!story) return;
    onStorySeen?.(story.id);
    if (!countedRef.current.has(story.id)) {
      countedRef.current.add(story.id);
      void incrementStoryViews(story.id).catch(() => undefined);
    }
    prog.setValue(0);
    Animated.timing(prog, {
      toValue: 1,
      duration: 8000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) goNext();
    });
  }, [goNext, idx, onStorySeen, prog, stories, visible]);

  const safeIdx = Math.min(Math.max(0, idx), Math.max(0, stories.length - 1));
  const story = stories[safeIdx];

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.stage}>
          <View style={[styles.frame, { width: frame.width, height: frame.height }]}>
            {story?.videoUrl ? (
              <>
                <SafeVideo
                  key={story.id}
                  source={{ uri: story.videoUrl }}
                  style={styles.video}
                  shouldPlay={visible}
                  isLooping={false}
                  isMuted={false}
                  onEnd={goNext}
                />
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.45)']}
                  locations={[0, 0.38, 1]}
                  style={StyleSheet.absoluteFill}
                />
              </>
            ) : (
              <Text style={styles.empty}>Vidéo indisponible</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={[styles.tapLeft, { top: tapZoneTop }]} activeOpacity={1} onPress={goPrev} />
        <TouchableOpacity style={[styles.tapRight, { top: tapZoneTop }]} activeOpacity={1} onPress={goNext} />

        <View style={[styles.top, { paddingTop: insets.top + 12 }]} pointerEvents="box-none">
          <View style={styles.segmentsRow} pointerEvents="none">
            {stories.map((s, i) => (
              <View key={s.id} style={styles.segmentTrack}>
                {i < safeIdx ? (
                  <View style={[styles.segmentFill, styles.segmentDone]} />
                ) : i === safeIdx ? (
                  <Animated.View
                    style={[
                      styles.segmentFill,
                      {
                        width: prog.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                ) : null}
              </View>
            ))}
          </View>
          <View style={styles.headerRow} pointerEvents="box-none">
            <Text style={styles.title} numberOfLines={1} pointerEvents="none">
              {story?.label ?? ''}
            </Text>
            <Pressable onPress={onClose} style={styles.close} hitSlop={16}>
              <MaterialCommunityIcons name="close" size={22} color={COLORS.text} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#0a0e18' },
  video: { width: '100%', height: '100%' },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 80 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 12, zIndex: 20 },
  segmentsRow: { flexDirection: 'row', gap: 4 },
  segmentTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  segmentFill: { height: 3, backgroundColor: COLORS.primary },
  segmentDone: { width: '100%' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  title: { flex: 1, color: COLORS.text, fontWeight: '800', fontSize: 15 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapLeft: { position: 'absolute', left: 0, bottom: 0, width: '34%', zIndex: 5 },
  tapRight: { position: 'absolute', right: 0, bottom: 0, width: '34%', zIndex: 5 },
});
