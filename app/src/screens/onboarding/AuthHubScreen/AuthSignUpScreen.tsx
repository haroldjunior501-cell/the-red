import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AUTH_HUB } from '../../../constants/authHubTheme';
import type { RootStackParamList } from '../../../navigation/RootNavigator';
import { openLegalDocument } from '../../../services/legalNavigation';
import { signUpWithEmail } from '../../../services/authService';
import { useUserStore } from '../../../store/useUserStore';
import { useFinishAuth } from './authHubShared';

type Nav = StackNavigationProp<RootStackParamList, 'AuthSignUp'>;

type SignUpDraft = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function AuthSignUpScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const countryCode = useUserStore((s) => s.countryCode);
  const finishAuth = useFinishAuth();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const draftRef = useRef<SignUpDraft>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onUsernameChange = useCallback((text: string) => {
    draftRef.current.username = text;
  }, []);

  const onEmailChange = useCallback((text: string) => {
    draftRef.current.email = text;
  }, []);

  const onPasswordChange = useCallback((text: string) => {
    draftRef.current.password = text;
  }, []);

  const onConfirmPasswordChange = useCallback((text: string) => {
    draftRef.current.confirmPassword = text;
  }, []);

  const focusEmail = useCallback(() => {
    emailRef.current?.focus();
  }, []);

  const focusPassword = useCallback(() => {
    passwordRef.current?.focus();
  }, []);

  const focusConfirmPassword = useCallback(() => {
    confirmPasswordRef.current?.focus();
  }, []);

  const onRegister = useCallback(async () => {
    if (busy) return;

    const name = draftRef.current.username.trim();
    const mail = draftRef.current.email.trim().toLowerCase();
    const password = draftRef.current.password;
    const confirmPassword = draftRef.current.confirmPassword;

    if (name.length < 2) {
      Alert.alert('Pseudo', 'Choisis un nom d’utilisateur (2 caractères minimum).');
      return;
    }
    if (!mail.includes('@')) {
      Alert.alert('Email', 'Saisis une adresse email valide.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Mot de passe', 'Minimum 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Confirmation', 'Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Conditions', 'Tu dois accepter les conditions pour créer un compte.');
      return;
    }

    setBusy(true);
    try {
      const { userId } = await signUpWithEmail(mail, password, name, countryCode);
      await finishAuth(userId, name, mail);
    } catch (e) {
      Alert.alert('Inscription', e instanceof Error ? e.message : 'Erreur inconnue.');
    } finally {
      setBusy(false);
    }
  }, [acceptTerms, busy, countryCode, finishAuth]);

  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        colors={[AUTH_HUB.bgTop, AUTH_HUB.bgMid, AUTH_HUB.bgBottom]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name="account-plus-outline" size={30} color={AUTH_HUB.electric} />
              </View>

              <Text style={styles.title}>{t('onboarding.auth.createTitle')}</Text>
              <Text style={styles.subtitle}>{t('onboarding.auth.createSubtitle')}</Text>

              <Text style={styles.label}>{t('onboarding.auth.username')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('onboarding.auth.usernamePlaceholder')}
                placeholderTextColor={AUTH_HUB.textDim}
                onChangeText={onUsernameChange}
                editable={!busy}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                importantForAutofill="no"
                textContentType="none"
                returnKeyType="next"
                blurOnSubmit={false}
                selectionColor={AUTH_HUB.electric}
                onSubmitEditing={focusEmail}
              />

              <Text style={styles.label}>{t('onboarding.auth.email')}</Text>
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder={t('onboarding.auth.emailPlaceholder')}
                placeholderTextColor={AUTH_HUB.textDim}
                onChangeText={onEmailChange}
                editable={!busy}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                spellCheck={false}
                textContentType="emailAddress"
                returnKeyType="next"
                blurOnSubmit={false}
                selectionColor={AUTH_HUB.electric}
                onSubmitEditing={focusPassword}
              />

              <Text style={styles.label}>{t('onboarding.auth.password')}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  ref={passwordRef}
                  style={styles.passwordInput}
                  placeholder={t('onboarding.auth.passwordMin')}
                  placeholderTextColor={AUTH_HUB.textDim}
                  onChangeText={onPasswordChange}
                  editable={!busy}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  spellCheck={false}
                  importantForAutofill="no"
                  textContentType="oneTimeCode"
                  passwordRules=""
                  returnKeyType="next"
                  blurOnSubmit={false}
                  selectionColor={AUTH_HUB.electric}
                  onSubmitEditing={focusConfirmPassword}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={10}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={21}
                    color={AUTH_HUB.textMuted}
                  />
                </Pressable>
              </View>

              <Text style={styles.label}>{t('onboarding.auth.confirmPassword')}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  ref={confirmPasswordRef}
                  style={styles.passwordInput}
                  placeholder={t('onboarding.auth.confirmPasswordPlaceholder')}
                  placeholderTextColor={AUTH_HUB.textDim}
                  onChangeText={onConfirmPasswordChange}
                  editable={!busy}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  spellCheck={false}
                  importantForAutofill="no"
                  textContentType="oneTimeCode"
                  passwordRules=""
                  returnKeyType="done"
                  selectionColor={AUTH_HUB.electric}
                  onSubmitEditing={() => void onRegister()}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword((current) => !current)}
                  hitSlop={10}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={21}
                    color={AUTH_HUB.textMuted}
                  />
                </Pressable>
              </View>

              <Pressable
                style={styles.termsRow}
                onPress={() => setAcceptTerms((current) => !current)}
                disabled={busy}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxOn]}>
                  {acceptTerms ? <MaterialCommunityIcons name="check" size={15} color="#FFFFFF" /> : null}
                </View>
                <Text style={styles.termsText}>
                  J'accepte les{' '}
                  <Text style={styles.link} onPress={() => openLegalDocument(navigation, 'terms')}>
                    Conditions d'utilisation
                  </Text>{' '}
                  et la{' '}
                  <Text style={styles.link} onPress={() => openLegalDocument(navigation, 'privacyPolicy')}>
                    Politique de confidentialité
                  </Text>
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.submit, (pressed || busy) && styles.submitPressed]}
                onPress={() => void onRegister()}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>{t('onboarding.auth.createBtn')}</Text>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.loginLink, pressed && styles.linkPressed]}
                onPress={() => navigation.navigate('AuthLogin')}
                disabled={busy}
              >
                <Text style={styles.loginText}>
                  {t('onboarding.auth.alreadyAccountFull')} <Text style={styles.loginTextStrong}>{t('onboarding.auth.signIn')}</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH_HUB.bgTop,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: AUTH_HUB.cardBorder,
    backgroundColor: 'rgba(8, 18, 36, 0.92)',
    padding: 24,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(47,107,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(47,107,255,0.32)',
  },
  title: {
    color: AUTH_HUB.text,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: AUTH_HUB.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
  },
  label: {
    color: AUTH_HUB.textMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AUTH_HUB.inputBorder,
    backgroundColor: AUTH_HUB.inputBg,
    color: AUTH_HUB.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  passwordRow: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AUTH_HUB.inputBorder,
    backgroundColor: AUTH_HUB.inputBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: AUTH_HUB.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    paddingVertical: 12,
  },
  eyeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 2,
    marginBottom: 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AUTH_HUB.inputBorder,
    backgroundColor: AUTH_HUB.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: {
    borderColor: AUTH_HUB.electric,
    backgroundColor: AUTH_HUB.electric,
  },
  termsText: {
    flex: 1,
    color: AUTH_HUB.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    color: AUTH_HUB.electric,
    fontFamily: 'Inter_700Bold',
  },
  submit: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: AUTH_HUB.electric,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPressed: {
    opacity: 0.86,
  },
  submitText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 18,
  },
  linkPressed: {
    opacity: 0.72,
  },
  loginText: {
    color: AUTH_HUB.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  loginTextStrong: {
    color: AUTH_HUB.electric,
    fontFamily: 'Inter_800ExtraBold',
  },
});
