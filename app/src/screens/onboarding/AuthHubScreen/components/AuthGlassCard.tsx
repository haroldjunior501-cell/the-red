import React, { memo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AUTH_HUB } from '../../../../constants/authHubTheme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const AuthGlassCard = memo(function AuthGlassCard({ children, style }: Props) {
  return (
    <View style={[styles.outer, style]}>
      <LinearGradient
        colors={['rgba(47,107,255,0.12)', 'rgba(12,22,42,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    minWidth: 280,
    maxWidth: 420,
    borderRadius: AUTH_HUB.radiusCard,
    borderWidth: 1,
    borderColor: AUTH_HUB.cardBorder,
    backgroundColor: AUTH_HUB.cardBg,
    overflow: 'hidden',
    shadowColor: AUTH_HUB.electric,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  inner: {
    padding: 26,
  },
});
