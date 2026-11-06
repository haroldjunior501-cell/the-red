import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { PITCH_ROWS, POSITION_LABEL } from '../../../constants/fantasyPitch';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';
import type { FantasySlotKey, FantasyPitchPlayer } from '../../../types/fantasy.types';
import { PlayerSlot } from './PlayerSlot';

const EMPTY_LABEL: Record<string, string> = {
  ATT: 'Choisir ATT',
  MID: 'Choisir MIL',
  DEF: 'Choisir DEF',
  GK: 'Choisir GK',
};

export type PitchViewProps = {
  slots: Record<FantasySlotKey, FantasyPitchPlayer | null>;
  captainSlot: FantasySlotKey | null;
  captainPickMode?: boolean;
  onSlotPress: (slotKey: FantasySlotKey) => void;
  onSlotLongPress: (slotKey: FantasySlotKey) => void;
};

export const PitchView = memo(function PitchView({
  slots,
  captainSlot,
  captainPickMode = false,
  onSlotPress,
  onSlotLongPress,
}: PitchViewProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pitchFrame}>
        <View style={styles.grass}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={i}
              style={[styles.stripe, { backgroundColor: i % 2 === 0 ? T.pitchLight : T.pitchDark }]}
            />
          ))}
        </View>

        <Svg
          style={StyleSheet.absoluteFill}
          viewBox="0 0 370 480"
          preserveAspectRatio="xMidYMid slice"
          pointerEvents="none"
        >
          <Rect x={8} y={8} width={354} height={464} rx={8} stroke={T.pitchLine} strokeWidth={1.2} fill="none" />
          <Line x1={8} y1={240} x2={362} y2={240} stroke={T.pitchLine} strokeWidth={1.2} />
          <Circle cx={185} cy={240} r={50} stroke={T.pitchLine} strokeWidth={1.2} fill="none" />
          <Circle cx={185} cy={240} r={2.5} fill="rgba(255,255,255,0.5)" />
          <Rect x={90} y={8} width={190} height={76} stroke={T.pitchLine} strokeWidth={1.2} fill="none" />
          <Rect x={130} y={8} width={110} height={30} stroke={T.pitchLine} strokeWidth={1.2} fill="none" />
          <Path d="M 118 84 A 48 48 0 0 1 252 84" stroke={T.pitchLine} strokeWidth={1.2} fill="none" />
          <Rect x={90} y={396} width={190} height={76} stroke={T.pitchLine} strokeWidth={1.2} fill="none" />
          <Rect x={130} y={434} width={110} height={30} stroke={T.pitchLine} strokeWidth={1.2} fill="none" />
          <Path d="M 118 396 A 48 48 0 0 0 252 396" stroke={T.pitchLine} strokeWidth={1.2} fill="none" />
        </Svg>

        <LinearGradient
          colors={['rgba(218,41,28,0.18)', 'transparent', 'rgba(5,2,3,0.55)']}
          style={styles.pitchVignette}
          pointerEvents="none"
        />

        <View style={styles.inner} pointerEvents="box-none">
          {PITCH_ROWS.map((row) => (
            <View key={row.position} style={styles.playerRow} pointerEvents="box-none">
              {row.slots.map((slotKey) => (
                <PlayerSlot
                  key={slotKey}
                  player={slots[slotKey]}
                  positionLabel={POSITION_LABEL[row.position]}
                  emptyLabel={EMPTY_LABEL[row.position]}
                  isCaptain={captainSlot === slotKey}
                  captainPickMode={captainPickMode}
                  onPress={() => onSlotPress(slotKey)}
                  onLongPress={() => onSlotLongPress(slotKey)}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});

const PITCH_H = 480;

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 10,
    marginTop: 8,
    borderRadius: 18,
    overflow: 'hidden',
    height: PITCH_H,
    backgroundColor: T.bgDeep,
    borderWidth: 1,
    borderColor: 'rgba(218, 41, 28, 0.28)',
    shadowColor: T.glowRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  pitchFrame: {
    height: PITCH_H,
    borderRadius: 18,
    overflow: 'hidden',
  },
  grass: { ...StyleSheet.absoluteFillObject, flexDirection: 'column' },
  stripe: { flex: 1 },
  pitchVignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  inner: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 4,
    paddingTop: 18,
    paddingBottom: 14,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    width: '100%',
  },
});
