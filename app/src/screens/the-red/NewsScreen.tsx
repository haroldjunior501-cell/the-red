import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, UNITED_GOLD, UNITED_RED } from '../../constants/colors';
import { TheRedApi } from '../../services/theRedApiClient';
import type { RedNews } from '../../services/theRedContent';

export default function NewsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<RedNews[]>([]);
  const [selected, setSelected] = useState<RedNews | null>(null);

  const load = useCallback(async () => {
    setItems(await TheRedApi.getNews());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={UNITED_RED}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
      >
        <Text style={styles.kicker}>MANCHESTER UNITED</Text>
        <Text style={styles.title}>Actualités</Text>
        <Text style={styles.lead}>Le fil United, sans quitter l’app.</Text>

        {loading ? <ActivityIndicator color={UNITED_RED} style={{ marginTop: 24 }} /> : null}

        {selected ? (
          <View style={styles.article}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backRow}>
              <MaterialCommunityIcons name="chevron-left" size={20} color={UNITED_RED} />
              <Text style={styles.backText}>Toutes les actus</Text>
            </TouchableOpacity>
            <Text style={styles.source}>{selected.source}</Text>
            <Text style={styles.headline}>{selected.title}</Text>
            <Text style={styles.body}>{selected.summary}</Text>
          </View>
        ) : (
          items.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => setSelected(item)}>
              <Text style={styles.source}>{item.source}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.summary} numberOfLines={3}>
                {item.summary}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  kicker: { color: UNITED_GOLD, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  lead: { color: '#94a3b8', marginTop: 6, marginBottom: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  source: { color: UNITED_GOLD, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 6 },
  summary: { color: '#94a3b8', marginTop: 6, lineHeight: 18 },
  article: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(218, 41, 28, 0.35)',
  },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backText: { color: UNITED_RED, fontWeight: '700' },
  headline: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 8, lineHeight: 28 },
  body: { color: '#e2e8f0', marginTop: 14, fontSize: 15, lineHeight: 22 },
});
