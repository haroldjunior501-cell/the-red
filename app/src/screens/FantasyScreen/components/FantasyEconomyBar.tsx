import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FORMATION_LABEL } from '../../../constants/fantasyPitch';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';
import type { PrestigeLevel } from '../../../types/fantasyEconomy.types';

export type FantasyEconomyBarProps = {
  remaining: number;
  budgetCapM: number;
  filledCount: number;
  spent: number;
  fantasyPoints: number;
  prestige: PrestigeLevel | null;
  onUpgradePress: () => void;
};

export const FantasyEconomyBar = memo(function FantasyEconomyBar({
  remaining,
  budgetCapM,
  filledCount,
  spent,
  fantasyPoints,
  prestige,
  onUpgradePress,
}: FantasyEconomyBarProps) {
  const pct = budgetCapM > 0 ? Math.min(1, spent / budgetCapM) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <Text style={styles.label}>BUDGET DISPONIBLE</Text>
          <Text style={styles.val}>{remaining.toFixed(1)}M €</Text>
          <Text style={styles.cap}>Cap {budgetCapM.toFixed(0)}M €</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct * 100}%` }]} />
          </View>
        </View>
        <View style={styles.right}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{filledCount}/11</Text>
            <Text style={styles.statLbl}>Joueurs</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: T.blue2 }]}>{FORMATION_LABEL}</Text>
            <Text style={styles.statLbl}>Formation</Text>
          </View>
        </View>
      </View>

      <View style={styles.fpRow}>
        <Text style={styles.fp}>
          💎 Fantasy Points : {fantasyPoints.toLocaleString('fr-FR')} FP
        </Text>
        {prestige ? (
          <View style={[styles.prestigeBadge, { borderColor: prestige.color }]}>
            <Text style={[styles.prestigeTxt, { color: prestige.color }]}>{prestige.name}</Text>
          </View>
        ) : null}
      </View>

      <Pressable style={styles.upgradeBtn} onPress={onUpgradePress}>
        <Text style={styles.upgradeTxt}>Augmenter mon budget</Text>
        <Ionicons name="chevron-forward" size={16} color={T.blue2} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: T.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    gap: 10,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  left: { flex: 1, paddingRight: 12 },
  label: {
    fontSize: 9,
    color: T.muted2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'Inter_600SemiBold',
  },
  val: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    letterSpacing: 2,
    color: T.green,
    lineHeight: 22,
    marginTop: 2,
  },
  cap: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: T.muted2,
    marginTop: 2,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: T.green, borderRadius: 2 },
  right: { flexDirection: 'row', gap: 16 },
  stat: { alignItems: 'flex-end' },
  statVal: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: T.text2,
    fontVariant: ['tabular-nums'],
  },
  statLbl: { fontSize: 9, color: T.muted2, marginTop: 2 },
  fpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  fp: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: T.gold,
    flexShrink: 1,
  },
  prestigeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  prestigeTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(41, 121, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.28)',
  },
  upgradeTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: T.blue2,
  },
});
