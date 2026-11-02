import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { getAuth } from 'firebase/auth';
import { PROFILE_V2 } from '../../constants/profileV2Theme';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { sendPasswordReset } from '../../services/authService';
import {
  fetchUserAccountDoc,
  updateUserDisplayName,
} from '../../services/profileAccountService';
import { useUserStore } from '../../store/useUserStore';
import { ListItem } from './components/ListItem';
import { ProfileSubHeader } from './components/ProfileSubHeader';
import { profileStyles as s } from './profileStyles';
import { PROFILE_FONTS as F } from './profileTypography';

type Nav = StackNavigationProp<HomeStackParamList, 'AccountSettings'>;

function authProviderLabel(providerId: string): string {
  if (providerId.includes('google')) return 'Google';
  if (providerId.includes('apple')) return 'Apple';
  if (providerId.includes('password')) return 'Email & mot de passe';
  return providerId;
}

export default function AccountSettingsScreen() {
  const navigation = useNavigation<Nav>();
  const userId = useUserStore((st) => st.userId);
  const name = useUserStore((st) => st.name);
  const email = useUserStore((st) => st.email);
  const setName = useUserStore((st) => st.setName);

  const [nameDraft, setNameDraft] = useState(name);
  const [savingName, setSavingName] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const authUser = getAuth().currentUser;
  const emailDisplay = authUser?.email ?? email;
  const providers = authUser?.providerData ?? [];
  const canResetPassword = providers.some((p) => p.providerId === 'password') || Boolean(emailDisplay);

  useEffect(() => {
    setNameDraft(name);
  }, [name]);

  useEffect(() => {
    if (!userId) return;
    void fetchUserAccountDoc(userId);
  }, [userId]);

  const saveName = useCallback(async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || !userId) return;
    setSavingName(true);
    try {
      setName(trimmed);
      await updateUserDisplayName(userId, trimmed);
      Alert.alert('Enregistré', 'Ton pseudo a été mis à jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le pseudo.');
    } finally {
      setSavingName(false);
    }
  }, [nameDraft, userId, setName]);

  const onPasswordReset = useCallback(async () => {
    const target = emailDisplay?.trim();
    if (!target) {
      Alert.alert('Email manquant', 'Aucune adresse email associée à ce compte.');
      return;
    }
    setResetBusy(true);
    try {
      await sendPasswordReset(target);
      Alert.alert(
        'Email envoyé',
        `Un lien de réinitialisation a été envoyé à ${target}.`
      );
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Envoi impossible.');
    } finally {
      setResetBusy(false);
    }
  }, [emailDisplay]);

  return (
    <View style={s.root}>
      <ProfileSubHeader title="COMPTE" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>IDENTITÉ</Text>
        <View style={s.listCard}>
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Pseudo</Text>
            <TextInput
              style={styles.input}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Ton pseudo"
              placeholderTextColor={PROFILE_V2.text3}
              maxLength={24}
              autoCapitalize="words"
            />
            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
              onPress={() => void saveName()}
              disabled={savingName || nameDraft.trim() === name.trim()}
            >
              <Text style={styles.saveBtnTxt}>{savingName ? 'Enregistrement…' : 'Enregistrer'}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionLabel}>CONNEXION</Text>
        <View style={s.listCard}>
          <View style={[styles.infoRow, styles.rowBorder]}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="email-outline" size={20} color={PROFILE_V2.text1} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{emailDisplay || '—'}</Text>
            </View>
          </View>
          {providers.map((p, i) => (
            <View
              key={p.providerId}
              style={[styles.infoRow, i < providers.length - 1 || canResetPassword ? styles.rowBorder : undefined]}
            >
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="shield-check-outline" size={20} color={PROFILE_V2.blue2} />
              </View>
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Méthode de connexion</Text>
                <Text style={styles.infoValue}>{authProviderLabel(p.providerId)}</Text>
              </View>
            </View>
          ))}
          {canResetPassword ? (
            <Pressable
              style={({ pressed }) => [styles.infoRow, pressed && styles.rowPressed]}
              onPress={() => void onPasswordReset()}
              disabled={resetBusy}
            >
              <View style={[styles.iconBox, styles.iconGold]}>
                <MaterialCommunityIcons name="lock-reset" size={20} color={PROFILE_V2.gold} />
              </View>
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Mot de passe</Text>
                <Text style={styles.infoSub}>
                  {resetBusy ? 'Envoi en cours…' : 'Recevoir un lien par email'}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={PROFILE_V2.text3} />
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>CLUB</Text>
        <View style={s.listCard}>
          <ListItem
            icon="shield-crown"
            iconTone="gold"
            label="Manchester United"
            subtitle="The Red Devils · Old Trafford"
            isLast
          />
        </View>

        <Text style={styles.hint}>
          Ces informations sont liées à ton compte THE RED.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    letterSpacing: 2.5,
    color: PROFILE_V2.text3,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  fieldBlock: { padding: 16 },
  fieldLabel: { fontFamily: F.semi, fontSize: 11, color: PROFILE_V2.text3, marginBottom: 8 },
  input: {
    fontFamily: F.semi,
    fontSize: 16,
    color: PROFILE_V2.text1,
    borderWidth: 1,
    borderColor: PROFILE_V2.border1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 12,
  },
  saveBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(41,121,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(41,121,255,0.35)',
  },
  saveBtnTxt: { fontFamily: F.bold, fontSize: 13, color: PROFILE_V2.blue2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  rowPressed: { backgroundColor: 'rgba(41,121,255,0.04)' },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(41,121,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(41,121,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGold: {
    backgroundColor: 'rgba(240,180,41,0.08)',
    borderColor: 'rgba(240,180,41,0.12)',
  },
  infoBody: { flex: 1, minWidth: 0 },
  infoLabel: { fontFamily: F.bold, fontSize: 14, color: PROFILE_V2.text1, marginBottom: 2 },
  infoValue: { fontFamily: F.medium, fontSize: 13, color: PROFILE_V2.text2 },
  infoSub: { fontFamily: F.medium, fontSize: 11, color: PROFILE_V2.text3 },
  hint: {
    fontFamily: F.medium,
    fontSize: 12,
    lineHeight: 18,
    color: PROFILE_V2.text3,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 12,
  },
  pressed: { opacity: 0.88 },
});
