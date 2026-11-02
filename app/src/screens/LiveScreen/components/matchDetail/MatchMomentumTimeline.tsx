import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { minuteToTimelinePct, type TimelineGoal } from '../../../../utils/livePitchMomentum';

const MARKS = [
  { label: '0', pct: 0 },
  { label: '15', pct: 15.6 },
  { label: '30', pct: 31.2 },
  { label: '45', pct: 47 },
  { label: '+5', pct: 50 },
  { label: '60', pct: 65.6 },
  { label: '75', pct: 81.2 },
  { label: '90', pct: 97 },
] as const;

type Props = {
  homeAbbrev: string;
  awayAbbrev: string;
  goals: TimelineGoal[];
  progressPct: number;
  hidden?: boolean;
};

function GoalIcon({ leftPct }: { leftPct: number }) {
  return (
    <View style={[styles.goalIcon, { left: `${leftPct}%` }]}>
      <MaterialCommunityIcons name="soccer" size={11} color="#fff" />
    </View>
  );
}

export const MatchMomentumTimeline = memo(function MatchMomentumTimeline({
  homeAbbrev,
  awayAbbrev,
  goals,
  progressPct,
  hidden,
}: Props) {
  if (hidden) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.marksRow}>
        {MARKS.map((m) => (
          <Text key={m.label} style={[styles.mark, { left: `${m.pct}%` }]}>
            {m.label}
          </Text>
        ))}
      </View>

      <View style={styles.track}>
        <View style={styles.trackBg} />
        <View style={[styles.trackProgress, { width: `${Math.max(2, progressPct)}%` }]} />
        <View style={[styles.playhead, { left: `${progressPct}%` }]} />
        <View style={styles.htGap} />
      </View>

      <View style={styles.teamRow}>
        <Text style={styles.teamCode}>{homeAbbrev}</Text>
        <View style={styles.teamTrack}>
          {goals
            .filter((g) => g.team === 'home')
            .map((g) => (
              <GoalIcon key={g.id} leftPct={minuteToTimelinePct(g.minute)} />
            ))}
        </View>
      </View>

      <View style={styles.teamRow}>
        <Text style={styles.teamCode}>{awayAbbrev}</Text>
        <View style={styles.teamTrack}>
          {goals
            .filter((g) => g.team === 'away')
            .map((g) => (
              <GoalIcon key={g.id} leftPct={minuteToTimelinePct(g.minute)} />
            ))}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#0a1018',
  },
  marksRow: {
    height: 16,
    position: 'relative',
    marginBottom: 6,
  },
  mark: {
    position: 'absolute',
    marginLeft: -8,
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    width: 20,
    textAlign: 'center',
  },
  track: {
    height: 4,
    position: 'relative',
    marginBottom: 10,
  },
  trackBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
  },
  trackProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#e5383b',
    borderRadius: 2,
  },
  playhead: {
    position: 'absolute',
    top: -3,
    width: 10,
    height: 10,
    marginLeft: -5,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5383b',
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  htGap: {
    position: 'absolute',
    left: '47%',
    width: '3%',
    top: 0,
    bottom: 0,
    backgroundColor: '#0a1018',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  teamCode: {
    width: 32,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
  },
  teamTrack: {
    flex: 1,
    height: 16,
    position: 'relative',
  },
  goalIcon: {
    position: 'absolute',
    top: 0,
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
