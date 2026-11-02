import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { TeamCrest } from './TeamCrest';
import type { LiveMatch, MatchEngagement } from '../../../types/live.types';
import { formatViewers } from '../../../utils/liveMatchUtils';
import { cardGlow } from '../../../constants/lighting';
import { DS } from '../LiveScreen.styles';

export type MostWatchedProps = {
  matches: LiveMatch[];
  engagementById: Record<string, MatchEngagement>;
};

export const MostWatched = memo(function MostWatched({ matches, engagementById }: MostWatchedProps) {
  const top = useMemo(() => {
    return [...matches]
      .sort((a, b) => (engagementById[b.id]?.viewerCount ?? 0) - (engagementById[a.id]?.viewerCount ?? 0))
      .slice(0, 3);
  }, [matches, engagementById]);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>MOST WATCHED</Text>
      {top.length === 0 ? (
        <Text style={styles.empty}>—</Text>
      ) : (
        top.map((m, i) => (
          <View key={m.id} style={styles.row}>
            <Text style={styles.rank}>{i + 1}</Text>
            <View style={styles.flags}>
              <TeamCrest countryCode={m.home_country_code} logoUrl={m.home_logo_url} size={18} />
              <TeamCrest countryCode={m.away_country_code} logoUrl={m.away_logo_url} size={18} />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {m.home_name} vs {m.away_name}
            </Text>
            <Text style={styles.viewers}>{formatViewers(engagementById[m.id]?.viewerCount ?? 0)}</Text>
          </View>
        ))
      )}
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
  title: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 10 },
  empty: { color: DS.muted, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  rank: { width: 16, color: DS.gold, fontWeight: '900', fontSize: 12 },
  flags: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 44 },
  label: { flex: 1, color: '#fff', fontSize: 10, fontWeight: '600' },
  viewers: { color: DS.green, fontSize: 10, fontWeight: '800' },
});
