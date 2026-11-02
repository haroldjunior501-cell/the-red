import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, UNITED_GOLD, UNITED_RED } from '../../constants/colors';
import { TheRedApi } from '../../services/theRedApiClient';
import type { RedPost } from '../../services/theRedContent';

export default function CommunityScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<RedPost[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setPosts(await TheRedApi.getPosts());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const publish = async () => {
    const content = draft.trim();
    if (content.length < 2) {
      Alert.alert('Communauté', 'Écris quelques mots avant de publier.');
      return;
    }
    setSending(true);
    try {
      await TheRedApi.createPost(content);
      setDraft('');
      await load();
    } finally {
      setSending(false);
    }
  };

  const react = async (post: RedPost) => {
    setPosts((current) =>
      current.map((item) =>
        item.id === post.id ? { ...item, reactions_count: item.reactions_count + 1 } : item
      )
    );
    try {
      await TheRedApi.reactToPost(post.id);
    } catch {
      /* le compteur local reste affiché */
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
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
        <Text style={styles.title}>Communauté</Text>
        <Text style={styles.lead}>Le mur des supporters des Red Devils.</Text>

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ton message aux Reds…"
            placeholderTextColor="#64748b"
            style={styles.input}
            multiline
          />
          <TouchableOpacity style={styles.publish} onPress={() => void publish()} disabled={sending}>
            <Text style={styles.publishText}>{sending ? 'Publication…' : 'Publier'}</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color={UNITED_RED} style={{ marginTop: 24 }} /> : null}

        {posts.map((post) => (
          <View key={post.id} style={styles.card}>
            <View style={styles.authorRow}>
              <MaterialCommunityIcons name="account-circle" size={22} color={UNITED_GOLD} />
              <Text style={styles.author}>{post.author_name || 'Supporter'}</Text>
            </View>
            <Text style={styles.body}>{post.content}</Text>
            <TouchableOpacity style={styles.react} onPress={() => void react(post)}>
              <MaterialCommunityIcons name="heart" size={16} color={UNITED_RED} />
              <Text style={styles.reactText}>{post.reactions_count} Red</Text>
              <Text style={styles.comments}>{post.comments_count} commentaires</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  composer: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 41, 28, 0.28)',
  },
  input: { color: '#fff', minHeight: 64, fontSize: 15, textAlignVertical: 'top' },
  publish: {
    alignSelf: 'flex-end',
    backgroundColor: UNITED_RED,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  publishText: { color: '#fff', fontWeight: '800' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  author: { color: '#fff', fontWeight: '800' },
  body: { color: '#e2e8f0', lineHeight: 20 },
  react: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  reactText: { color: '#94a3b8', fontWeight: '700' },
  comments: { color: '#64748b', marginLeft: 8 },
});
