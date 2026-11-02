import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { flagEmoji } from '../../../constants/mapHub';

export type NationArrivalToastProps = {
  visible: boolean;
  countryCode: string;
  countryName: string;
  supportersCount: number;
};

export const NationArrivalToast = memo(function NationArrivalToast({
  visible,
  countryCode,
  countryName,
  supportersCount,
}: NationArrivalToastProps) {
  const slide = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (!visible) return;
    slide.setValue(-80);
    Animated.spring(slide, {
      toValue: 0,
      tension: 72,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [visible, countryCode, slide]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY: slide }] }]} pointerEvents="none">
      <Text style={styles.flag}>{flagEmoji(countryCode)}</Text>
      <View style={styles.textCol}>
        <Text style={styles.title}>{countryName}</Text>
        <Text style={styles.sub}>
          {supportersCount > 0
            ? `${supportersCount} supporter${supportersCount > 1 ? 's' : ''} connecté${supportersCount > 1 ? 's' : ''}`
            : 'Ta nation sur la carte'}
        </Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    left: 14,
    right: 14,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(8, 16, 32, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.35)',
    shadowColor: '#2979ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  flag: { fontSize: 28 },
  textCol: { flex: 1 },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  sub: {
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(180, 210, 255, 0.75)',
  },
});
