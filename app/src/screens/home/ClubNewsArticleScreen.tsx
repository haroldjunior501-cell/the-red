import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { UNITED_RED } from '../../constants/colors';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import {
  categoryLabel,
  fetchUnitedClubNews,
  relativeTimeFr,
} from '../../services/oneFootballNews';

type Route = RouteProp<HomeStackParamList, 'ClubNewsArticle'>;

export default function ClubNewsArticleScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const articleId = route.params.articleId;

  const newsQuery = useQuery({
    queryKey: ['thered', 'clubNews', 'united'] as const,
    queryFn: () => fetchUnitedClubNews(),
    staleTime: 60_000,
  });

  const article = useMemo(
    () => (newsQuery.data ?? []).find((i) => i.id === articleId) ?? null,
    [articleId, newsQuery.data]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={10}>
          <MaterialCommunityIcons name="chevron-left" size={26} color="#fff" />
          <Text style={styles.backTx}>Actus</Text>
        </Pressable>
      </View>

      {newsQuery.isPending && !article ? (
        <ActivityIndicator color={UNITED_RED} style={{ marginTop: 40 }} />
      ) : !article ? (
        <Text style={styles.empty}>Article introuvable.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {article.image_url ? (
            <Image source={{ uri: article.image_url }} style={styles.hero} />
          ) : null}
          <Text style={styles.meta}>
            <Text style={styles.cat}>{categoryLabel(article.category)}</Text>
            {'  ·  '}
            {relativeTimeFr(article.published_at)}
            {article.verified ? '  ·  Officiel' : ''}
          </Text>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.body}>{article.body || article.summary}</Text>
          {article.url ? (
            <Pressable
              style={styles.linkBtn}
              onPress={() => void Linking.openURL(String(article.url))}
            >
              <Text style={styles.linkTx}>{"Lire l'article complet"}</Text>
              <MaterialCommunityIcons name="open-in-new" size={16} color={UNITED_RED} />
            </Pressable>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  topBar: { paddingHorizontal: 8, paddingBottom: 4 },
  back: { flexDirection: 'row', alignItems: 'center' },
  backTx: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scroll: { padding: 16, paddingBottom: 48 },
  hero: { width: '100%', height: 220, borderRadius: 16, marginBottom: 14, backgroundColor: '#1a1a1a' },
  meta: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 10 },
  cat: { color: UNITED_RED, fontWeight: '800' },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', lineHeight: 32, marginBottom: 14 },
  body: { color: 'rgba(255,255,255,0.88)', fontSize: 16, lineHeight: 25 },
  linkBtn: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(218,41,28,0.4)',
  },
  linkTx: { color: UNITED_RED, fontWeight: '700' },
  empty: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 40 },
});
