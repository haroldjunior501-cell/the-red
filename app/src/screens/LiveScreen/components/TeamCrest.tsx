import React, { memo } from 'react';
import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp } from 'react-native';
import { flagEmoji } from '../../../constants/mapHub';

type Props = {
  countryCode: string;
  logoUrl?: string;
  size?: number;
};

export const TeamCrest = memo(function TeamCrest({ countryCode, logoUrl, size = 28 }: Props) {
  const imgStyle: StyleProp<ImageStyle> = { width: size, height: size };

  if (logoUrl) {
    return (
      <View style={[styles.box, { width: size, height: size }]}>
        <Image source={{ uri: logoUrl }} style={imgStyle} resizeMode="contain" />
      </View>
    );
  }

  return <Text style={[styles.flag, { fontSize: size * 0.85 }]}>{flagEmoji(countryCode)}</Text>;
});

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  flag: { lineHeight: 28 },
});
