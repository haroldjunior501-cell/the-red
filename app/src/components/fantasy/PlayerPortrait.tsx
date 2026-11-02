import { Image } from 'expo-image';
import React, { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ARENA_THEME as T } from '../../constants/arenaTheme';

export type PlayerPortraitProps = {
  photo: string;
  size?: number;
  glowColor?: string;
  flag?: string;
  isCaptain?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const PlayerPortrait = memo(function PlayerPortrait({
  photo,
  size = 56,
  glowColor = T.purple,
  flag,
  isCaptain = false,
  style,
}: PlayerPortraitProps) {
  const ring = size + 8;
  return (
    <View style={[styles.wrap, { width: ring, height: ring + (flag ? 14 : 0) }, style]}>
      <View
        style={[
          styles.ring,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            shadowColor: glowColor,
          },
        ]}
      >
        <Image
          source={{ uri: photo }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          contentFit="cover"
          contentPosition="top"
          transition={200}
          cachePolicy="memory-disk"
        />
        {isCaptain ? (
          <View style={styles.cap}>
            <Text style={styles.capTxt}>C</Text>
          </View>
        ) : null}
      </View>
      {flag ? <Text style={styles.flag}>{flag}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cap: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: T.gold,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capTxt: { fontSize: 10, fontFamily: 'Inter_900Black', color: '#000' },
  flag: { fontSize: 16, marginTop: 4 },
});
