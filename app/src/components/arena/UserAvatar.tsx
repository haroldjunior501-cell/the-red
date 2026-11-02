import { Image } from 'expo-image';
import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { fetchUserProfilePhotoUrl } from '../../services/userProfileService';
import { getCountryPrimaryColor } from '../../utils/countryPrimaryColor';
import { playerInitials } from '../../utils/playerPhotoUrl';

export type UserAvatarProps = {
  userId: string;
  displayName: string;
  countryCode: string;
  photoUrl?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export const UserAvatar = memo(function UserAvatar({
  userId,
  displayName,
  countryCode,
  photoUrl: photoUrlProp,
  size = 30,
  style,
}: UserAvatarProps) {
  const [url, setUrl] = useState<string | null>(photoUrlProp ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (photoUrlProp !== undefined) {
      setUrl(photoUrlProp);
      setFailed(false);
      return;
    }
    let cancelled = false;
    void fetchUserProfilePhotoUrl(userId).then((u) => {
      if (!cancelled) {
        setUrl(u);
        setFailed(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId, photoUrlProp]);

  const bg = getCountryPrimaryColor(countryCode);
  const showFallback = failed || !url;

  return (
    <View style={[{ width: size, height: size }, style]}>
      {showFallback ? (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{playerInitials(displayName)}</Text>
        </View>
      ) : (
        <Image
          source={{ uri: url }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  initials: { fontFamily: 'Inter_800ExtraBold', color: '#fff' },
});
