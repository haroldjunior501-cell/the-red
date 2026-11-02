import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ARENA_THEME as T } from '../../../constants/arenaTheme';
import { arenaStyles } from '../ArenaScreen.styles';
import type { SimulatorReward } from '../../../types/arena.types';

type Props = { rewards: SimulatorReward[] };

export const RewardsCard = memo(function RewardsCard({ rewards }: Props) {
  const { t } = useTranslation();
  return (
    <View style={arenaStyles.section}>
      <Text style={arenaStyles.sectionTitle}>{t('arena.rewards')}</Text>
      <View style={arenaStyles.card}>
        {rewards.map((r) => (
          <View key={r.id} style={styles.row}>
            <MaterialCommunityIcons
              name={r.unlocked ? 'check-circle' : 'circle-outline'}
              size={16}
              color={r.unlocked ? T.green : T.muted}
            />
            <Text style={[styles.lbl, !r.unlocked && styles.lblOff]}>{r.label}</Text>
            <Text style={styles.pts}>+{r.points}</Text>
          </View>
        ))}
        <Pressable style={arenaStyles.linkBtn}>
          <Text style={arenaStyles.linkBtnTxt}>{t('arena.seeAllRewards')}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  lbl: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12, color: T.text },
  lblOff: { color: T.muted2 },
  pts: { fontFamily: 'Inter_700Bold', fontSize: 11, color: T.gold },
});
