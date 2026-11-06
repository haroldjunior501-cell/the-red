import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FORMATION_LABEL } from '../../../constants/fantasyPitch';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';

export type FantasyUnitedBarProps = {
  filledCount: number;
  benchCount: number;
};

export const FantasyUnitedBar = memo(function FantasyUnitedBar({
  filledCount,
  benchCount,
}: FantasyUnitedBarProps) {
  return (
    <LinearGradient
      colors={['rgba(218, 41, 28, 0.12)', 'rgba(20, 10, 12, 0.92)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <View style={styles.stat}>
        <Text style={styles.statVal}>{filledCount}/11</Text>
        <Text style={styles.statLbl}>Titulaires</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={styles.statVal}>{benchCount}</Text>
        <Text style={styles.statLbl}>Banc</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={[styles.statVal, styles.formation]}>{FORMATION_LABEL}</Text>
        <Text style={styles.statLbl}>Formation</Text>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.borderRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  stat: { alignItems: 'center', flex: 1 },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(218, 41, 28, 0.22)',
  },
  statVal: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    color: T.text,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  formation: { color: T.gold },
  statLbl: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: T.muted2,
    marginTop: 2,
    letterSpacing: 0.4,
  },
});
