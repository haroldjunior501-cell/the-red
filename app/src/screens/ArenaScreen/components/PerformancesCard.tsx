import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EventTypeIconWrap } from '../../../components/arena/EventTypeIcon';
import { PlayerPhoto } from '../../../components/arena/PlayerPhoto';
import { ARENA_THEME as T } from '../../../constants/arenaTheme';
import { arenaStyles } from '../ArenaScreen.styles';
import type { SimulatorLiveEvent, SimulatorLiveEventType } from '../../../types/arena.types';

type Props = { events: SimulatorLiveEvent[]; onViewAll: () => void };

export const PerformancesCard = memo(function PerformancesCard({ events, onViewAll }: Props) {
  const { t } = useTranslation();

  function eventDescription(type: SimulatorLiveEventType): string {
    switch (type) {
      case 'goal': return t('arena.goalEvent');
      case 'captain_goal': return t('arena.captainGoal');
      case 'assist': return t('arena.assist');
      case 'clean_sheet': return t('arena.cleanSheet');
      case 'motm': return t('arena.motm');
      case 'yellow': return t('arena.yellowCard');
      case 'red': return t('arena.redCard');
      default: return t('arena.goalEvent');
    }
  }

  return (
    <View style={arenaStyles.section}>
      <Text style={arenaStyles.sectionTitle}>{t('arena.performances')}</Text>
      <View style={arenaStyles.card}>
        {events.length === 0 ? (
          <Text style={styles.empty}>{t('arena.noEvents')}</Text>
        ) : (
          events.map((ev) => (
            <View key={ev.id} style={styles.row}>
              <PlayerPhoto playerId={ev.playerId} playerName={ev.playerName} size={34} isCaptain={ev.isCaptain} />
              <View style={styles.mid}>
                <Text style={styles.name}>{ev.playerName}{ev.isCaptain ? ' (C)' : ''}</Text>
                <Text style={styles.desc}>{eventDescription(ev.type)}</Text>
              </View>
              <Text style={styles.min}>{ev.minute}&apos;</Text>
              <Text style={[styles.pts, ev.points < 0 && styles.ptsNeg]}>
                {ev.points > 0 ? `+${ev.points}` : ev.points} pts
              </Text>
              <EventTypeIconWrap type={ev.type} />
            </View>
          ))
        )}
        {events.length > 0 ? (
          <Pressable style={styles.linkRow} onPress={onViewAll}>
            <Text style={arenaStyles.linkBtnTxt}>{t('common.viewAll')}</Text>
            <Ionicons name="arrow-forward" size={12} color={T.purpleLight} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: T.muted2, fontFamily: 'Inter_500Medium', fontSize: 12, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  mid: { flex: 1, minWidth: 0 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 12, color: T.text },
  desc: { fontSize: 10, color: T.muted2, marginTop: 2 },
  min: { width: 24, fontSize: 10, color: T.muted2, textAlign: 'right' },
  pts: { fontFamily: 'Inter_800ExtraBold', fontSize: 11, color: T.green, minWidth: 44, textAlign: 'right' },
  ptsNeg: { color: '#e5382b' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, paddingVertical: 8 },
});
