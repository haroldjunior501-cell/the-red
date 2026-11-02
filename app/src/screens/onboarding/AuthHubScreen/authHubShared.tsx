import React, { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AUTH_HUB } from '../../../constants/authHubTheme';
import type { RootStackParamList } from '../../../navigation/RootNavigator';
import { markDeviceKnown } from '../../../services/authRemember';
import { openLegalDocument } from '../../../services/legalNavigation';
import { useUserStore } from '../../../store/useUserStore';

export function AppleIcon() {
  return <Ionicons name="logo-apple" size={22} color="#FFFFFF" />;
}

export function GoogleIcon() {
  return <AntDesign name="google" size={20} color="#EA4335" />;
}

export const OrSeparator = memo(function OrSeparator() {
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>OU</Text>
      <View style={styles.orLine} />
    </View>
  );
});

export function PrimaryButton({
  label,
  onPress,
  busy,
}: {
  label: string;
  onPress: () => void;
  busy: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.primaryBtn, (pressed || busy) && styles.primaryBtnPressed]}
      onPress={onPress}
      disabled={busy}
    >
      {busy ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SocialButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.socialBtn, pressed && styles.socialBtnPressed, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <Text style={styles.socialBtnText}>{label}</Text>
    </Pressable>
  );
}

export function CheckRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable style={styles.checkRow} onPress={onToggle}>
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
        {checked ? <MaterialCommunityIcons name="check" size={14} color="#fff" /> : null}
      </View>
      <Text style={styles.checkText}>{children}</Text>
    </Pressable>
  );
}

export function AuthFooter() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <>
      <View style={styles.featureRow}>
        <View style={styles.featureBlock}>
          <MaterialCommunityIcons name="star-four-points" size={18} color={AUTH_HUB.electric} />
          <Text style={styles.featureTitle}>Match Center</Text>
          <Text style={styles.featureSub}>Calendrier et scores des Red Devils</Text>
        </View>
        <View style={styles.featureBlock}>
          <MaterialCommunityIcons name="account-group-outline" size={18} color={AUTH_HUB.electric} />
          <Text style={styles.featureTitle}>Communauté</Text>
          <Text style={styles.featureSub}>Le mur des fans de United</Text>
        </View>
        <View style={styles.featureBlock}>
          <MaterialCommunityIcons name="newspaper-variant-outline" size={18} color={AUTH_HUB.electric} />
          <Text style={styles.featureTitle}>United News</Text>
          <Text style={styles.featureSub}>Les actus du club, au même endroit</Text>
        </View>
      </View>
      <View style={styles.legalRow}>
        <Pressable hitSlop={8} onPress={() => openLegalDocument(navigation, 'terms')}>
          <Text style={styles.legalLink}>Conditions d&apos;utilisation</Text>
        </Pressable>
        <Text style={styles.legalDot}>·</Text>
        <Pressable hitSlop={8} onPress={() => openLegalDocument(navigation, 'privacyPolicy')}>
          <Text style={styles.legalLink}>Politique de confidentialité</Text>
        </Pressable>
      </View>
    </>
  );
}

type AuthShellProps = {
  children: React.ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[AUTH_HUB.bgTop, AUTH_HUB.bgMid, AUTH_HUB.bgBottom]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowCenter} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.sparkle}>✦</Text>
          <Text style={styles.wcTitle}>MANCHESTER UNITED</Text>
          <View style={styles.langPill}>
            <Text style={styles.langFlag}>🇫🇷</Text>
            <Text style={styles.langCode}>FR</Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color={AUTH_HUB.textMuted} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardCenter}>{children}</View>
            <AuthFooter />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export function useFinishAuth() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const setUserId = useUserStore((s) => s.setUserId);
  const setName = useUserStore((s) => s.setName);
  const setEmail = useUserStore((s) => s.setEmail);

  return useCallback(
    async (userId: string, displayName: string, email: string) => {
      await markDeviceKnown();
      setUserId(userId);
      if (displayName.trim()) setName(displayName.trim());
      if (email.trim()) setEmail(email.trim());
      navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
    },
    [navigation, setEmail, setName, setUserId]
  );
}

