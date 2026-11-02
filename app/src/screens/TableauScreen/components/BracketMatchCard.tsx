import React, { memo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { flagEmoji } from '../../../constants/mapHub';
import { TABLEAU } from '../../../constants/tableauTheme';
import type { BracketTeam } from '../../../utils/bracketState';
import type { DisplayBracketMatch } from '../../../utils/bracketState';
import { formatKickoffLabel } from '../../../utils/liveMatchUtils';
import { BRACKET_CARD_WIDTH } from '../../../utils/bracketLayout';

type Props = {
  match: DisplayBracketMatch;
  winnerCode?: string;
  width?: number;
  onPickTeam: (team: BracketTeam) => void;
};

function TeamPressable({
  team,
  selected,
  disabled,
  onPress,
}: {
  team: BracketTeam | null;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  };

  if (!team) {
    return (
      <View style={[styles.teamRow, styles.teamTbd]}>
        <Text style={styles.tbdText}>À déterminer</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      style={({ pressed }) => [pressed && !disabled && styles.teamPressed]}
    >
      <Animated.View style={[styles.teamRow, selected && styles.teamWinner, { transform: [{ scale }] }]}>
        <Text style={styles.flag}>{flagEmoji(team.code)}</Text>
        <Text style={[styles.teamName, selected && styles.teamNameWin]} numberOfLines={1}>
          {team.name}
        </Text>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </Animated.View>
    </Pressable>
  );
}

export const BracketMatchCard = memo(function BracketMatchCard({
  match,
  winnerCode,
  width = BRACKET_CARD_WIDTH,
  onPickTeam,
}: Props) {
  if (!match.fixtureId) {
    return (
      <View style={[styles.card, { width }]}>
        <TeamPressable team={null} selected={false} disabled onPress={() => undefined} />
        <View style={styles.sep} />
        <TeamPressable team={null} selected={false} disabled onPress={() => undefined} />
      </View>
    );
  }

  const t1Win = winnerCode === match.team1?.code;
  const t2Win = winnerCode === match.team2?.code;
  const canPick = Boolean(match.team1 && match.team2);

  return (
    <View style={[styles.card, { width }]}>
      <TeamPressable
        team={match.team1}
        selected={t1Win}
        disabled={!canPick || !match.team1}
        onPress={() => match.team1 && onPickTeam(match.team1)}
      />
      <View style={styles.sep} />
      <TeamPressable
        team={match.team2}
        selected={t2Win}
        disabled={!canPick || !match.team2}
        onPress={() => match.team2 && onPickTeam(match.team2)}
      />
      {match.kickoffMs > 0 ? (
        <View style={styles.dateRow}>
          <Text style={styles.date}>{formatKickoffLabel(match.kickoffMs)}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0a1020',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    minHeight: 44,
  },
  teamWinner: {
    backgroundColor: 'rgba(41, 121, 255, 0.18)',
    borderLeftWidth: 3,
    borderLeftColor: '#2979ff',
  },
  teamTbd: { justifyContent: 'center', opacity: 0.55 },
  teamPressed: { opacity: 0.92 },
  flag: { fontSize: 18 },
  teamName: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#7a96bb',
  },
  teamNameWin: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: TABLEAU.text,
  },
  check: { color: '#00e676', fontFamily: 'Inter_800ExtraBold', fontSize: 14 },
  tbdText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#334466',
    fontStyle: 'italic',
  },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dateRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  date: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: TABLEAU.link },
});
