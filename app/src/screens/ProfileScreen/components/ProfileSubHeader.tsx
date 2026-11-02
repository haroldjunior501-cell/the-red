import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PROFILE_V2 } from '../../../constants/profileV2Theme';
import { PROFILE_FONTS as F } from '../profileTypography';
import { HeroGrid } from './HeroGrid';

type Props = {
  title: string;
  onBack: () => void;
};

export const ProfileSubHeader = memo(function ProfileSubHeader({ title, onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[...PROFILE_V2.headerGrad]}
      style={[styles.wrap, { paddingTop: insets.top + 8 }]}
    >
      <HeroGrid />
      <View style={styles.glow} />
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          onPress={onBack}
          accessibilityLabel="Retour"
        >
          <MaterialCommunityIcons name="chevron-left" size={20} color={PROFILE_V2.text2} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingBottom: 16, paddingHorizontal: 18, overflow: 'hidden' },
  glow: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    width: 200,
    height: 140,
    borderRadius: 100,
    backgroundColor: 'rgba(41,121,255,0.12)',
  },
  row: { flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  back: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: PROFILE_V2.border2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: F.bebas,
    fontSize: 20,
    letterSpacing: 4,
    color: PROFILE_V2.text1,
  },
  spacer: { width: 32 },
  pressed: { opacity: 0.85 },
});
