import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { countryIdToNation } from '../../../constants/mapHub';
import { subscribeToNationChat, sendNationChatMessage, type ChatMessage } from '../../../services/mapService';

const C = {
  bg: 'rgba(17,24,39,0.92)',
  border: 'rgba(41, 121, 255, 0.15)',
  primary: '#2979ff',
  text: '#fff',
  muted: '#6B7280',
  myBubble: 'rgba(41, 121, 255, 0.10)',
  myBubbleBorder: 'rgba(41, 121, 255, 0.25)',
} as const;

const RANK_COLORS: Record<string, string> = {
  Capitaine: '#2979ff', Vétéran: '#bfa968', Supporter: '#2979ff', default: '#6B7280',
};

export type NationChatProps = {
  countryId: string;
  userId: string;
  username: string;
  userRank: string;
};

const MessageRow = memo(function MessageRow({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  const rankColor = RANK_COLORS[msg.rank] ?? RANK_COLORS.default;
  const time = new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
      <View style={[styles.bubble, isMe && styles.bubbleMe]}>
        {!isMe && (
          <View style={styles.msgMeta}>
            <Text style={[styles.msgUser, { color: rankColor }]}>{msg.username}</Text>
            <Text style={[styles.msgRank, { color: rankColor }]}>{msg.rank}</Text>
          </View>
        )}
        <Text style={styles.msgText}>{msg.message}</Text>
        <Text style={styles.msgTime}>{time}</Text>
      </View>
    </View>
  );
});

export const NationChat = memo(function NationChat({
  countryId, userId, username, userRank,
}: NationChatProps) {
  const nationCode = countryIdToNation(countryId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    const unsub = subscribeToNationChat(nationCode, (msgs) => {
      setMessages(msgs);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    });
    return () => unsub();
  }, [nationCode]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    try {
      await sendNationChatMessage(nationCode, {
        userId, username, message: text, rank: userRank,
      });
    } finally {
      setSending(false);
    }
  }, [input, sending, nationCode, userId, username, userRank]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="chat" size={14} color={C.primary} />
        <Text style={styles.headerText}>CHAT NATION · {nationCode}</Text>
        <Text style={styles.onlineCount}>{messages.length > 0 ? `${messages.length} msg` : 'live'}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageRow msg={item} isMe={item.userId === userId} />}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <Text style={styles.empty}>Sois le premier à écrire dans ce chat 👊</Text>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message…"
          placeholderTextColor={C.muted}
          style={styles.input}
          maxLength={120}
          returnKeyType="send"
          onSubmitEditing={() => void sendMessage()}
        />
        <Pressable
          onPress={() => void sendMessage()}
          disabled={!input.trim() || sending}
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.12)',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(41, 121, 255, 0.1)',
  },
  headerText: { flex: 1, fontSize: 10, fontWeight: '800', color: C.primary, letterSpacing: 1 },
  onlineCount: { fontSize: 9, color: C.muted },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingVertical: 6, gap: 6 },
  empty: { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 20 },
  msgRow: { flexDirection: 'row' },
  msgRowMe: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '82%', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bubbleMe: { backgroundColor: C.myBubble, borderWidth: 1, borderColor: C.myBubbleBorder },
  msgMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  msgUser: { fontSize: 10, fontWeight: '700' },
  msgRank: { fontSize: 8, fontWeight: '600', opacity: 0.8 },
  msgText: { fontSize: 12, color: C.text, lineHeight: 17 },
  msgTime: { fontSize: 8, color: C.muted, marginTop: 3, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(41, 121, 255, 0.1)',
  },
  input: {
    flex: 1, fontSize: 13, color: C.text,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: C.border,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
  sendIcon: { fontSize: 16, color: '#000' },
});
