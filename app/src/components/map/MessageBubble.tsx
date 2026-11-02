import React, { memo, useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { COUNTRIES } from '../../constants/countries';

export type ChatReaction = { emoji: string; count: number };

export type ChatMessage = {
  id: string;
  author: string;
  role: string;
  country: string;
  text?: string;
  stickerUrl?: string;
  isMe?: boolean;
  reactions?: ChatReaction[];
  time: string;
};

function flagForCode(code: string) {
  return COUNTRIES.find((x) => x.code === code)?.flag ?? '';
}

export const MessageBubble = memo(function MessageBubble({ item }: { item: ChatMessage }) {
  const scale = useRef(new Animated.Value(item.stickerUrl ? 0 : 1)).current;
  useEffect(() => {
    if (!item.stickerUrl) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }).start();
  }, [item.stickerUrl, scale]);

  const rowRev = item.isMe;
  return (
    <View style={[styles.msgRow, rowRev && styles.msgRowRev]}>
      <View style={[styles.msgAv, item.isMe && styles.msgAvMe]}>
        <Text style={{ fontSize: 15 }}>{flagForCode(item.country)}</Text>
      </View>
      <Animated.View style={[styles.msgCol, { transform: [{ scale }] }]}>
        <View style={[styles.msgBubble, item.isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          <Text style={styles.msgAuthor}>
            {item.author} · {item.role}
          </Text>
          {item.stickerUrl ? (
            <Image source={{ uri: item.stickerUrl }} style={styles.msgSticker} resizeMode="cover" />
          ) : (
            <Text style={styles.msgText}>{item.text}</Text>
          )}
        </View>
        {item.reactions && item.reactions.length > 0 ? (
          <View style={styles.msgReactRow}>
            {item.reactions.map((r) => (
              <View key={r.emoji} style={styles.msgReactPill}>
                <Text style={styles.msgReactTxt}>
                  {r.emoji} {r.count}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <Text style={[styles.msgTime, rowRev && styles.msgTimeRev]}>{item.time}</Text>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  msgRow: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'flex-end' },
  msgRowRev: { flexDirection: 'row-reverse' },
  msgAv: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#003D1A',
    borderWidth: 1.5,
    borderColor: 'rgba(41, 121, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvMe: { borderColor: 'rgba(41, 121, 255, 0.55)' },
  msgCol: { maxWidth: '82%' as const },
  msgBubble: {
    maxWidth: 260,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  msgBubbleMe: { backgroundColor: 'rgba(41, 121, 255, 0.1)', borderColor: 'rgba(41, 121, 255, 0.18)' },
  msgBubbleOther: {},
  msgAuthor: { fontSize: 9, color: '#8896ab', fontWeight: '700', marginBottom: 4 },
  msgText: { fontSize: 13, color: '#fff', fontWeight: '600', lineHeight: 18 },
  msgSticker: { width: 130, height: 130, borderRadius: 14, marginTop: 4 },
  msgReactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  msgReactPill: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8 },
  msgReactTxt: { fontSize: 12, color: '#fff' },
  msgTime: { fontSize: 8, color: '#8896ab', marginTop: 4, textAlign: 'left' },
  msgTimeRev: { textAlign: 'right' },
});
