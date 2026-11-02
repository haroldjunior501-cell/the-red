import React, { memo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import type { LiveMatch } from '../../../types/live.types';
import { UpcomingMatchItem } from './UpcomingMatchItem';
import { DS } from '../LiveScreen.styles';

export type UpcomingMatchListProps = {
  matches: LiveMatch[];
  loading?: boolean;
  onMatchPress?: (match: LiveMatch) => void;
};

export const UpcomingMatchList = memo(function UpcomingMatchList({
  matches,
  loading,
  onMatchPress,
}: UpcomingMatchListProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>Aucun match en direct pour le moment</Text>
      <Text style={styles.section}>
        {matches.some((m) => m.status === 'finished') ? 'CALENDRIER COUPE DU MONDE' : 'PROCHAINS MATCHS'}
      </Text>
      {loading ? (
        <ActivityIndicator color={DS.green} style={{ marginVertical: 20 }} />
      ) : matches.length === 0 ? (
        <Text style={styles.empty}>Calendrier bientôt disponible</Text>
      ) : (
        matches.map((m) => <UpcomingMatchItem key={m.id} match={m} onPress={onMatchPress ? () => onMatchPress(m) : undefined} />)
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  hint: { color: DS.muted, fontSize: 13, textAlign: 'center', marginBottom: 16 },
  section: {
    color: DS.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  empty: { color: DS.muted, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
});
