import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TeamCrest } from './TeamCrest';
import type { LiveMatch, MatchEngagement } from '../../../types/live.types';
import { formatViewers, isHotMatch, scorersLabel } from '../../../utils/liveMatchUtils';
import { useGoalFlashDetector } from '../../../hooks/useLiveMatches';
import { DS } from '../LiveScreen.styles';

export type MatchItemProps = {
  match: LiveMatch;
  engagement?: MatchEngagement;
  onPress: () => void;
};

function minuteLabel(match: LiveMatch): { text: string; color: string } {
  if (match.status === 'upcoming') {
    return { text: 'À VENIR', color: DS.muted };
  }
  switch (match.status) {
    case 'halftime':
      return { text: 'MI-TEMPS', color: '#FF9F43' };
    case 'finished':
      return { text: 'FIN', color: DS.muted };
    case 'extra_time':
      return { text: 'PROL.', color: '#A855F7' };
    case 'penalties':
      return { text: 'TIRS AU BUT', color: DS.red };
    default:
      return { text: match.minute ? `${match.minute}'` : 'LIVE', color: DS.red };
  }
}

export const MatchItem = memo(function MatchItem({ match, engagement, onPress }: MatchItemProps) {
  const hot = isHotMatch(match, engagement);
  const flash = useGoalFlashDetector(match);
  const glow = useRef(new Animated.Value(0)).current;
  const prevGoals = useRef(match.home_score + match.away_score);

  useEffect(() => {
    const total = match.home_score + match.away_score;
    if (total > prevGoals.current) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      glow.setValue(1);
      Animated.timing(glow, { toValue: 0, duration: 1500, useNativeDriver: false }).start();
    }
    prevGoals.current = total;
  }, [glow, match.away_score, match.home_score]);

  const scoreColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', DS.green],
  });

  const min = minuteLabel(match);
  const scorers = scorersLabel(match);
  const viewers = engagement?.viewerCount ?? 0;

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.row, flash && styles.flash, hot && styles.hotBorder]}>
        <View style={styles.left}>
          <View style={[styles.indicator, hot ? styles.indicatorHot : styles.indicatorIdle]} />
          <View>
            <Text style={styles.group} numberOfLines={1}>
              {match.group}
            </Text>
            <Text style={[styles.minute, { color: min.color }]}>{min.text}</Text>
          </View>
        </View>

        <View style={styles.mid}>
          <View style={styles.teamLine}>
            <TeamCrest countryCode={match.home_country_code} logoUrl={match.home_logo_url} size={20} />
            <Text style={styles.name} numberOfLines={1}>
              {match.home_name}
            </Text>
          </View>
          <View style={styles.teamLine}>
            <TeamCrest countryCode={match.away_country_code} logoUrl={match.away_logo_url} size={20} />
            <Text style={styles.name} numberOfLines={1}>
              {match.away_name}
            </Text>
          </View>
        </View>

        <Animated.Text style={[styles.score, { color: scoreColor }]}>
          {match.home_score}-{match.away_score}
        </Animated.Text>

        <View style={styles.meta}>
          {scorers ? (
            <Text style={styles.scorers} numberOfLines={2}>
              {scorers}
            </Text>
          ) : null}
          <Text style={styles.viewers}>👁 {formatViewers(viewers)}</Text>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={20} color={DS.muted} />
      </Animated.View>
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
    gap: 6,
  },
  flash: { backgroundColor: 'rgba(41, 121, 255, 0.08)', borderColor: 'rgba(41, 121, 255, 0.16)' },
  hotBorder: { borderColor: 'rgba(255,59,59,0.35)' },
  left: { width: 56, flexDirection: 'row', alignItems: 'center', gap: 6 },
  indicator: { width: 4, height: 36, borderRadius: 2 },
  indicatorHot: { backgroundColor: DS.red },
  indicatorIdle: { backgroundColor: 'rgba(255,255,255,0.15)' },
  group: { color: DS.muted, fontSize: 9, fontWeight: '700', maxWidth: 44 },
  minute: { fontSize: 11, fontWeight: '800' },
  mid: { flex: 1, gap: 4 },
  teamLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: { fontSize: 14 },
  name: { color: '#fff', fontSize: 12, fontWeight: '600', flex: 1 },
  score: { fontFamily: DS.bebas, fontSize: 22, width: 48, textAlign: 'center' },
  meta: { width: 72, alignItems: 'flex-end' },
  scorers: { color: DS.green, fontSize: 9, textAlign: 'right' },
  viewers: { color: DS.muted, fontSize: 10, marginTop: 2 },
});
