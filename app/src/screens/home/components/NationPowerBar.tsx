import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { formatPower } from '../../../services/gamesService';

export type NationPowerBarProps = {
  countryCode: string;
  flag: string;
  countryName: string;
  power: number;
  rank: number;
  supporterCount: number;
  dailyGain: number;
};

export const NationPowerBar = memo(function NationPowerBar({
  flag,
  countryName,
  power,
  rank,
  supporterCount,
  dailyGain,
}: NationPowerBarProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(1, power / 100_000_000 || 0);

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [anim, pct]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>
          🌍 PUISSANCE {countryName.toUpperCase()}
        </Text>
        <Text style={styles.rank}>#{rank} MONDIAL</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
      <View style={styles.stats}>
        <Text style={styles.stat}>
          <Text style={styles.flag}>{flag} </Text>
          {formatPower(power)} pts
        </Text>
        <Text style={styles.stat}>{formatPower(supporterCount)} supporters</Text>
        <Text style={styles.gain}>↑ +{formatPower(dailyGain)} aujourd&apos;hui</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    backgroundColor: '#0f1623',
    padding: 14,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: COLORS.text, fontFamily: 'Inter_800ExtraBold', fontSize: 11, letterSpacing: 1 },
  rank: { color: COLORS.primarySoft, fontFamily: 'Inter_700Bold', fontSize: 11 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  fill: { height: '100%', borderRadius: 4, backgroundColor: COLORS.primary },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  stat: { color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  flag: { fontSize: 12 },
  gain: { color: COLORS.primarySoft, fontFamily: 'Inter_700Bold', fontSize: 11 },
});
