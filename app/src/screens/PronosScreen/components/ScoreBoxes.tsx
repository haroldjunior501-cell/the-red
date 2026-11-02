import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';

export type ScoreBoxesProps = {
  homeScore: number | null;
  awayScore: number | null;
  activeSide: 'home' | 'away' | null;
  locked: boolean;
  onHomePress: () => void;
  onAwayPress: () => void;
};

function displayScore(v: number | null): string {
  if (v === null) return '—';
  return String(v);
}

export const ScoreBoxes = memo(function ScoreBoxes({
  homeScore,
  awayScore,
  activeSide,
  locked,
  onHomePress,
  onAwayPress,
}: ScoreBoxesProps) {
  const homeFilled = homeScore !== null;
  const awayFilled = awayScore !== null;

  return (
    <View style={styles.row}>
      <Pressable
        disabled={locked}
        onPress={onHomePress}
        style={[
          styles.box,
          homeFilled && !activeSide && styles.boxFilled,
          activeSide === 'home' && styles.boxActive,
        ]}
      >
        <Text
          style={[
            styles.score,
            homeFilled && styles.scoreFilled,
            activeSide === 'home' && styles.scoreActive,
          ]}
        >
          {displayScore(homeScore)}
        </Text>
      </Pressable>
      <Text style={styles.sep}>—</Text>
      <Pressable
        disabled={locked}
        onPress={onAwayPress}
        style={[
          styles.box,
          awayFilled && !activeSide && styles.boxFilled,
          activeSide === 'away' && styles.boxActiveAway,
        ]}
      >
        <Text
          style={[
            styles.score,
            awayFilled && styles.scoreFilled,
            activeSide === 'away' && styles.scoreActiveAway,
          ]}
        >
          {displayScore(awayScore)}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  box: {
    width: 56,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    backgroundColor: C.blueFillSoft,
    borderColor: C.blueBorder,
  },
  boxActive: {
    backgroundColor: C.blueFill,
    borderColor: C.blue,
    shadowColor: C.blue,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  boxActiveAway: {
    backgroundColor: C.orangeFill,
    borderColor: C.orangeBorder,
    shadowColor: C.orange,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  score: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    color: C.muted,
    lineHeight: 38,
  },
  scoreFilled: { color: C.text },
  scoreActive: { color: C.text },
  scoreActiveAway: { color: C.text },
  sep: { fontFamily: 'BebasNeue_400Regular', fontSize: 24, color: C.muted },
});
