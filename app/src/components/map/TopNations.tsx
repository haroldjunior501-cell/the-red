import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TopNationRow } from '../../services/mapService';

const rankColor = (i: number) => (i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#8896ab');

export type TopNationsProps = { nations: TopNationRow[] };

export const TopNations = memo(function TopNations({ nations }: TopNationsProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.h}>🏆 TOP NATIONS</Text>
      {nations.slice(0, 5).map((n, i) => (
        <View key={n.code} style={styles.row}>
          <Text style={[styles.r, { color: rankColor(i) }]}>{i + 1}</Text>
          <Text style={styles.flg}>{n.flag}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {n.name} <Text style={styles.dot}>●</Text>
            </Text>
          </View>
          <Text style={styles.sup}>{n.supporters}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnT}>VOIR CLASSEMENT</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1 },
  h: { fontSize: 13, fontWeight: '800', color: '#fff', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  r: { width: 22, fontSize: 14, fontWeight: '900' },
  flg: { fontSize: 20 },
  name: { fontSize: 12, fontWeight: '700', color: '#fff' },
  dot: { fontSize: 6, color: '#2979ff' },
  sup: { fontSize: 11, fontWeight: '700', color: '#2979ff' },
  btn: { marginTop: 10, borderWidth: 1, borderColor: '#2979ff', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  btnT: { fontSize: 12, fontWeight: '700', color: '#2979ff' },
});
