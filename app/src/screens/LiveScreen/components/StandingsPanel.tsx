import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { flagEmoji } from '../../../constants/mapHub';
import type { Standing } from '../../../types/live.types';
import { cardGlow } from '../../../constants/lighting';
import { DS } from '../LiveScreen.styles';

export type StandingsPanelProps = {
  standings: Standing[];
  loading: boolean;
  groupLetter: string;
  onViewAll?: () => void;
};

export const StandingsPanel = memo(function StandingsPanel({
  standings,
  loading,
  groupLetter,
  onViewAll,
}: StandingsPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>CLASSEMENT LIVE</Text>
      <Text style={styles.sub}>Groupe {groupLetter}</Text>
      {loading ? (
        <ActivityIndicator color={DS.green} style={{ marginVertical: 16 }} />
      ) : standings.length === 0 ? (
        <Text style={styles.empty}>Classement indisponible</Text>
      ) : (
        standings.slice(0, 4).map((row) => {
          const leader = row.position === 1;
          const eliminated = row.position >= 4;
          return (
            <View
              key={`${row.country_code}-${row.position}`}
              style={[styles.row, leader && styles.leader, eliminated && styles.eliminated]}
            >
              <Text style={styles.pos}>{row.position}</Text>
              <Text style={styles.flag}>{flagEmoji(row.country_code, row.team_name)}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {row.team_name}
              </Text>
              <Text style={styles.pts}>{row.points}</Text>
              <Text style={styles.diff}>{row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}</Text>
            </View>
          );
        })
      )}
      <TouchableOpacity onPress={onViewAll} style={styles.link} activeOpacity={0.8}>
        <Text style={styles.linkTxt}>Voir tous les groupes ›</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  panel: {
    backgroundColor: DS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DS.border,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    marginBottom: 12,
    ...cardGlow,
  },
  title: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  sub: { color: DS.muted, fontSize: 10, marginBottom: 10 },
  empty: { color: DS.muted, fontSize: 12, paddingVertical: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  leader: { backgroundColor: 'rgba(41, 121, 255, 0.05)' },
  eliminated: { opacity: 0.45 },
  pos: { width: 18, color: DS.muted, fontSize: 11, fontWeight: '800' },
  flag: { fontSize: 14 },
  name: { flex: 1, color: '#fff', fontSize: 11, fontWeight: '600' },
  pts: { width: 24, color: DS.green, fontSize: 12, fontWeight: '800', textAlign: 'right' },
  diff: { width: 28, color: DS.muted, fontSize: 10, textAlign: 'right' },
  link: { marginTop: 10, alignItems: 'center' },
  linkTxt: { color: DS.green, fontSize: 11, fontWeight: '700' },
});
