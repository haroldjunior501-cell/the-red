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
import { IMMANQUABLE_FETCH_LIMIT } from '../../constants/videoZones';
import { useVideos } from '../../hooks/useVideos';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { ImmanquableGrid } from './components/ImmanquableGrid';

type Nav = StackNavigationProp<HomeStackParamList, 'ImmanquableAll'>;

export default function ImmanquableAllScreen() {
  const navigation = useNavigation<Nav>();
  const { videos, loading } = useVideos(IMMANQUABLE_FETCH_LIMIT, 'immanquable');

  const openFeed = useCallback(
    (startIndex: number) => {
      if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const videoId = videos[startIndex]?.id;
      navigation.navigate('ImmanquableFeed', { startIndex, videoId });
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
        <Text style={styles.title}>IMMANQUABLE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sub}>
          Contenus officiels @manutd à ne pas manquer — Inside Carrington, exclus & nouveautés.
        </Text>

        {loading && videos.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          <ImmanquableGrid videos={videos} loading={loading} onOpen={openFeed} />
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
