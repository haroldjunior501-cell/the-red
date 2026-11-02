import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FORMATION_LABEL } from '../../../constants/fantasyPitch';
import { FANTASY_BUDGET_M, FANTASY_THEME as T } from '../../../constants/fantasyTheme';

export type FantasyBudgetBarProps = {
  remaining: number;
  filledCount: number;
  spent: number;
};

export const FantasyBudgetBar = memo(function FantasyBudgetBar({
  remaining,
  filledCount,
  spent,
}: FantasyBudgetBarProps) {
  const pct = Math.min(1, spent / FANTASY_BUDGET_M);

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={styles.label}>BUDGET DISPONIBLE</Text>
        <Text style={styles.val}>{remaining.toFixed(1)}M €</Text>
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
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: T.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  left: { flex: 1, paddingRight: 12 },
  label: {
    fontSize: 9,
    color: T.muted2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  val: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    letterSpacing: 2,
    color: T.green,
    lineHeight: 22,
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
});
