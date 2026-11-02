import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AUTH_HUB } from '../../../constants/authHubTheme';
import type { RootStackParamList } from '../../../navigation/RootNavigator';
import {
  sendPasswordReset,
  signInWithApple,
  signInWithEmailOrUsername,
  signInWithGoogle,
} from '../../../services/authService';
import { loadRememberedEmail, saveRememberedEmail } from '../../../services/authRemember';
import { fetchUserAccountDoc } from '../../../services/profileAccountService';
import { useUserStore } from '../../../store/useUserStore';
import { AuthField } from './components/AuthField';
import { AuthGlassCard } from './components/AuthGlassCard';
import {
  AppleIcon,
  AuthShell,
  cardIconWrapStyle,
  cardSubStyle,
  cardTitleStyle,
  CheckRow,
  footerLinkRowStyle,
  footerLinkStyle,
  footerMutedStyle,
  GoogleIcon,
  loginOptionsRowStyle,
  OrSeparator,
  PrimaryButton,
  SocialButton,
  useFinishAuth,
  useFinishSocialAuth,
} from './authHubShared';

type Nav = StackNavigationProp<RootStackParamList, 'AuthLogin'>;

export default function AuthLoginScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const countryCode = useUserStore((s) => s.countryCode);
  const finishAuth = useFinishAuth();
  const finishSocial = useFinishSocialAuth(finishAuth);

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [busy, setBusy] = useState<'login' | 'google' | 'apple' | null>(null);

  useEffect(() => {
    void loadRememberedEmail().then(({ enabled, email }) => {
      setRememberMe(enabled);
      if (email) setLoginId(email);
    });
  }, []);

  const disabled = busy !== null;

  const onLogin = async () => {
    if (!loginId.trim() || !password) {
      Alert.alert('Connexion', 'Renseigne ton identifiant et ton mot de passe.');
      return;
    }
    setBusy('login');
    try {
      await saveRememberedEmail(rememberMe, loginId);
      const { userId } = await signInWithEmailOrUsername(loginId, password, countryCode);
      const doc = await fetchUserAccountDoc(userId);
      const email =
        doc?.email ??
        (loginId.includes('@') ? loginId.trim().toLowerCase() : getAuth().currentUser?.email ?? '');
      const displayName = doc?.name ?? loginId.trim();
      await finishAuth(userId, displayName, email);
    } catch (e) {
      Alert.alert('Connexion', e instanceof Error ? e.message : 'Erreur inconnue.');
    } finally {
      setBusy(null);
    }
  };

  const onForgotPassword = async () => {
    if (!loginId.trim()) {
      Alert.alert('Mot de passe oublié', 'Saisis ton email ou ton pseudo.');
      return;
    }
    try {
      await sendPasswordReset(loginId);
      Alert.alert('Email envoyé', 'Vérifie ta boîte mail pour réinitialiser ton mot de passe.');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible d’envoyer l’email.');
    }
  };

  const onGoogle = async () => {
    setBusy('google');
    try {
      const { userId } = await signInWithGoogle(countryCode);
      finishSocial(userId);
    } catch (e) {
      Alert.alert('Google', e instanceof Error ? e.message : 'Erreur.');
    } finally {
      setBusy(null);
    }
  };

  const onApple = async () => {
    setBusy('apple');
    try {
      const { userId } = await signInWithApple(countryCode);
      finishSocial(userId);
    } catch (e) {
      Alert.alert('Apple', e instanceof Error ? e.message : 'Erreur.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AuthShell>
      <AuthGlassCard>
        <View style={cardIconWrapStyle}>
          <MaterialCommunityIcons name="lock-outline" size={26} color={AUTH_HUB.electric} />
        </View>
        <Text style={cardTitleStyle}>{t('onboarding.auth.welcomeBack')}</Text>
        <Text style={cardSubStyle}>{t('onboarding.auth.loginSubtitle')}</Text>

        <AuthField
          label={t('onboarding.auth.emailOrUsername')}
          icon="account-outline"
          placeholder={t('onboarding.auth.emailPlaceholder')}
          value={loginId}
          onChangeText={setLoginId}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
          editable={!disabled}
        />
        <AuthField
          label={t('onboarding.auth.password')}
          icon="lock-outline"
          placeholder={t('onboarding.auth.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secure
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={() => void onLogin()}
          editable={!disabled}
        />

        <View style={loginOptionsRowStyle}>
          <CheckRow checked={rememberMe} onToggle={() => setRememberMe((v) => !v)}>
            {t('onboarding.auth.rememberMe')}
          </CheckRow>
          <Pressable onPress={() => void onForgotPassword()} hitSlop={8}>
            <Text style={footerLinkStyle}>{t('onboarding.auth.forgotPassword')}</Text>
          </Pressable>
        </View>

        <PrimaryButton label={t('onboarding.auth.signIn')} onPress={() => void onLogin()} busy={busy === 'login'} />

        <OrSeparator />

        <SocialButton
          label={t('onboarding.auth.google')}
          icon={<GoogleIcon />}
          onPress={() => void onGoogle()}
          disabled={disabled}
        />
        <SocialButton
          label={t('onboarding.auth.apple')}
          icon={<AppleIcon />}
          onPress={() => void onApple()}
          disabled={disabled}
        />

        <Pressable style={footerLinkRowStyle} onPress={() => navigation.navigate('AuthSignUp')}>
          <Text style={footerMutedStyle}>{t('onboarding.auth.noAccount')} </Text>
          <Text style={footerLinkStyle}>{t('onboarding.auth.signUp')}</Text>
        </Pressable>
      </AuthGlassCard>
    </AuthShell>
  );
}
