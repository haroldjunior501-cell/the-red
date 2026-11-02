import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PROFILE_V2 } from '../../../constants/profileV2Theme';
import { PROFILE_FONTS as F } from '../profileTypography';

export type ListIconTone = 'blue' | 'green' | 'gold' | 'purple' | 'neutral';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconTone?: ListIconTone;
  label: string;
  subtitle?: string;
  badge?: { text: string; tone: 'green' | 'blue' | 'gold' };
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
};

const TONE_STYLES: Record<ListIconTone, { bg: string; border: string }> = {
  blue: { bg: 'rgba(41,121,255,0.1)', border: 'rgba(41,121,255,0.15)' },
  green: { bg: 'rgba(0,230,118,0.08)', border: 'rgba(0,230,118,0.12)' },
  gold: { bg: 'rgba(240,180,41,0.08)', border: 'rgba(240,180,41,0.12)' },
  purple: { bg: 'rgba(147,51,255,0.08)', border: 'rgba(147,51,255,0.12)' },
  neutral: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)' },
};

const BADGE_STYLES = {
  green: { bg: 'rgba(0,230,118,0.08)', border: 'rgba(0,230,118,0.15)', color: PROFILE_V2.green },
  blue: { bg: 'rgba(41,121,255,0.1)', border: 'rgba(41,121,255,0.2)', color: PROFILE_V2.blue2 },
  gold: { bg: 'rgba(240,180,41,0.1)', border: 'rgba(240,180,41,0.2)', color: PROFILE_V2.gold },
};

export const ListItem = memo(function ListItem({
  icon,
  iconTone = 'blue',
  label,
  subtitle,
  badge,
  value,
  onPress,
  isLast,
}: Props) {
  const tone = TONE_STYLES[iconTone];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && styles.rowPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: tone.bg, borderColor: tone.border }]}>
        <MaterialCommunityIcons name={icon} size={20} color={PROFILE_V2.text1} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {badge ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: BADGE_STYLES[badge.tone].bg,
                borderColor: BADGE_STYLES[badge.tone].border,
              },
            ]}
          >
            <Text style={[styles.badgeTxt, { color: BADGE_STYLES[badge.tone].color }]}>{badge.text}</Text>
          </View>
        ) : null}
        {onPress ? (
          <MaterialCommunityIcons name="chevron-right" size={22} color={PROFILE_V2.text3} />
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  rowPressed: { backgroundColor: 'rgba(41,121,255,0.04)' },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  label: { fontFamily: F.bold, fontSize: 14, color: PROFILE_V2.text1, marginBottom: 2 },
  sub: { fontFamily: F.medium, fontSize: 11, color: PROFILE_V2.text3 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontFamily: F.semi, fontSize: 12, color: PROFILE_V2.text3 },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeTxt: { fontFamily: F.bold, fontSize: 10, letterSpacing: 0.5 },
});
