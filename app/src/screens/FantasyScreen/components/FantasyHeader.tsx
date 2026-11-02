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
        <View style={styles.iconBtn}>
          <Text style={styles.iconTxt}>←</Text>
        </View>
        <Text style={styles.title}>FANTASY</Text>
        <Text style={styles.pts}>{totalPoints} pts</Text>
        <View style={styles.iconBtn}>
          <Text style={styles.iconTxt}>⋮</Text>
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
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(41,121,255,0.12)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { color: T.text2, fontSize: 14 },
  title: {
    flex: 1,
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 4,
    color: T.text,
  },
  pts: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: T.blue2,
    fontVariant: ['tabular-nums'],
  },
  tabs: { gap: 6 },
  ptab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
  },
  ptabOn: { backgroundColor: T.blue, borderColor: T.blue },
  ptabTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: T.muted2 },
  ptabTxtOn: { color: T.text },
});
