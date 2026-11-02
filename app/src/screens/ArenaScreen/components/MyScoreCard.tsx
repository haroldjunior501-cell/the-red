import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ARENA_THEME as T } from '../../../constants/arenaTheme';
import { arenaStyles } from '../ArenaScreen.styles';
import type { SimulatorCaptainState, SimulatorScoreState } from '../../../types/arena.types';

type Props = {
  score: SimulatorScoreState;
  captain: SimulatorCaptainState | null;
  leaderProgress: number;
};

export const MyScoreCard = memo(function MyScoreCard({ score, captain, leaderProgress }: Props) {
  const { t } = useTranslation();
  return (
    <View style={arenaStyles.section}>
      <Text style={arenaStyles.sectionTitle}>{t('arena.myScore')}</Text>
      <LinearGradient colors={[T.purple2, T.card]} style={styles.card}>
        <Text style={styles.big}>{score.totalPoints.toLocaleString()}</Text>
        <Text style={styles.lbl}>{t('arena.ptsSeason')}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.rank}>{t('arena.worldRank', { rank: score.worldRank || '—' })}</Text>
          <Text style={styles.gap}>
            {score.worldRank <= 1
              ? t('arena.leader')
              : t('arena.gapTo', { gap: score.gapToLeader, name: score.leaderName })}
          </Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${leaderProgress * 100}%` }]} />
        </View>
        <Text style={styles.dayGain}>{t('arena.todayGain', { gain: score.dayGain })}</Text>
        {captain ? (
          <View style={styles.capRow}>
            <Image
              source={{ uri: captain.photo }}
              style={styles.capPhoto}
              contentFit="cover"
              contentPosition="top"
              cachePolicy="memory-disk"
            />
            <View style={styles.capInfo}>
              <Text style={styles.capName}>{captain.name}</Text>
              <Text style={styles.capRole}>{t('arena.captainRole')}</Text>
            </View>
            <Text style={styles.cap2x}>2X</Text>
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 43, 226, 0.35)',
  },
  big: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    color: T.purpleLight,
    letterSpacing: 1,
  },
  lbl: { fontFamily: 'Inter_500Medium', fontSize: 11, color: T.muted2, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  rank: { fontFamily: 'Inter_800ExtraBold', fontSize: 13, color: T.text },
  gap: { fontFamily: 'Inter_500Medium', fontSize: 11, color: T.muted2 },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginTop: 10,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: T.purple, borderRadius: 3 },
  dayGain: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: T.green,
    marginTop: 8,
  },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  capPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: T.purple,
    marginRight: 10,
  },
  capInfo: { flex: 1 },
  capName: { fontFamily: 'Inter_800ExtraBold', fontSize: 13, color: T.text },
  capRole: { fontSize: 10, color: T.muted2, marginTop: 2, fontFamily: 'Inter_500Medium' },
  cap2x: { fontFamily: 'BebasNeue_400Regular', fontSize: 32, color: T.gold },
});
