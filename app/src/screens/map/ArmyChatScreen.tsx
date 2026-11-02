import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
  type ListRenderItem,
} from 'react-native';
import { MessageBubble, type ChatMessage } from '../../components/map/MessageBubble';
import { getFootballStickers, getTrendingStickers, searchStickers, type GiphySticker } from '../../services/giphyService';
import { useUserStore } from '../../store/useUserStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INITIAL: ChatMessage[] = [
  {
    id: '1',
    author: 'Karim',
    role: 'Capitaine',
    country: 'FR',
    text: 'Ce soir on lâche rien',
    reactions: [
      { emoji: '🔥', count: 142 },
      { emoji: '💚', count: 89 },
    ],
    time: '14:02',
  },
  {
    id: '2',
    author: 'Inès',
    role: 'Vétéran',
    country: 'FR',
    text: 'Allez les Bleus',
    reactions: [{ emoji: '💚', count: 67 }],
    time: '14:04',
  },
  {
    id: '3',
    author: 'Harold',
    role: 'MOI',
    country: 'FR',
    text: 'Je sens le but venir',
    isMe: true,
    reactions: [{ emoji: '🔥', count: 23 }],
    time: '14:05',
  },
  {
    id: '4',
    author: 'Pierre',
    role: 'Soldat',
    country: 'FR',
    text: 'MBAPPÉ MBAPPÉ',
    time: '14:06',
  },
  {
    id: '5',
    author: 'Amara',
    role: 'Vétéran',
    country: 'FR',
    text: 'La défense tient',
    reactions: [
      { emoji: '💪', count: 44 },
      { emoji: '🛡', count: 31 },
    ],
    time: '14:07',
  },
  {
    id: '6',
    author: 'Fatou',
    role: 'Recrue',
    country: 'FR',
    text: 'ON EST LÀ',
    time: '14:08',
  },
];

const EMOJI_QUICK = ['🔥', '💚', '😤', '⚽', '🏆', '💪', '😭'] as const;

