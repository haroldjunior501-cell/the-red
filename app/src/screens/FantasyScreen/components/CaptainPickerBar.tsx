import { Image } from 'expo-image';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';
import type { FantasyPitchPlayer } from '../../../types/fantasy.types';
import { getPlayerPhoto } from '../../../utils/playerPhoto';

export type CaptainPickerBarProps = {
  captain: FantasyPitchPlayer | null;
  pickMode: boolean;
  onPress: () => void;
};

export const CaptainPickerBar = memo(function CaptainPickerBar({
  captain,
  pickMode,
  onPress,
}: CaptainPickerBarProps) {
  return (
    <Pressable
      style={[styles.wrap, pickMode && styles.wrapActive, captain && styles.wrapFilled]}
      onPress={onPress}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>C</Text>
      </View>
      {captain ? (
        <Image
          source={{ uri: getPlayerPhoto(captain) }}
          style={styles.avatar}
          contentFit="cover"
          contentPosition="top"
        />
      ) : null}
      <View style={styles.textCol}>
        <Text style={styles.label}>CAPITAINE</Text>
        <Text style={styles.name} numberOfLines={1}>
          {captain ? captain.name : pickMode ? 'Touche un titulaire sur le terrain' : 'Choisir le capitaine'}
        </Text>
      </View>
      <Text style={styles.chevron}>{pickMode ? '✓' : '›'}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.border,
  },
  wrapActive: {
    borderColor: T.gold,
    backgroundColor: 'rgba(240, 180, 41, 0.08)',
  },
  wrapFilled: {
    borderColor: 'rgba(240, 180, 41, 0.45)',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: T.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1a1200',
  },
  badgeTxt: {
    fontFamily: 'Inter_900Black',
    fontSize: 13,
    color: '#1a1200',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: T.gold,
  },
  textCol: { flex: 1, minWidth: 0 },
  label: {
    fontSize: 8,
    letterSpacing: 1.6,
    color: T.muted2,
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    color: T.text,
    fontFamily: 'Inter_700Bold',
  },
  chevron: {
    fontSize: 18,
    color: T.gold,
    fontFamily: 'Inter_600SemiBold',
  },
});
