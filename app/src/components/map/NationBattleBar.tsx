import React, { memo, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import type { NationPower } from '../../services/mapService';

const F = { bebas: 'BebasNeue_400Regular' as const, i800: 'Inter_800ExtraBold' as const, i700: 'Inter_700Bold' as const };

export type NationBattleBarProps = {
  nationsPower: NationPower;
  userCountry: string;
};

function pickEnemy(user: string, p: NationPower): string {
  const keys = Object.keys(p).filter((k) => k !== user);
  if (!keys.length) return 'BR';
  return keys.reduce((a, b) => ((p[b] ?? 0) > (p[a] ?? 0) ? b : a), keys[0]);
}

export const NationBattleBar = memo(function NationBattleBar({ nationsPower, userCountry }: NationBattleBarProps) {
  const u = userCountry.toUpperCase() || 'FR';
  const ally = Math.max(1, Math.min(99, nationsPower[u] ?? 62));
  const enemyK = pickEnemy(u, nationsPower);
  const enemy = Math.max(1, 100 - ally);
  const pct = useSharedValue(ally);
  const [trackW, setTrackW] = useState(0);

  useEffect(() => {
    pct.value = withTiming(ally, { duration: 800 });
  }, [ally, pct]);

  const wPx = useDerivedValue(() => (trackW > 0 ? (trackW * pct.value) / 100 : 0));
  const barStyle = useAnimatedStyle(() => ({ width: Math.max(4, wPx.value) }));

  const onLay = (e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width);

  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name="sword-cross" size={20} color="#fff" style={{ alignSelf: 'center', marginBottom: 6 }} />
      <Text style={styles.title}>COMBAT DES NATIONS</Text>
      <Text style={styles.sub}>MAJ EN TEMPS RÉEL</Text>
      <View style={styles.rowFlags}>
        <Text style={styles.flag}>🇫🇷</Text>
        <View style={{ flex: 1 }} />
        <MaterialCommunityIcons name="earth" size={22} color="rgba(255,255,255,0.5)" />
      </View>
      <View style={styles.track} onLayout={onLay}>
        <Animated.View style={[styles.allyWrap, barStyle]}>
          <LinearGradient colors={['#002395', '#2979ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.allyFill} />
        </Animated.View>
        <LinearGradient colors={['#FF3B30', '#CC1A1A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.enemyFill} />
      </View>
      <View style={styles.labels}>
        <Text style={styles.allyLbl}>
          {ally}% · {u}
        </Text>
        <Text style={styles.enemyLbl}>
          {enemy}% · {enemyK}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  title: { fontFamily: F.bebas, fontSize: 18, letterSpacing: 2, color: '#fff', textAlign: 'center' },
  sub: { fontSize: 9, color: '#888', letterSpacing: 2, textAlign: 'center', marginBottom: 10, fontFamily: F.i700 },
  rowFlags: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  flag: { fontSize: 18 },
  track: { height: 14, borderRadius: 7, overflow: 'hidden', flexDirection: 'row', marginVertical: 8 },
  allyWrap: { height: '100%', overflow: 'hidden', borderTopLeftRadius: 7, borderBottomLeftRadius: 7 },
  allyFill: { width: '100%', height: '100%' },
  enemyFill: { flex: 1, minWidth: 0, height: '100%', borderTopRightRadius: 7, borderBottomRightRadius: 7 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  allyLbl: { fontSize: 12, fontWeight: '800', color: '#2979ff', fontFamily: F.i800 },
  enemyLbl: { fontSize: 12, fontWeight: '800', color: '#FF3B30', fontFamily: F.i800 },
});
