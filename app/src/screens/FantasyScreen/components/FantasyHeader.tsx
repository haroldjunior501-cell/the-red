import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FANTASY_PHASE_TABS, type FantasyPhaseTabKey } from '../../../constants/fantasyPitch';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';

export type FantasyHeaderProps = {
  totalPoints: number;
  activePhase: FantasyPhaseTabKey;
  onPhaseChange: (key: FantasyPhaseTabKey) => void;
};

export const FantasyHeader = memo(function FantasyHeader({
  totalPoints,
  activePhase,
  onPhaseChange,
}: FantasyHeaderProps) {
  return (
    <LinearGradient colors={[T.headerTop, T.bg]} style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.brandMark} />
        <View style={styles.titleCol}>
          <Text style={styles.eyebrow}>THE RED</Text>
          <Text style={styles.title}>PICK YOUR XI</Text>
        </View>
        <View style={styles.ptsPill}>
          <Text style={styles.pts}>{totalPoints}</Text>
          <Text style={styles.ptsLbl}>PTS</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {FANTASY_PHASE_TABS.map((tab) => {
          const on = tab.key === activePhase;
          return (
            <Pressable
              key={tab.key}
              style={[styles.ptab, on && styles.ptabOn]}
              onPress={() => onPhaseChange(tab.key)}
            >
              <Text style={[styles.ptabTxt, on && styles.ptabTxtOn]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.accentLine} />
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    paddingBottom: 0,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  brandMark: {
    width: 4,
    height: 36,
    borderRadius: 2,
    backgroundColor: T.blue,
  },
  titleCol: { flex: 1 },
  eyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 2.4,
    color: T.gold,
    marginBottom: 2,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    letterSpacing: 3,
    color: T.text,
    lineHeight: 28,
  },
  ptsPill: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(218, 41, 28, 0.14)',
    borderWidth: 1,
    borderColor: T.borderRed,
    minWidth: 52,
  },
  pts: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    color: T.gold,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
  ptsLbl: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    letterSpacing: 1.2,
    color: T.muted2,
  },
  tabs: { gap: 8, paddingBottom: 12 },
  ptab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  ptabOn: {
    backgroundColor: T.blue,
    borderColor: T.blue,
  },
  ptabTxt: { fontFamily: 'Inter_700Bold', fontSize: 11, color: T.muted2, letterSpacing: 0.3 },
  ptabTxtOn: { color: T.text },
  accentLine: {
    height: 1,
    backgroundColor: 'rgba(218, 41, 28, 0.35)',
    marginHorizontal: -16,
  },
});
