import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const PlayerAvatar = memo(function PlayerAvatar({
  photo,
  size = 40,
}: {
  photo?: string;
  size?: number;
}) {
  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={[styles.ph, { width: size, height: size, borderRadius: size / 2 }]}>
      <MaterialCommunityIcons name="account" size={size * 0.5} color="rgba(255,255,255,0.4)" />
    </View>
  );
});

const styles = StyleSheet.create({
  ph: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
