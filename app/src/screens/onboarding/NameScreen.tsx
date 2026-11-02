import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useUserStore } from '../../store/useUserStore';

export default function NameScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const setName = useUserStore((s) => s.setName);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>✍️</Text>
          <Text style={styles.title}>{t('onboarding.name.title')}</Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={t('onboarding.name.placeholder')}
            placeholderTextColor={Colors.textMuted}
            selectionColor={Colors.green}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[styles.input, focused && styles.inputFocused]}
          />

          <Text style={styles.hint}>
            {t('onboarding.name.subtitle')} {t('onboarding.name.hint')}
          </Text>

          <View style={styles.spacer} />

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => {
              const trimmed = value.trim();
              if (!trimmed) return;
              setName(trimmed);
              navigation.navigate('AuthSignUp');
            }}
          >
            <Text style={styles.ctaText}>{t('onboarding.name.adventure')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    width: '100%',
    maxWidth: 320,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  inputFocused: {
    borderColor: Colors.green,
  },
  hint: {
    marginTop: 14,
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  cta: {
    marginBottom: 24,
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  ctaText: {
    color: Colors.bg,
    fontWeight: '900',
    fontSize: 15,
  },
});
