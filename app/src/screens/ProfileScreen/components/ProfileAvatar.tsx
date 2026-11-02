import React, { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PROFILE_V2 } from '../../../constants/profileV2Theme';
import { countryAvatarGradient } from '../../../utils/countryColors';
import { PROFILE_FONTS as F } from '../profileTypography';

type Props = {
  displayName: string;
  countryCode: string;
  photoUrl: string | null;
  uploading?: boolean;
  onEditPress: () => void;
};

export const ProfileAvatar = memo(function ProfileAvatar({
  displayName,
  countryCode,
  photoUrl,
  uploading,
  onEditPress,
}: Props) {
  const initial = (displayName.trim()[0] || 'G').toUpperCase();
  const gradient = countryAvatarGradient(countryCode);

  return (
    <View style={styles.wrap}>
      <View style={styles.circleOuter}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.circle}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={styles.initial}>{initial}</Text>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.35)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </LinearGradient>
      </View>
      <Pressable
        style={({ pressed }) => [styles.editBtn, pressed && styles.editPressed]}
        onPress={onEditPress}
        disabled={uploading}
        accessibilityLabel="Modifier la photo"
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <MaterialCommunityIcons name="pencil" size={11} color="#fff" />
        )}
      </Pressable>
    </View>
  );
});

const SIZE = 72;

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, position: 'relative' },
  circleOuter: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2.5,
    borderColor: 'rgba(41,121,255,0.4)',
    overflow: 'hidden',
    shadowColor: PROFILE_V2.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  circle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    fontFamily: F.bebas,
    fontSize: 28,
    letterSpacing: 2,
    color: PROFILE_V2.text1,
    zIndex: 1,
  },
  editBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PROFILE_V2.blue,
    borderWidth: 2,
    borderColor: PROFILE_V2.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
});