export default function ArmyChatScreen() {
  const { height } = Dimensions.get('window');
  const name = useUserStore((s) => s.name);
  const countryCode = useUserStore((s) => s.countryCode);
  const displayName = (name || 'Harold').toUpperCase();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL);
  const [input, setInput] = useState('');
  const [stickerOpen, setStickerOpen] = useState(false);
  const sheetY = useRef(new Animated.Value(height + 400)).current;
  const [giphyTab, setGiphyTab] = useState<'trend' | 'football' | 'celebration' | 'supporter'>('trend');
  const [stickers, setStickers] = useState<GiphySticker[]>([]);
  const [giphyQuery, setGiphyQuery] = useState('');
  const [loadingGiphy, setLoadingGiphy] = useState(false);
  const { width } = Dimensions.get('window');
  const colW = (width - 24) / 3;

  const fetchStickersForTab = useCallback(async () => {
    setLoadingGiphy(true);
    try {
      let list: GiphySticker[] = [];
      if (giphyTab === 'trend') list = await getTrendingStickers();
      else if (giphyTab === 'football') list = await getFootballStickers();
      else if (giphyTab === 'celebration') list = await searchStickers('celebration party');
      else list = await searchStickers('supporter football');
      setStickers(list);
    } finally {
      setLoadingGiphy(false);
    }
  }, [giphyTab]);

  useEffect(() => {
    if (!stickerOpen) return;
    setGiphyQuery('');
    void fetchStickersForTab();
  }, [stickerOpen, giphyTab, fetchStickersForTab]);

  const openSticker = useCallback(() => {
    Keyboard.dismiss();
    setGiphyTab('trend');
    setStickerOpen(true);
    sheetY.setValue(height + 400);
    Animated.timing(sheetY, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [height, sheetY]);

  const closeSticker = useCallback(() => {
    Animated.timing(sheetY, { toValue: height + 400, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() =>
      setStickerOpen(false)
    );
  }, [height, sheetY]);

  const sendSticker = useCallback(
    (url: string) => {
      closeSticker();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const t = new Date();
      const time = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
      setMessages((m) => [
        ...m,
        {
          id: String(Date.now()),
          author: displayName,
          role: 'MOI',
          country: countryCode || 'FR',
          stickerUrl: url,
          isMe: true,
          time,
        },
      ]);
    },
    [closeSticker, countryCode, displayName]
  );

  const sendText = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMessages((m) => [
      ...m,
      {
        id: String(Date.now()),
        author: displayName,
        role: 'MOI',
        country: countryCode || 'FR',
        text: t.slice(0, 20),
        isMe: true,
        time,
      },
    ]);
    setInput('');
  }, [countryCode, displayName, input]);

  const appendEmoji = useCallback(
    (emoji: string) => {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setMessages((m) => [
        ...m,
        {
          id: String(Date.now()),
          author: displayName,
          role: 'MOI',
          country: countryCode || 'FR',
          text: emoji,
          isMe: true,
          time,
        },
      ]);
    },
    [countryCode, displayName]
  );

  const renderMsg: ListRenderItem<ChatMessage> = useCallback(({ item }) => <MessageBubble item={item} />, []);

  const runStickerSearch = useCallback(async () => {
    setLoadingGiphy(true);
    try {
      const list = giphyQuery.trim().length >= 2 ? await searchStickers(giphyQuery) : await getTrendingStickers();
      setStickers(list);
    } finally {
      setLoadingGiphy(false);
    }
  }, [giphyQuery]);

  return (
    <View style={[styles.root, { paddingBottom: 88 }]}>
      <View style={styles.chatHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {['🧑', '👩', '👨', '👩'].map((e, i) => (
            <View key={i} style={[styles.chatStackAv, { marginLeft: i === 0 ? 0 : -8 }]}>
              <Text style={{ fontSize: 14 }}>{e}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.chatHeaderMeta}>
          34 205 en ligne <Text style={{ color: '#2979ff' }}>FR</Text>
        </Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(x) => x.id}
        renderItem={renderMsg}
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 8, paddingBottom: 8 }}
        keyboardShouldPersistTaps="handled"
      />
      <View style={styles.emojiQuick}>
        {EMOJI_QUICK.map((em) => (
          <TouchableOpacity key={em} style={styles.emojiQuickBtn} onPress={() => appendEmoji(em)}>
            <Text style={{ fontSize: 18 }}>{em}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.stickerFab} onPress={openSticker}>
          <Text style={{ fontSize: 16 }}>🎭</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Envoie un message · 20 car."
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={input}
          onChangeText={setInput}
          maxLength={20}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendText}>
          <Text style={styles.sendBtnTxt}>➤</Text>
        </TouchableOpacity>
      </View>

      {stickerOpen ? (
        <View style={styles.sheetBackdrop} pointerEvents="box-none">
          <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} onPress={closeSticker} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetSearch}>
              <TextInput
                style={styles.sheetSearchIn}
                placeholder="Rechercher un sticker..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={giphyQuery}
                onChangeText={setGiphyQuery}
                onSubmitEditing={() => void runStickerSearch()}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, marginBottom: 10 }}>
              {(
                [
                  { k: 'trend' as const, label: 'Tendances' },
                  { k: 'football' as const, label: 'Football' },
                  { k: 'celebration' as const, label: 'Célébration' },
                  { k: 'supporter' as const, label: 'Supporter' },
                ] as const
              ).map((t) => (
                <TouchableOpacity key={t.k} onPress={() => setGiphyTab(t.k)} style={[styles.giphyTab, giphyTab === t.k && styles.giphyTabOn]}>
                  <Text style={[styles.giphyTabTxt, giphyTab === t.k && styles.giphyTabTxtOn]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {loadingGiphy ? (
              <Text style={{ color: '#8896ab', textAlign: 'center', padding: 20 }}>Chargement…</Text>
            ) : (
              <FlatList
                data={stickers}
                keyExtractor={(x) => x.id}
                numColumns={3}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => sendSticker(item.gifUrl || item.previewUrl)}
                    style={{ width: colW, padding: 2, alignItems: 'center' }}
                  >
                    <Image
                      source={{ uri: item.previewUrl || item.gifUrl }}
                      style={{ width: colW - 6, height: colW - 6, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />
            )}
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chatHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 10, marginTop: 4 },
  chatStackAv: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f1623',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderMeta: { marginLeft: 10, fontSize: 12, color: '#8896ab', flex: 1 },
  emojiQuick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  emojiQuickBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  stickerFab: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, paddingBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.13)',
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#fff',
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2979ff', alignItems: 'center', justifyContent: 'center' },
  sendBtnTxt: { fontSize: 17, color: '#fff', fontWeight: '800' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, zIndex: 40, justifyContent: 'flex-end' },
  sheet: {
    height: 300,
    backgroundColor: '#0f1623',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 50,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 10 },
  sheetSearch: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetSearchIn: { flex: 1, color: '#fff', fontSize: 13 },
  giphyTab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)' },
  giphyTabOn: { backgroundColor: 'rgba(41, 121, 255, 0.15)' },
  giphyTabTxt: { fontSize: 11, color: '#8896ab', fontWeight: '700' },
  giphyTabTxtOn: { color: '#2979ff' },
});
