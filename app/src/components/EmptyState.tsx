import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

export type EmptyStateProps = {
  icon: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCta,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {ctaLabel && onCta ? (
        <Pressable style={styles.cta} onPress={onCta}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  cta: {
    marginTop: 20,
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  ctaText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 13,
    color: '#1a1200',
  },
});
