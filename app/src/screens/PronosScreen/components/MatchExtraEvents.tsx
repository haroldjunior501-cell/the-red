import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';

export type MatchExtraEventsProps = {
  count?: number;
  bonusPoints?: number;
  disabled?: boolean;
  onPress?: () => void;
};

export const MatchExtraEvents = memo(function MatchExtraEvents({
  count = 3,
  bonusPoints = 75,
  disabled,
  onPress,
}: MatchExtraEventsProps) {
  return (
    <Pressable
      style={styles.wrap}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>⚡</Text>
      </View>
      <Text style={styles.label}>{count} événements supplémentaires</Text>
      <Text style={styles.pts}>+{bonusPoints} pts</Text>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.blueFill,
    borderWidth: 1,
    borderColor: C.blueBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 12 },
  label: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: C.text2,
  },
  pts: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: C.blue2,
  },
  chev: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: C.muted,
    marginLeft: 2,
  },
});
