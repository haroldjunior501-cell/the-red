import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { LiveMatch } from '../../../../types/live.types';
import { DS } from '../../LiveScreen.styles';

type Props = {
  match: LiveMatch;
  statsOpen: boolean;
  onToggleStats: () => void;
};

function statusLabel(match: LiveMatch): string {
  if (match.status === 'upcoming') return match.kickoff_label ?? 'À venir';
  if (match.status === 'halftime') return 'Mi-temps';
  if (match.status === 'finished') return 'Terminé';
  if (match.minute) {
    const m = match.minute.replace("'", '').trim();
    const n = Number(m);
    if (n > 45) return `${match.minute} · 2ème mi-temps`;
    if (n > 0) return `${match.minute} · 1ère mi-temps`;
    return match.minute;
  }
  return 'En direct';
}

export const LiveMatchBanner = memo(function LiveMatchBanner({ match, statsOpen, onToggleStats }: Props) {
  const isLive = match.status === 'live' || match.status === 'halftime';
  const isUpcoming = match.status === 'upcoming';

  return (
    <View style={styles.wrap}>
      <View style={styles.scoreRow}>
        <View style={styles.namesCol}>
          <Text style={styles.teamName} numberOfLines={2}>
            {match.home_name}
          </Text>
          <Text style={styles.teamName} numberOfLines={2}>
            {match.away_name}
          </Text>
        </View>

        <View style={styles.scoreCol}>
          <View style={styles.scoreBoxes}>
            <View style={[styles.scoreBox, styles.scoreHome]}>
              <Text style={styles.scoreDigit}>{isUpcoming ? '–' : match.home_score}</Text>
            </View>
            <View style={[styles.scoreBox, styles.scoreAway]}>
              <Text style={styles.scoreDigit}>{isUpcoming ? '–' : match.away_score}</Text>
            </View>
          </View>
          <Text style={[styles.status, isLive && styles.statusLive]}>{statusLabel(match)}</Text>
        </View>
      </View>

      <Pressable style={styles.statsBar} onPress={onToggleStats}>
        <MaterialCommunityIcons name="television-play" size={18} color="#fff" />
        <Text style={styles.statsBarTxt}>Statistiques en direct</Text>
        <MaterialCommunityIcons
          name={statsOpen ? 'chevron-up' : 'chevron-down'}
          size={22}
          color="rgba(255,255,255,0.6)"
        />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#0c1424',
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 12,
  },
  namesCol: { flex: 1, gap: 10 },
  teamName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#e8eef8',
    lineHeight: 18,
  },
  scoreCol: { alignItems: 'flex-end' },
  scoreBoxes: { flexDirection: 'row', gap: 6 },
  scoreBox: {
    minWidth: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  scoreHome: { backgroundColor: 'rgba(51,133,255,0.35)', borderWidth: 1, borderColor: 'rgba(51,133,255,0.5)' },
  scoreAway: { backgroundColor: 'rgba(229,56,43,0.35)', borderWidth: 1, borderColor: 'rgba(229,56,43,0.5)' },
  scoreDigit: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    color: '#fff',
    letterSpacing: 1,
  },
  status: {
    marginTop: 6,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: DS.muted,
  },
  statusLive: { color: '#ff8c42' },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statsBarTxt: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
});
