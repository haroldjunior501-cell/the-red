import React, { memo, useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { LiveEventRow } from '../../services/mapService';

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}

function iconFor(t: string): { icon: string; bg: string } {
  switch (t) {
    case 'goal':
      return { icon: '⚽', bg: 'rgba(41, 121, 255, 0.2)' };
    case 'gift':
      return { icon: '🎁', bg: 'rgba(255,184,0,0.2)' };
    case 'control':
      return { icon: '⚔️', bg: 'rgba(255,59,59,0.2)' };
    case 'join':
      return { icon: '👥', bg: 'rgba(59,139,255,0.2)' };
    default:
      return { icon: '✨', bg: 'rgba(255,255,255,0.1)' };
  }
}

export type LiveEventsFeedProps = {
  events: LiveEventRow[];
};

const Row = memo(function Row({ item }: { item: LiveEventRow }) {
  const { icon, bg } = iconFor(item.type);
  return (
    <Animated.View entering={FadeIn.duration(280)} style={styles.row}>
      <View style={[styles.ico, { backgroundColor: bg }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.type}>{item.type.toUpperCase()}</Text>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      </View>
      <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
    </Animated.View>
  );
});

export const LiveEventsFeed = memo(function LiveEventsFeed({ events }: LiveEventsFeedProps) {
  const render = useCallback(({ item }: { item: LiveEventRow }) => <Row item={item} />, []);
  return (
    <View style={styles.card}>
      <Text style={styles.h}>ÉVÉNEMENTS LIVE</Text>
      <FlatList data={[...events].reverse()} keyExtractor={(x) => x.id} renderItem={render} scrollEnabled={false} />
      <TouchableOpacity style={styles.more}>
        <Text style={styles.moreT}>VOIR PLUS</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { marginTop: 4 },
  h: { fontSize: 13, fontWeight: '800', color: '#fff', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  ico: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  type: { fontSize: 10, fontWeight: '800', color: '#8896ab' },
  title: { fontSize: 12, fontWeight: '600', color: '#fff', marginTop: 2 },
  desc: { fontSize: 11, color: '#888', marginTop: 1 },
  time: { fontSize: 9, color: '#555', alignSelf: 'flex-start' },
  more: { marginTop: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#2979ff', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  moreT: { fontSize: 12, fontWeight: '700', color: '#2979ff' },
});
