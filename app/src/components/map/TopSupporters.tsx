import React, { memo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { TopSupporterRow } from '../../services/mapService';

export type TopSupportersProps = { supporters: TopSupporterRow[] };

export const TopSupporters = memo(function TopSupporters({ supporters }: TopSupportersProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.h}>👑 TOP SUPPORTERS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {supporters.slice(0, 5).map((s, i) => (
          <View key={s.id} style={styles.itemCard}>
            <Text style={styles.r}>#{i + 1}</Text>
            <View style={styles.av}>
              {s.avatar ? (
                <Image source={{ uri: s.avatar }} style={{ width: 28, height: 28, borderRadius: 14 }} />
              ) : (
                <MaterialCommunityIcons name="account" size={18} color="rgba(255,255,255,0.7)" />
              )}
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {s.name}
            </Text>
            <Text style={styles.ct}>{s.country}</Text>
            <Text style={styles.kdo}>{s.kdo.toLocaleString('fr-FR')} KDO</Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnT}>TOUS LES SUPPORTERS</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1 },
  h: { fontSize: 13, fontWeight: '800', color: '#fff', marginBottom: 10 },
  row: { gap: 10, paddingVertical: 4 },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(17,24,39,0.88)',
    padding: 10,
    alignItems: 'center',
  },
  r: { fontSize: 11, fontWeight: '900', color: '#bfa968', alignSelf: 'flex-start' },
  av: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#003D1A',
    borderWidth: 1.5,
    borderColor: 'rgba(41, 121, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 12, fontWeight: '700', color: '#fff' },
  ct: { fontSize: 10, color: '#888' },
  kdo: { fontSize: 11, fontWeight: '800', color: '#FFD700' },
  btn: { marginTop: 10, borderWidth: 1, borderColor: '#2979ff', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  btnT: { fontSize: 12, fontWeight: '700', color: '#2979ff' },
});
