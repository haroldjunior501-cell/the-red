import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { TeamCrest } from './TeamCrest';
import type { LiveMatch, MatchEngagement } from '../../../types/live.types';
import { formatViewers } from '../../../utils/liveMatchUtils';
import { COLORS } from '../../../constants/colors';
import { cardGlow } from '../../../constants/lighting';
import { DS } from '../LiveScreen.styles';

export type FeaturedMatchProps = {
  match: LiveMatch;
  engagement: MatchEngagement;
  onPress: () => void;
};

function statusLabel(status: LiveMatch['status']): string {
  switch (status) {
    case 'halftime':
      return 'MI-TEMPS';
    case 'finished':
      return 'FIN';
    case 'extra_time':
      return 'PROL.';
    case 'penalties':
      return 'TIRS AU BUT';
    default:
      return 'LIVE';
  }
}

export const FeaturedMatch = memo(function FeaturedMatch({ match, engagement, onPress }: FeaturedMatchProps) {
  const live = match.status === 'live' || match.status === 'extra_time' || match.status === 'penalties';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.badgeRow}>
        <Text style={styles.focus}>WORLD FOCUS</Text>
        {live ? (
          <View style={styles.livePill}>
            <View style={styles.dot} />
            <Text style={styles.liveTxt}>{match.minute ? `${match.minute}'` : 'LIVE'}</Text>
          </View>
        ) : (
          <Text style={styles.statusOff}>{statusLabel(match.status)}</Text>
        )}
      </View>

      <View style={styles.teams}>
        <View style={styles.teamCol}>
          <TeamCrest countryCode={match.home_country_code} logoUrl={match.home_logo_url} size={36} />
          <Text style={styles.teamName} numberOfLines={1}>
            {match.home_name}
          </Text>
        </View>
        <Text style={styles.score}>
          {match.home_score} - {match.away_score}
        </Text>
        <View style={styles.teamCol}>
          <TeamCrest countryCode={match.away_country_code} logoUrl={match.away_logo_url} size={36} />
          <Text style={styles.teamName} numberOfLines={1}>
            {match.away_name}
          </Text>
        </View>
      </View>

      <Text style={styles.round} numberOfLines={1}>
        {match.round || match.group}
      </Text>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>👁 {formatViewers(engagement.viewerCount)}</Text>
        <Text style={styles.stat}>💬 {engagement.messageCount}</Text>
        <Text style={styles.stat}>🔥 Chaos {engagement.chaosLevel}%</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    marginBottom: 12,
    ...cardGlow,
  },
  pressed: { opacity: 0.92 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  focus: { color: DS.gold, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: DS.red },
  liveTxt: { color: DS.red, fontWeight: '800', fontSize: 12 },
  statusOff: { color: DS.muted, fontWeight: '700', fontSize: 12 },
  teams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamCol: { flex: 1, alignItems: 'center', gap: 4 },
  flag: { fontSize: 28 },
  teamName: { color: COLORS.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  score: {
    fontFamily: DS.bebas,
    fontSize: 52,
    color: COLORS.text,
    letterSpacing: 2,
    minWidth: 120,
    textAlign: 'center',
  },
  round: { color: DS.muted, fontSize: 11, textAlign: 'center', marginTop: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: DS.border },
  stat: { color: DS.muted, fontSize: 11, fontWeight: '600' },
});
