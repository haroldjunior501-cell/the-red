import React, { memo } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

const LOGO = require('../../assets/the-red/logo-hd.png');

type Props = {
  width?: number;
  style?: StyleProp<ViewStyle>;
};

/** Logo officiel THE RED — PNG HD pour rester net sur mobile. */
export const TheRedLogo = memo(function TheRedLogo({ width = 280, style }: Props) {
  const height = width * (142 / 118);

  return (
    <View style={[styles.wrap, style]} accessibilityLabel="The Red United">
      <Image
        source={LOGO}
        style={{ width, height }}
        resizeMode="contain"
        // évite le downsampling flou sur Android
        fadeDuration={0}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
