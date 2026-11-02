import React, { memo, useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { borderColorForCountry, lngLatToMapPercent } from '../../utils/geoMap';
import type { SupporterOnline } from '../../services/mapService';

export type SupporterAvatarProps = {
  supporter: SupporterOnline;
  isMe?: boolean;
  displayName?: string;
  /** Drapeau ou initiale si pas d’image */
  fallbackGlyph: string;
  imageUri?: string;
  skinColor: string;
  onPress?: (s: SupporterOnline) => void;
};

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
}

export const SupporterAvatar = memo(function SupporterAvatar({
  supporter,
  isMe,
  displayName,
  fallbackGlyph,
  imageUri,
  skinColor,
  onPress,
}: SupporterAvatarProps) {
  const { leftPct, topPct } = lngLatToMapPercent(supporter.lng, supporter.lat);
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [y]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  const border = borderColorForCountry(supporter.country);
  const size = isMe ? 52 : 40;
  const bw = isMe ? 3 : 2;
  const label = isMe ? `${(displayName ?? supporter.name).toUpperCase()} · MON AVATAR` : `${supporter.country} · ${supporter.rank}`;

  const marker = (
    <Animated.View style={[styles.wrap, anim]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: bw,
            borderColor: isMe ? '#2979ff' : border,
            shadowColor: isMe ? '#2979ff' : border,
            shadowOpacity: isMe ? 0.5 : 0.28,
            shadowRadius: isMe ? 16 : 8,
            shadowOffset: { width: 0, height: 0 },
            elevation: isMe ? 12 : 4,
          },
        ]}
      >
        {imageUri && isImageUrl(imageUri) ? (
          <Image source={{ uri: imageUri }} style={{ width: size - bw * 2, height: size - bw * 2, borderRadius: 999 }} />
        ) : (
          <View style={[styles.inner, { width: size - bw * 2, height: size - bw * 2, backgroundColor: skinColor }]}>
            <Text style={{ fontSize: isMe ? 20 : 16 }}>{fallbackGlyph}</Text>
          </View>
        )}
      </View>
      <View style={styles.arrow} />
      <View style={[styles.label, isMe && styles.labelMe]}>
        <Text style={[styles.labelT, isMe && styles.labelTM]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );

  const pos = { left: `${leftPct}%` as const, top: `${topPct}%` as const };
  if (onPress) {
    return (
      <Pressable onPress={() => onPress(supporter)} style={[styles.pos, pos]} hitSlop={10}>
        {marker}
      </Pressable>
    );
  }
  return <View style={[styles.pos, pos]}>{marker}</View>;
});

const styles = StyleSheet.create({
  pos: { position: 'absolute', zIndex: 16 },
  wrap: { alignItems: 'center', marginLeft: -26, marginTop: -28 },
  ring: { backgroundColor: '#0f1623', alignItems: 'center', justifyContent: 'center' },
  inner: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0,0,0,0.85)',
  },
  label: {
    marginTop: 2,
    maxWidth: 160,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  labelMe: { backgroundColor: 'rgba(41, 121, 255, 0.15)', borderWidth: 1, borderColor: '#2979ff' },
  labelT: { fontSize: 9, fontWeight: '700', color: '#fff' },
  labelTM: { color: '#2979ff' },
});
