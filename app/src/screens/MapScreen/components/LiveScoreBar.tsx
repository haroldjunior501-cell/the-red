import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { liveScoreBarStyles as s } from './LiveScoreBar.styles';

export type LiveScoreBarProps = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minuteLabel: string;
  isLive: boolean;
};

export const LiveScoreBar = memo(function LiveScoreBar({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  minuteLabel,
  isLive,
}: LiveScoreBarProps) {
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Text style={s.team} numberOfLines={1}>
          {homeTeam}
        </Text>
        <Text style={s.score}>
          {homeScore} — {awayScore}
        </Text>
        <Text style={s.team} numberOfLines={1}>
          {awayTeam}
        </Text>
      </View>
      {isLive ? (
        <View style={s.livePill}>
          <Text style={s.liveText}>LIVE {minuteLabel}</Text>
        </View>
      ) : null}
    </View>
  );
});
