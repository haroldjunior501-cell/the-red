import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { signInWithEmail, signUpWithEmail } from '../../services/authService';
import { useUserStore } from '../../store/useUserStore';

type Mode = 'register' | 'login';

export default function EmailAuthScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const storeName = useUserStore((s) => s.name);
  const setUserId = useUserStore((s) => s.setUserId);

  const [mode, setMode] = useState<Mode>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const displayName = storeName.trim() || 'Joueur';

  const switchMode = (next: Mode) => {
    setMode(next);
    setPassword('');
    setConfirm('');
  };

  const submit = async () => {
    const e = email.trim();
    if (!e || !e.includes('@')) {
      Alert.alert('Email', 'Saisis une adresse email valide.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mot de passe', 'Au moins 6 caractères (exigence Firebase).');
      return;
    }
    if (mode === 'register' && password !== confirm) {
      Alert.alert('Confirmation', 'Les deux mots de passe ne correspondent pas.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'register') {
        const { userId } = await signUpWithEmail(e, password, displayName);
        setUserId(userId);
      } else {
        const { userId } = await signInWithEmail(e, password);
        setUserId(userId);
      }
      navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
    } catch (err) {
      Alert.alert('Impossible', err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backPressed]}
            hitSlop={12}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={Colors.green} />
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.emoji}>✉️</Text>
          <Text style={styles.title}>{mode === 'register' ? 'Créer un compte' : 'Connexion'}</Text>
          <Text style={styles.sub}>
            {mode === 'register'
              ? `On enregistrera ton profil sous « ${displayName} » (tu peux le changer plus tard).`
              : 'Entre les identifiants de ton compte Goalya.'}
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="toi@exemple.com"
            placeholderTextColor={Colors.textMuted}
            selectionColor={Colors.green}
            style={styles.input}
            editable={!busy}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={Colors.textMuted}
            selectionColor={Colors.green}
            style={styles.input}
            editable={!busy}
          />

          {mode === 'register' ? (
            <>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                selectionColor={Colors.green}
                style={styles.input}
                editable={!busy}
              />
            </>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.cta, (pressed || busy) && styles.ctaPressed]}
            onPress={submit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <Text style={styles.ctaText}>{mode === 'register' ? "S'inscrire" : 'Se connecter'}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => switchMode(mode === 'register' ? 'login' : 'register')}
            disabled={busy}
            style={({ pressed }) => [styles.switchRow, pressed && styles.switchPressed]}
          >
            <Text style={styles.switchText}>
              {mode === 'register' ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
              <Text style={styles.switchLink}>{mode === 'register' ? 'Se connecter' : "S'inscrire"}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: { flex: 1 },
  topBar: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backPressed: { opacity: 0.85 },
  backText: {
    color: Colors.green,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: -4,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'stretch',
  },
  emoji: {
    fontSize: 44,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    fontSize: 17,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  cta: {
    marginTop: 8,
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaPressed: { opacity: 0.92 },
  ctaText: {
    color: Colors.bg,
    fontWeight: '900',
    fontSize: 16,
  },
  switchRow: {
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchPressed: { opacity: 0.9 },
  switchText: {
    color: Colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  switchLink: {
    color: Colors.green,
    fontWeight: '800',
  },
});