export function useFinishSocialAuth(finishAuth: ReturnType<typeof useFinishAuth>) {
  return useCallback(
    (userId: string) => {
      const user = getAuth().currentUser;
      void finishAuth(userId, user?.displayName ?? '', user?.email ?? '');
    },
    [finishAuth]
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AUTH_HUB.bgTop },
  safe: { flex: 1 },
  flex: { flex: 1 },
  glowTop: {
    position: 'absolute',
    top: -60,
    left: '20%',
    right: '20%',
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(218,41,28,0.16)',
  },
  glowCenter: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    right: '15%',
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(218,41,28,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sparkle: { position: 'absolute', left: 20, color: '#F0B429', fontSize: 16 },
  wcTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 4,
    color: 'rgba(138,160,190,0.9)',
    textTransform: 'uppercase',
  },
  langPill: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: AUTH_HUB.langPillBg,
    borderWidth: 1,
    borderColor: 'rgba(218,41,28,0.35)',
    shadowColor: AUTH_HUB.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  langFlag: { fontSize: 14 },
  langCode: { fontFamily: 'Inter_700Bold', fontSize: 12, color: AUTH_HUB.text },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    alignItems: 'center',
  },
  cardCenter: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginTop: 8,
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: 'rgba(47,107,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(47,107,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    color: AUTH_HUB.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 19,
    color: AUTH_HUB.textMuted,
    textAlign: 'center',
    marginBottom: 22,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
    marginTop: 4,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: AUTH_HUB.inputBorder,
    backgroundColor: AUTH_HUB.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkBoxOn: {
    backgroundColor: AUTH_HUB.electric,
    borderColor: AUTH_HUB.electric,
  },
  checkText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 18,
    color: AUTH_HUB.textMuted,
  },
  linkInline: { color: AUTH_HUB.electric, fontFamily: 'Inter_600SemiBold' },
  primaryBtn: {
    marginTop: 4,
    minHeight: 52,
    borderRadius: AUTH_HUB.radiusBtn,
    backgroundColor: AUTH_HUB.electric,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AUTH_HUB.electric,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  primaryBtnText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  orText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: AUTH_HUB.textDim,
    letterSpacing: 2,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    borderRadius: AUTH_HUB.radiusBtn,
    borderWidth: 1,
    borderColor: AUTH_HUB.inputBorder,
    backgroundColor: AUTH_HUB.inputBg,
    marginBottom: 10,
  },
  socialBtnPressed: { opacity: 0.88 },
  socialBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: AUTH_HUB.text,
  },
  disabled: { opacity: 0.55 },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  footerMuted: { fontFamily: 'Inter_500Medium', fontSize: 13, color: AUTH_HUB.textMuted },
  footerLink: { fontFamily: 'Inter_700Bold', fontSize: 13, color: AUTH_HUB.electric },
  loginOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    maxWidth: 920,
    marginTop: 28,
    justifyContent: 'center',
  },
  featureBlock: {
    flex: 1,
    minWidth: 140,
    maxWidth: 220,
    padding: 14,
    borderRadius: 16,
    backgroundColor: AUTH_HUB.footerBlockBg,
    borderWidth: 1,
    borderColor: AUTH_HUB.cardBorder,
    alignItems: 'center',
  },
  featureTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: AUTH_HUB.text,
    marginTop: 8,
    textAlign: 'center',
  },
  featureSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: AUTH_HUB.textDim,
    marginTop: 4,
    textAlign: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  legalLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: AUTH_HUB.textDim,
  },
  legalDot: { color: AUTH_HUB.textDim },
});

export const linkInlineStyle = styles.linkInline;
export const footerLinkStyle = styles.footerLink;
export const footerMutedStyle = styles.footerMuted;
export const footerLinkRowStyle = styles.footerLinkRow;
export const cardTitleStyle = styles.cardTitle;
export const cardSubStyle = styles.cardSub;
export const cardIconWrapStyle = styles.cardIconWrap;
export const loginOptionsRowStyle = styles.loginOptionsRow;
