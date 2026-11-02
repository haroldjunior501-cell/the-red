import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { flagEmoji } from '../../../constants/mapHub';
import { cardGlow } from '../../../constants/lighting';
import type { LiveGroupStandings, Standing } from '../../../types/live.types';
import { DS } from '../LiveScreen.styles';

export type AllGroupsPanelProps = {
  groups: LiveGroupStandings[];
  loading: boolean;
  error: string | null;
};

function GroupCard({ group }: { group: LiveGroupStandings }) {
  const rows: Standing[] =
    group.teams.length > 0
      ? group.teams
      : [];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{group.name.toUpperCase()}</Text>
      {rows.length === 0 ? (
        <Text style={styles.placeholder}>Points à 0 — mis à jour après chaque match</Text>
      ) : (
        rows.map((row) => {
          const leader = row.position === 1;
          return (
            <View key={`${group.id}-${row.country_code}-${row.position}`} style={[styles.row, leader && styles.leader]}>
              <Text style={styles.pos}>{row.position}</Text>
              <Text style={styles.flag}>{flagEmoji(row.country_code, row.team_name)}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {row.team_name}
              </Text>
              <Text style={styles.pts}>{row.points}</Text>
              <Text style={styles.diff}>
                {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

export const AllGroupsPanel = memo(function AllGroupsPanel({ groups, loading, error }: AllGroupsPanelProps) {
  if (loading && !groups.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={DS.green} />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <Text style={styles.heading}>CLASSEMENT · PHASE DE GROUPES</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {groups.map((g) => (
        <GroupCard key={g.id} group={g} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  content: { gap: 12 },
  center: { paddingVertical: 40, alignItems: 'center' },
  heading: {
    color: DS.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  error: { color: DS.red, fontSize: 12, marginBottom: 8 },
  card: {
    backgroundColor: DS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DS.border,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    ...cardGlow,
  },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  placeholder: { color: DS.muted, fontSize: 12, paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  leader: { backgroundColor: 'rgba(41, 121, 255, 0.05)' },
  pos: { width: 18, color: DS.muted, fontSize: 11, fontWeight: '800' },
  flag: { fontSize: 14 },
  name: { flex: 1, color: '#fff', fontSize: 11, fontWeight: '600' },
  pts: { width: 24, color: DS.green, fontSize: 12, fontWeight: '800', textAlign: 'right' },
  diff: { width: 28, color: DS.muted, fontSize: 10, textAlign: 'right' },
});
