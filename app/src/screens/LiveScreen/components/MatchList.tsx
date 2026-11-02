import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import type { LiveMatch, MatchEngagement } from '../../../types/live.types';
import { MatchItem } from './MatchItem';
import { DS } from '../LiveScreen.styles';

export type MatchListProps = {
  matches: LiveMatch[];
  engagementById: Record<string, MatchEngagement>;
  onMatchPress: (match: LiveMatch) => void;
};

export const MatchList = memo(function MatchList({ matches, engagementById, onMatchPress }: MatchListProps) {
  if (!matches.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTxt}>Aucun match en cours pour ce filtre</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>TOUS LES MATCHS EN COURS</Text>
      {matches.map((item) => (
        <MatchItem
          key={item.id}
          match={item}
          engagement={engagementById[item.id]}
          onPress={() => onMatchPress(item)}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  section: {
    color: DS.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyTxt: { color: DS.muted, fontSize: 13 },
});
