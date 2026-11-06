import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { UNITED_RED } from '../../constants/colors';
import { CLUB_NEWS_FILTERS, type ClubNewsCategory } from '../../constants/oneFootball';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import {
  categoryLabel,
  fetchUnitedClubNews,
  filterClubNews,
  relativeTimeFr,
  type ClubNewsItem,
} from '../../services/oneFootballNews';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ClubNews'>;

export default function ClubNewsScreen() {
  const navigation = useNavigation<Nav>();
  const [category, setCategory] = useState<ClubNewsCategory>('all');
  const [query, setQuery] = useState('');

  const newsQuery = useQuery({
    queryKey: ['thered', 'clubNews', 'united'] as const,
    queryFn: () => fetchUnitedClubNews(true),
    staleTime: 60_000,
  });

  const items = useMemo(
    () => filterClubNews(newsQuery.data ?? [], category, query),
    [category, newsQuery.data, query]
  );

  const featured = items[0] ?? null;
  const rest = featured ? items.slice(1) : items;

  const openArticle = useCallback(
    (item: ClubNewsItem) => {
      navigation.navigate('ClubNewsArticle', { articleId: item.id });
    },
    [navigation]
  );

  const renderRow = useCallback(
    ({ item }: { item: ClubNewsItem }) => (
      <Pressable style={styles.row} onPress={() => openArticle(item)}>
        <View style={styles.thumbWrap}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <MaterialCommunityIcons name="newspaper" size={22} color={UNITED_RED} />
            </View>
          )}
          <View style={styles.docBadge}>
            <MaterialCommunityIcons name="file-document-outline" size={12} color="#fff" />
          </View>
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle} numberOfLines={3}>
            {item.title}
          </Text>
          <Text style={styles.rowMeta}>
            <Text style={styles.cat}>{categoryLabel(item.category)}</Text>
            {'  ·  '}
            {relativeTimeFr(item.published_at)}
          </Text>
        </View>
      </Pressable>
    ),
    [openArticle]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={10}>
          <MaterialCommunityIcons name="close" size={22} color="#fff" />
        </Pressable>
        <View style={styles.newsPill}>
          <Text style={styles.newsPillTx}>Actus</Text>
        </View>
        <View style={styles.teamPill}>
          <Text style={styles.teamPillTx}>Manchester United</Text>
        </View>
      </View>

      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={newsQuery.isRefetching}
            tintColor={UNITED_RED}
            onRefresh={() => void newsQuery.refetch()}
          />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.heroTitle}>{"Aujourd'hui à United"}</Text>
            <Text style={styles.heroLead}>
              {"L'actualité du club en français · notifications à chaque nouveauté"}
            </Text>

            <View style={styles.searchWrap}>
              <MaterialCommunityIcons name="magnify" size={18} color="rgba(255,255,255,0.45)" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Rechercher une actualité…"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.searchInput}
              />
            </View>

            <FlatList
              horizontal
              data={CLUB_NEWS_FILTERS}
              keyExtractor={(f) => f.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              renderItem={({ item: f }) => {
                const active = category === f.key;
                return (
                  <Pressable
                    onPress={() => setCategory(f.key)}
                    style={[styles.chip, active && styles.chipOn]}
                  >
                    <Text style={[styles.chipTx, active && styles.chipTxOn]}>{f.label}</Text>
                  </Pressable>
                );
              }}
            />

            {newsQuery.isPending ? (
              <ActivityIndicator color={UNITED_RED} style={{ marginVertical: 28 }} />
            ) : null}

            {featured ? (
              <Pressable style={styles.featured} onPress={() => openArticle(featured)}>
                {featured.image_url ? (
                  <Image source={{ uri: featured.image_url }} style={styles.featuredImg} />
                ) : (
                  <View style={[styles.featuredImg, styles.thumbFallback]} />
                )}
                <View style={styles.featuredOverlay}>
                  <Text style={styles.featuredTitle} numberOfLines={3}>
                    {featured.title}
                  </Text>
                  <Text style={styles.rowMeta}>
                    <Text style={styles.cat}>{categoryLabel(featured.category)}</Text>
                    {'  ·  '}
                    {relativeTimeFr(featured.published_at)}
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {!newsQuery.isPending && !items.length ? (
              <Text style={styles.empty}>Aucune actualité pour ce filtre.</Text>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsPill: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  newsPillTx: { color: '#111', fontWeight: '800', fontSize: 13 },
  teamPill: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  teamPillTx: { color: '#fff', fontWeight: '700', fontSize: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  heroLead: { color: 'rgba(255,255,255,0.45)', marginTop: 4, marginBottom: 14, fontSize: 13 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, padding: 0 },
  chips: { gap: 8, paddingBottom: 14 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: '#fff', borderColor: '#fff' },
  chipTx: { color: '#fff', fontWeight: '700', fontSize: 12 },
  chipTxOn: { color: '#111' },
  featured: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#151515',
    marginBottom: 16,
  },
  featuredImg: { width: '100%', height: 210, backgroundColor: '#1a1a1a' },
  featuredOverlay: { padding: 14 },
  featuredTitle: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 26, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  thumbWrap: { position: 'relative' },
  thumb: { width: 92, height: 92, borderRadius: 12, backgroundColor: '#1a1a1a' },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  docBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, justifyContent: 'center' },
  rowTitle: { color: '#fff', fontSize: 15, fontWeight: '700', lineHeight: 20 },
  rowMeta: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 8 },
  cat: { color: UNITED_RED, fontWeight: '800' },
  empty: { color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 24 },
});
