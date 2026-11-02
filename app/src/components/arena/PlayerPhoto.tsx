import { Image } from 'expo-image';
import React, { memo, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { getCountryPrimaryColor } from '../../utils/countryPrimaryColor';
import { getPlayerPhotoUrl, playerInitials } from '../../utils/playerPhotoUrl';

export type PlayerPhotoProps = {
  playerId: string;
  playerName: string;
  size?: number;
  countryCode?: string;
  isCaptain?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const PlayerPhoto = memo(function PlayerPhoto({
  playerId,
  playerName,
  size = 34,
  countryCode = 'FR',
  isCaptain = false,
  style,
}: PlayerPhotoProps) {
  const [failed, setFailed] = useState(false);
  const uri = getPlayerPhotoUrl(playerId);
  const bg = getCountryPrimaryColor(countryCode);
  const showFallback = failed || !uri;

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      {showFallback ? (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
          <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{playerInitials(playerName)}</Text>
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          contentPosition="top"
          cachePolicy="memory-disk"
          onError={() => setFailed(true)}
        />
      )}
      {isCaptain ? (
        <View style={[styles.cap, { width: size * 0.32, height: size * 0.32, borderRadius: size * 0.16 }]}>
          <Text style={[styles.capTxt, { fontSize: size * 0.18 }]}>C</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  fallback: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  initials: { fontFamily: 'Inter_800ExtraBold', color: '#fff' },
  cap: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#f0b429',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capTxt: { fontFamily: 'Inter_900Black', color: '#000' },
});
