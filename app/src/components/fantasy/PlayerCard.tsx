import { Image } from 'expo-image';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { FANTASY_THEME as T } from '../../constants/fantasyTheme';

export type PlayerCardProps = {
  name: string;
  pts: number;
  photo: string;
  positionLabel?: string;
  size?: 'pitch' | 'bench' | 'list';
  active?: boolean;
  isCaptain?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const SIZES = {
  pitch: { w: 68, h: 96, photoH: 58, nameSize: 9, ptsSize: 9 },
  bench: { w: 56, h: 82, photoH: 48, nameSize: 8, ptsSize: 8 },
  list: { w: 48, h: 72, photoH: 42, nameSize: 8, ptsSize: 8 },
} as const;

export const PlayerCard = memo(function PlayerCard({
  name,
  pts,
  photo,
  positionLabel,
  size = 'pitch',
  active = true,
  isCaptain = false,
  onPress,
  onLongPress,
  style,
}: PlayerCardProps) {
  const dim = SIZES[size];

  const card = (
    <View
      style={[
        styles.card,
        { width: dim.w, height: dim.h },
        isCaptain && styles.cardCaptain,
        style,
      ]}
    >
      {active ? <View style={styles.liveDot} /> : null}
      {isCaptain ? (
        <View style={styles.captain}>
          <Text style={styles.captainTxt}>C</Text>
        </View>
      ) : null}
      <View style={[styles.photoWrap, { height: dim.photoH }]}>
        <Image
          source={{ uri: photo }}
          style={styles.photo}
          contentFit="cover"
          contentPosition="top"
          transition={200}
          cachePolicy="memory-disk"
        />
        <View style={styles.photoFade} />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.name, { fontSize: dim.nameSize }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.pts, { fontSize: dim.ptsSize }]}>{pts} pts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.wrap}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={400}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          {card}
        </Pressable>
      ) : (
        card
      )}
      {positionLabel ? <Text style={styles.pos}>{positionLabel}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 10, 12, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(218, 41, 28, 0.4)',
    shadowColor: T.glowRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cardCaptain: {
    borderWidth: 2,
    borderColor: T.gold,
    shadowColor: T.gold,
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  pressed: { transform: [{ scale: 0.96 }], opacity: 0.92 },
  liveDot: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.green,
    zIndex: 3,
    shadowColor: T.green,
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
  captain: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: T.gold,
    borderWidth: 1,
    borderColor: '#1a1200',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captainTxt: { fontSize: 9, fontFamily: 'Inter_900Black', color: '#1a1200' },
  photoWrap: {
    width: '100%',
    backgroundColor: '#1a080a',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  photoFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(218, 41, 28, 0.25)',
  },
  footer: {
    flex: 1,
    backgroundColor: T.blue,
    paddingHorizontal: 6,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 34,
  },
  name: {
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    textAlign: 'center',
    maxWidth: '100%',
  },
  pts: {
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.88)',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  pos: {
    fontSize: 8,
    color: T.muted2,
    letterSpacing: 1.4,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
  },
});
