import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TeamCrest } from './TeamCrest';
import type { LiveMatch } from '../../../types/live.types';
import { DS } from '../LiveScreen.styles';

export type UpcomingMatchItemProps = {
  match: LiveMatch;
  onPress?: () => void;
};

export const UpcomingMatchItem = memo(function UpcomingMatchItem({ match, onPress }: UpcomingMatchItemProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.indicator} />
          <View>
            <Text style={styles.group} numberOfLines={1}>
              {match.group}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>
                {match.status === 'finished' ? 'TERMINÉ' : match.status === 'live' ? 'LIVE' : 'À VENIR'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.mid}>
          <View style={styles.teamLine}>
            <TeamCrest countryCode={match.home_country_code} logoUrl={match.home_logo_url} size={22} />
            <Text style={styles.name} numberOfLines={1}>
              {match.home_name}
            </Text>
          </View>
          <Text style={styles.kickoff}>{match.kickoff_label ?? '—'}</Text>
          <View style={styles.teamLine}>
            <TeamCrest countryCode={match.away_country_code} logoUrl={match.away_logo_url} size={22} />
            <Text style={styles.name} numberOfLines={1}>
              {match.away_name}
            </Text>
          </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={20} color={DS.muted} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DS.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    gap: 8,
  },
  left: { width: 72, flexDirection: 'row', alignItems: 'center', gap: 6 },
  indicator: { width: 4, height: 48, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)' },
  group: { color: DS.muted, fontSize: 9, fontWeight: '700', maxWidth: 56 },
  badge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badgeTxt: { color: 'rgba(255,255,255,0.45)', fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  mid: { flex: 1, gap: 4 },
  teamLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: { fontSize: 14 },
  name: { color: '#fff', fontSize: 12, fontWeight: '600', flex: 1 },
  kickoff: {
    color: DS.green,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 2,
  },
});
