import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  CommonActions,
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Animated, { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { PROFILE_V2 } from '../../constants/profileV2Theme';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import type { LegalDocumentKey } from '../../constants/legalUrls';
import { openLegalDocument } from '../../services/legalNavigation';
import {
  fetchUserAccountDoc,
  performSecureLogout,
  pickAndUploadProfilePhoto,
} from '../../services/profileAccountService';
import { fetchUserProfilePhotoUrl } from '../../services/userProfileService';
import { useUserStore } from '../../store/useUserStore';
import { LegalItem } from './components/LegalItem';
import { ListItem } from './components/ListItem';
import { LogoutBottomSheet } from './components/LogoutBottomSheet';
import { NotificationsPage } from './components/NotificationsPage';
import { ProfileAvatar } from './components/ProfileAvatar';
import { HeroGrid } from './components/HeroGrid';
import { profileStyles as s } from './profileStyles';

type Nav = StackNavigationProp<HomeStackParamList, 'Profile'>;

const APP_VERSION = '1.0.0';

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { width: screenW } = useWindowDimensions();

  const userId = useUserStore((st) => st.userId);
  const name = useUserStore((st) => st.name);
  const storeEmail = useUserStore((st) => st.email);
  const photoURL = useUserStore((st) => st.photoURL);
  const countryCode = useUserStore((st) => st.countryCode);
  const clearUser = useUserStore((st) => st.clearUser);
  const setPhotoURL = useUserStore((st) => st.setPhotoURL);
  const setEmail = useUserStore((st) => st.setEmail);

  const { prefs, setPref } = useNotificationPreferences(userId);

  const [remotePhoto, setRemotePhoto] = useState<string | null>(photoURL);
  const [uploading, setUploading] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);

  const notifSlide = useSharedValue(screenW);

  useEffect(() => {
    notifSlide.value = screenW;
  }, [notifSlide, screenW]);

  const displayPhoto = photoURL ?? remotePhoto;
  const firstName = useMemo(() => {
    const n = name.trim() || 'Supporter';
    return n.split(/\s+/)[0] ?? n;
  }, [name]);

  useEffect(() => {
    const authEmail = getAuth().currentUser?.email ?? '';
    if (authEmail) setEmail(authEmail);
    else if (storeEmail) setEmail(storeEmail);
  }, [storeEmail, setEmail]);

  useEffect(() => {
    if (!userId) return;
    void fetchUserAccountDoc(userId);
    if (!photoURL) {
      void fetchUserProfilePhotoUrl(userId).then((url) => {
        if (url) {
          setRemotePhoto(url);
          setPhotoURL(url);
        }
      });
    }
  }, [userId, photoURL, setPhotoURL]);

  const openNotifications = useCallback(() => {
    notifSlide.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
  }, [notifSlide]);

  const closeNotifications = useCallback(() => {
    notifSlide.value = withTiming(screenW, { duration: 320, easing: Easing.in(Easing.cubic) });
  }, [notifSlide, screenW]);

  const handlePickPhoto = useCallback(async () => {
    if (!userId || uploading) return;
    setUploading(true);
    try {
      const url = await pickAndUploadProfilePhoto(userId);
      if (url) {
        setPhotoURL(url);
        setRemotePhoto(url);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo.');
    } finally {
      setUploading(false);
    }
  }, [userId, uploading, setPhotoURL]);

  const resetToSplash = useCallback(() => {
    let nav: NavigationProp<ParamListBase> | undefined = navigation;
    while (nav?.getParent()) nav = nav.getParent();
    nav?.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Splash' }] }));
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    setLogoutBusy(true);
    try {
      await performSecureLogout(userId);
      clearUser();
      await useUserStore.persist.clearStorage();
      setLogoutOpen(false);
      resetToSplash();
    } catch {
      Alert.alert('Erreur', 'Impossible de se déconnecter.');
    } finally {
      setLogoutBusy(false);
    }
  }, [userId, clearUser, resetToSplash]);

  const openLegal = useCallback(
    (key: LegalDocumentKey) => {
      openLegalDocument(navigation, key);
    },
    [navigation]
  );

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <LinearGradient colors={[...PROFILE_V2.headerGrad]} style={styles.heroGrad}>
          <HeroGrid />
          <View style={s.heroGlow} />

          <View style={s.heroHeader}>
            <View style={s.profileRow}>
              <ProfileAvatar
                displayName={name}
                countryCode={countryCode}
                photoUrl={displayPhoto}
                uploading={uploading}
                onEditPress={() => void handlePickPhoto()}
              />
              <View style={styles.info}>
                <Text style={s.greeting}>Salut,</Text>
                <Text style={s.displayName}>{firstName}</Text>
                <View style={s.nationRow}>
                  <MaterialCommunityIcons name="shield-crown" size={14} color={PROFILE_V2.gold} />
                  <Text style={s.nationName}>Manchester United</Text>
                  <Text style={s.nationDot}>·</Text>
                  <Text style={s.nationRank}>Red Devil</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.listSection}>
            <View style={s.listCard}>
              <ListItem
                icon="shield-crown"
                iconTone="gold"
                label="Match Center"
                subtitle="Calendrier Manchester United"
                onPress={() => navigation.getParent()?.navigate('Matches' as never)}
              />
              <ListItem
                icon="bell-outline"
                iconTone="blue"
                label="Notifications"
                subtitle="Choisissez vos alertes"
                onPress={openNotifications}
              />
              <ListItem
                icon="cog-outline"
                iconTone="gold"
                label="Paramètres du compte"
                subtitle="Email et mot de passe"
                onPress={() => navigation.navigate('AccountSettings')}
              />
              <ListItem
                icon="message-text-outline"
                iconTone="green"
                label="Aidez-nous à améliorer"
                subtitle="Envoie tes suggestions"
                badge={{ text: 'Nouveau', tone: 'green' }}
                onPress={() => void Linking.openURL('mailto:support@thered.app?subject=Suggestion%20THE%20RED')}
                isLast
              />
            </View>
          </View>

          <View style={s.legalCard}>
            <LegalItem label="Vie privée" onPress={() => openLegal('privacy')} />
            <LegalItem label="Conditions d'utilisation" onPress={() => openLegal('terms')} />
            <LegalItem
              label="Politique de confidentialité"
              onPress={() => openLegal('privacyPolicy')}
              isLast
            />
          </View>

          <View style={s.logoutSection}>
            <Pressable
              style={({ pressed }) => [s.logoutBtn, pressed && styles.pressed]}
              onPress={() => setLogoutOpen(true)}
            >
              <MaterialCommunityIcons name="logout" size={20} color={PROFILE_V2.red} />
              <Text style={s.logoutText}>Déconnexion</Text>
            </Pressable>
          </View>

          <View style={s.footer}>
            <Text style={s.footerTagline}>Fait pour les fans de Manchester United</Text>
            <Text style={s.footerCopy}>Copyright © 2026 THE RED · Version {APP_VERSION}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <NotificationsPage
        slideX={notifSlide}
        screenWidth={screenW}
        prefs={prefs}
        onBack={closeNotifications}
        onToggle={setPref}
      />

      <LogoutBottomSheet
        visible={logoutOpen}
        busy={logoutBusy}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => void handleLogout()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroGrad: { paddingBottom: 0 },
  info: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.88 },
});
