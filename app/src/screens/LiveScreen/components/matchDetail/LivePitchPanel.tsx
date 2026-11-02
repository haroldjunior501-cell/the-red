import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Polygon,
  Polyline,
  Rect,
  Stop,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { LiveMatch } from '../../../../types/live.types';
import type { PremiumMatchEvent } from '../../../../types/liveMatchEvent';
import type { ParsedLiveMatchStats } from '../../../../utils/liveMatchStatsParse';
import { buildLivePitchMomentum } from '../../../../utils/livePitchMomentum';
import { MatchMomentumTimeline } from './MatchMomentumTimeline';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  match: LiveMatch;
  stats: ParsedLiveMatchStats | null;
  events?: PremiumMatchEvent[];
};

const VB_W = 100;
const VB_H = 65;

function PitchSvgMarkings() {
  const line = 'rgba(255,255,255,0.28)';
  return (
    <>
      <Rect x={1} y={1} width={VB_W - 2} height={VB_H - 2} fill="none" stroke={line} strokeWidth={0.6} />
      <Line x1={VB_W / 2} y1={0} x2={VB_W / 2} y2={VB_H} stroke={line} strokeWidth={0.5} />
      <Circle cx={VB_W / 2} cy={VB_H / 2} r={9} fill="none" stroke={line} strokeWidth={0.5} />
      <Circle cx={VB_W / 2} cy={VB_H / 2} r={0.8} fill={line} />
      <Rect x={0} y={VB_H * 0.2} width={VB_W * 0.16} height={VB_H * 0.6} fill="none" stroke={line} strokeWidth={0.5} />
      <Rect x={VB_W * 0.84} y={VB_H * 0.2} width={VB_W * 0.16} height={VB_H * 0.6} fill="none" stroke={line} strokeWidth={0.5} />
      <Rect x={0} y={VB_H * 0.32} width={VB_W * 0.06} height={VB_H * 0.36} fill="none" stroke={line} strokeWidth={0.4} />
      <Rect x={VB_W * 0.94} y={VB_H * 0.32} width={VB_W * 0.06} height={VB_H * 0.36} fill="none" stroke={line} strokeWidth={0.4} />
    </>
  );
}

function GrassBackground() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <Rect
          key={i}
          x={0}
          y={i * (VB_H / 10)}
          width={VB_W}
          height={VB_H / 10}
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.025)'}
        />
      ))}
    </>
  );
}

function CornerGlow({ x, y }: { x: number; y: number }) {
  return <Circle cx={x} cy={y} r={4} fill="rgba(255,255,255,0.12)" />;
}

export const LivePitchPanel = memo(function LivePitchPanel({ match, stats, events = [] }: Props) {
  const state = useMemo(
    () => buildLivePitchMomentum(match, stats, events),
    [match, stats, events]
  );

  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const ballX = useSharedValue(state.ball.x * VB_W);
  const ballY = useSharedValue(state.ball.y * VB_H);

  const [trailPoints, setTrailPoints] = useState('');

  useEffect(() => {
    const nx = state.ball.x * VB_W;
    const ny = state.ball.y * VB_H;
    trailRef.current = [...trailRef.current, { x: nx, y: ny }].slice(-6);
    const pts = trailRef.current;
    setTrailPoints(pts.length >= 2 ? pts.map((p) => `${p.x},${p.y}`).join(' ') : '');
    ballX.value = withTiming(nx, { duration: 1200, easing: Easing.out(Easing.cubic) });
    ballY.value = withTiming(ny, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [state.ball.x, state.ball.y, ballX, ballY]);

  const animatedBallProps = useAnimatedProps(() => ({
    cx: ballX.value,
    cy: ballY.value,
  }));

  return (
    <View style={styles.wrap}>
      <MatchMomentumTimeline
        homeAbbrev={state.homeAbbrev}
        awayAbbrev={state.awayAbbrev}
        goals={state.timelineGoals}
        progressPct={state.progressPct}
        hidden={state.isUpcoming}
      />

      <View style={styles.pitchFrame}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3d8f5a" />
              <Stop offset="1" stopColor="#1e6b42" />
            </LinearGradient>
            <LinearGradient id="attackGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="rgba(0,0,0,0)" />
              <Stop offset="0.45" stopColor="rgba(0,0,0,0.08)" />
              <Stop offset="1" stopColor="rgba(12,18,28,0.72)" />
            </LinearGradient>
            <LinearGradient id="attackGradAway" x1="1" y1="0" x2="0" y2="0">
              <Stop offset="0" stopColor="rgba(0,0,0,0)" />
              <Stop offset="0.45" stopColor="rgba(0,0,0,0.08)" />
              <Stop offset="1" stopColor="rgba(12,18,28,0.72)" />
            </LinearGradient>
          </Defs>

          <Rect width={VB_W} height={VB_H} fill="url(#grass)" rx={2} />
          <GrassBackground />
          <PitchSvgMarkings />

          <CornerGlow x={2} y={2} />
          <CornerGlow x={VB_W - 2} y={2} />
          <CornerGlow x={2} y={VB_H - 2} />
          <CornerGlow x={VB_W - 2} y={VB_H - 2} />

          {!state.isUpcoming ? (
            <Polygon
              points={state.attackWedgePoints}
              fill={
                state.attackingTeam === 'home' ? 'url(#attackGrad)' : 'url(#attackGradAway)'
              }
            />
          ) : null}

          {trailPoints ? (
            <Polyline
              points={trailPoints}
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={0.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {!state.isUpcoming ? (
            <>
              <AnimatedCircle
                animatedProps={animatedBallProps}
                r={2.2}
                fill="#fff"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={0.3}
              />
              <AnimatedCircle animatedProps={animatedBallProps} r={4} fill="rgba(255,255,255,0.12)" />
            </>
          ) : (
            <Circle cx={VB_W / 2} cy={VB_H / 2} r={2.5} fill="#fff" opacity={0.9} />
          )}
        </Svg>

        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.timerPill}>
            <Text style={styles.timerTxt}>{state.timerLabel}</Text>
          </View>

          {state.isUpcoming ? (
            <View style={styles.centerLabel}>
              <Text style={styles.upcomingTitle}>Match à venir</Text>
              <Text style={styles.upcomingSub} numberOfLines={2}>
                {match.home_name} — {match.away_name}
              </Text>
            </View>
          ) : (
            <View style={styles.centerLabel}>
              <View style={styles.attackRow}>
                <View
                  style={[
                    styles.attackBar,
                    { backgroundColor: state.attackingTeam === 'home' ? state.homeColor : state.awayColor },
                  ]}
                />
                <View>
                  <Text style={styles.attackTeam} numberOfLines={2}>
                    {state.attackTeamName}
                  </Text>
                  <Text style={styles.attackSub}>En attaque</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#0a1018',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  pitchFrame: {
    width: '100%',
    alignSelf: 'stretch',
    aspectRatio: 105 / 68,
    overflow: 'hidden',
    backgroundColor: '#1a5c38',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  timerPill: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timerTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#fff',
  },
  centerLabel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  attackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    maxWidth: '92%',
  },
  attackBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  attackTeam: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    color: '#fff',
    maxWidth: 220,
  },
  attackSub: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  upcomingTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  upcomingSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginTop: 4,
  },
});
