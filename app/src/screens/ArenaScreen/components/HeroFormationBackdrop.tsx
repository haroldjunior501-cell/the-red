import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { HeroLineupPlayer } from '../../../utils/arenaHeroLineup';

type Props = {
  players: HeroLineupPlayer[];
  width: number;
  height: number;
};

const PHOTO_SIZE = 50;

export const HeroFormationBackdrop = memo(function HeroFormationBackdrop({
  players,
  width,
  height,
}: Props) {
  if (players.length === 0) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <View style={[styles.pitch, { width, height }]}>
        {players.map((p) => {
          const left = (p.x / 100) * width - PHOTO_SIZE / 2;
          const top = (p.y / 100) * height - PHOTO_SIZE / 2;
          return (
            <View
              key={p.slotKey}
              style={[
                styles.slot,
                {
                  left: Math.max(4, Math.min(width - PHOTO_SIZE - 4, left)),
                  top: Math.max(8, Math.min(height - PHOTO_SIZE - 8, top)),
                },
              ]}
            >
              <View style={[styles.ring, p.isCaptain && styles.ringCap]}>
                <Image
                  source={{ uri: p.photo }}
                  style={styles.photo}
                  contentFit="cover"
                  contentPosition="top"
                  cachePolicy="memory-disk"
                />
              </View>
              {p.isCaptain ? <View style={styles.capBadge} /> : null}
            </View>
          );
        })}
      </View>
      <LinearGradient
        colors={[
          'rgba(12, 14, 40, 0.25)',
          'rgba(12, 14, 40, 0.55)',
          'rgba(12, 14, 40, 0.88)',
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.15)', 'transparent', 'rgba(124, 58, 237, 0.1)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  pitch: {
    position: 'relative',
    backgroundColor: 'rgba(0, 80, 40, 0.12)',
    borderRadius: 12,
  },
  slot: {
    position: 'absolute',
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  ringCap: {
    borderColor: '#f0b429',
    borderWidth: 2.5,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  capBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f0b429',
    borderWidth: 1,
    borderColor: '#000',
  },
});
