import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PROFILE_V2 } from '../../../constants/profileV2Theme';
import { PROFILE_FONTS as F } from '../profileTypography';

type Props = {
  label: string;
  onPress?: () => void;
  isLast?: boolean;
};

export const LegalItem = memo(function LegalItem({ label, onPress, isLast }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, !isLast && styles.border, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={PROFILE_V2.text3} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  border: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  pressed: { backgroundColor: 'rgba(255,255,255,0.02)' },
  label: { fontFamily: F.semi, fontSize: 13, color: PROFILE_V2.text2 },
});
