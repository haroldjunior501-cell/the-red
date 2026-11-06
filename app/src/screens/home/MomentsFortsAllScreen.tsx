import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { MOMENTS_FORTS_FETCH_LIMIT } from '../../constants/videoZones';
import { useVideos } from '../../hooks/useVideos';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { MomentsFortsSection } from './components/MomentsFortsSection';

type Nav = StackNavigationProp<HomeStackParamList, 'MomentsFortsAll'>;

export default function MomentsFortsAllScreen() {
  const navigation = useNavigation<Nav>();
  const { videos, loading } = useVideos(MOMENTS_FORTS_FETCH_LIMIT, 'moments_forts');

  const openFeed = useCallback(
    (startIndex: number) => {
      if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const videoId = videos[startIndex]?.id;
      navigation.navigate('MomentsFortsFeed', { startIndex, videoId });
    },
    [navigation, videos]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0a1830', COLORS.bg]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
        </Pressable>
        <Text style={styles.title}>MOMENTS FORTS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sub}>
          Résumés des matchs Manchester United déjà joués — mis à jour dès qu’une nouvelle vidéo sort.
        </Text>

        {loading && videos.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          <MomentsFortsSection videos={videos} loading={loading} onOpen={openFeed} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerSpacer: { width: 40 },
  title: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 2,
  },
  scroll: { paddingHorizontal: 18, paddingBottom: 32 },
  sub: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
    textAlign: 'center',
  },
  loader: { minHeight: 200, alignItems: 'center', justifyContent: 'center' },
});
