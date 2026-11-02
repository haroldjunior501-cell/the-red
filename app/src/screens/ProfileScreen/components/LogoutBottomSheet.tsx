import React, { memo, useEffect } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PROFILE_V2 } from '../../../constants/profileV2Theme';
import { PROFILE_FONTS as F } from '../profileTypography';

type Props = {
  visible: boolean;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const LogoutBottomSheet = memo(function LogoutBottomSheet({
  visible,
  busy,
  onCancel,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const backdrop = useSharedValue(0);
  const translateY = useSharedValue(320);

  useEffect(() => {
    if (visible) {
      backdrop.value = withTiming(1, { duration: 280 });
      translateY.value = withTiming(0, { duration: 340, easing: Easing.out(Easing.cubic) });
    } else {
      backdrop.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(320, { duration: 260, easing: Easing.in(Easing.cubic) });
    }
  }, [visible, backdrop, translateY]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, overlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Fermer" />
        </Animated.View>
        <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.handle} />
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="logout" size={36} color={PROFILE_V2.red} />
          </View>
          <Text style={styles.title}>DÉCONNEXION</Text>
          <Text style={styles.sub}>
            Tu perdras l&apos;accès à ton compte jusqu&apos;à ta prochaine connexion.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
            onPress={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={PROFILE_V2.red} />
            ) : (
              <Text style={styles.confirmTxt}>Se déconnecter</Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
            onPress={onCancel}
            disabled={busy}
          >
            <Text style={styles.cancelTxt}>Annuler</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  sheet: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: PROFILE_V2.card2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: PROFILE_V2.border2,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconWrap: { alignItems: 'center', marginBottom: 14 },
  title: {
    fontFamily: F.bebas,
    fontSize: 22,
    letterSpacing: 3,
    color: PROFILE_V2.text1,
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    fontFamily: F.medium,
    fontSize: 13,
    lineHeight: 20,
    color: PROFILE_V2.text2,
    textAlign: 'center',
    marginBottom: 22,
  },
  confirm: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(229,56,43,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229,56,43,0.3)',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmTxt: { fontFamily: F.bold, fontSize: 15, color: PROFILE_V2.red },
  cancel: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PROFILE_V2.border2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  cancelTxt: { fontFamily: F.bold, fontSize: 15, color: PROFILE_V2.text2 },
  pressed: { opacity: 0.88 },
});
