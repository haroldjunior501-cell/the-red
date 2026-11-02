import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { COUNTRIES } from '../../constants/countries';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useUserStore } from '../../store/useUserStore';
import { signInWithApple, signInWithGoogle } from '../../services/authService';
import { UserAvatar } from '../../components/arena/UserAvatar';

const GOLD = '#FFD700';

export default function ProfileGeneratedScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const name = useUserStore((s) => s.name);
  const countryCode = useUserStore((s) => s.countryCode);
  const kdo = useUserStore((s) => s.kdo);
  const streak = useUserStore((s) => s.streak);
  const userId = useUserStore((s) => s.userId);
  const photoURL = useUserStore((s) => s.photoURL);
  const setUserId = useUserStore((s) => s.setUserId);

  const country = useMemo(() => COUNTRIES.find((c) => c.code === countryCode), [countryCode]);
  const flag = country?.flag ?? '🏳️';
  const [busy, setBusy] = useState<'google' | 'apple' | 'email' | null>(null);

  const progress = 0;

  const bonusPulse = useRef(new Animated.Value(1)).current;
  const giftBounce = useRef(new Animated.Value(1)).current;
  const missionTilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(bonusPulse, {
          toValue: 1.025,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bonusPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [bonusPulse]);

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(giftBounce, {
          toValue: 1.18,
          duration: 550,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(giftBounce, {
          toValue: 1,
          duration: 550,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, [giftBounce]);

  useEffect(() => {
    const tilt = Animated.loop(
      Animated.sequence([
        Animated.timing(missionTilt, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(missionTilt, {
          toValue: -1,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(missionTilt, {
          toValue: 0,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    tilt.start();
    return () => tilt.stop();
  }, [missionTilt]);

  const missionRotate = missionTilt.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <LinearGradient
            colors={['#0a1f14', '#0d3320', '#0b111c']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'rgba(41, 121, 255, 0.10)', 'rgba(0,0,0,0.85)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroTopRow}>
            <View style={styles.flagChip}>
              <Text style={styles.flagChipText}>{flag}</Text>
            </View>
            <View style={styles.avatarCornerOuter}>
              <UserAvatar
                userId={userId}
                displayName={name}
                countryCode={countryCode}
                photoUrl={photoURL}
                size={44}
              />
            </View>
          </View>

          <Text style={styles.heroName}>
            {name} <Text style={styles.heroFlagInline}>{flag}</Text>
          </Text>
          <View style={styles.heroBadges}>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>NOUVEAU TALENT</Text>
            </View>
            <Text style={styles.heroSubtitle}>• COUPE DU MONDE 2026</Text>
          </View>
          <Text style={styles.heroQuote}>Le monde t’attend.{'\n'}Ton histoire commence maintenant.</Text>
        </View>

        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Animated.View
              style={[
                styles.missionIconWrap,
                {
                  transform: [{ rotate: missionRotate }],
                },
              ]}
            >
              <Text style={styles.missionIcon}>🎯</Text>
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Text style={styles.missionOverline}>PROCHAINE MISSION</Text>
              <Text style={styles.missionTitle}>Jouer ton premier match</Text>
            </View>
            <View style={styles.progressBox}>
              <Text style={styles.progressLabel}>PROGRESSION</Text>
              <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚽</Text>
            <Text style={styles.statTitle}>MATCHS JOUÉS</Text>
            <Text style={styles.statBig}>0</Text>
            <Text style={styles.statSmall}>Débuts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statTitle, { color: '#FF6B6B' }]}>SÉRIE ACTUELLE</Text>
            <Text style={styles.statBig}>{streak}</Text>
            <Text style={styles.statSmall}>Entraîne-toi chaque jour</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🪙</Text>
            <Text style={[styles.statTitle, { color: GOLD }]}>RÉCOMPENSES (KDO)</Text>
            <Text style={styles.statBig}>{kdo}</Text>
            <Text style={styles.statSmall}>Ton énergie, ta monnaie</Text>
          </View>
        </View>

        <View style={styles.chapterCardNew}>
          <View style={styles.chapterHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.chapterOverline}>CHAPITRE 1</Text>
              <Text style={styles.chapterHeadline}>LE COUP D’ENVOI</Text>
            </View>
            <View style={styles.trophyWrap}>
              <MaterialCommunityIcons name="trophy" size={56} color={GOLD} />
            </View>
          </View>
          <Text style={styles.chapterTextNew}>
            Le coup d’envoi de ta Coupe du Monde 2026 vient de retentir. {name}, avec {flag} sur le cœur, tu entres
            dans l’aventure GOALYA. Chaque match écrira une ligne de ton journal — émotions, défis et souvenirs à vivre
            en direct.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.moreBtn, pressed && styles.btnPressed]}
            onPress={() => navigation.navigate('AppGuide')}
          >
            <Text style={styles.moreBtnText}>EN SAVOIR PLUS</Text>
            <Text style={styles.moreBtnArrow}>›</Text>
          </Pressable>
        </View>

        <Animated.View style={[styles.bonusCardOuter, { transform: [{ scale: bonusPulse }] }]}>
          <LinearGradient colors={['rgba(255,215,0,0.14)', 'rgba(255,215,0,0.05)']} style={styles.bonusCard}>
            <View style={styles.bonusIcon}>
              <Animated.View style={{ transform: [{ scale: giftBounce }] }}>
                <Text style={styles.bonusGift}>🎁</Text>
              </Animated.View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bonusOverline}>BONUS DÉBLOQUÉ ✨</Text>
              <Text style={styles.bonusAmount}>+{kdo} KDO</Text>
              <Text style={styles.bonusText}>Utilise-les pour personnaliser ton expérience et célébrer ton pays.</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Pressable
          style={({ pressed }) => [styles.primaryCta, pressed && styles.btnPressed, busy && styles.btnDisabled]}
          onPress={() => Alert.alert('Se connecter', 'Choisis Apple ou Google juste en dessous pour sauvegarder.')}
          disabled={!!busy}
        >
          <Text style={styles.primaryCtaEmoji}>🚀</Text>
          <Text style={styles.primaryCtaText}>COMMENCER L’AVENTURE</Text>
          <Text style={styles.primaryCtaArrow}>›</Text>
        </Pressable>

        <View style={styles.loginCard}>
          <Text style={styles.loginOverline}>SE CONNECTER</Text>
          <Text style={styles.loginSub}>Continue ton aventure</Text>

          <Pressable
            style={({ pressed }) => [styles.authBtn, pressed && styles.btnPressed, busy && styles.btnDisabled]}
            onPress={() => navigation.navigate('AuthLogin')}
            disabled={!!busy}
          >
            <View style={styles.authBtnRow}>
              <MaterialCommunityIcons name="email-outline" size={22} color={Colors.green} />
              <Text style={styles.authBtnText}>Continuer avec Email</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.authBtn, pressed && styles.btnPressed, busy && styles.btnDisabled]}
            onPress={async () => {
              if (busy) return;
              try {
                setBusy('google');
                const { userId } = await signInWithGoogle();
                setUserId(userId);
                navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
              } catch (e) {
                Alert.alert('Connexion impossible', e instanceof Error ? e.message : 'Erreur inconnue.');
              } finally {
                setBusy(null);
              }
            }}
            disabled={!!busy}
          >
            {busy === 'google' ? (
              <ActivityIndicator color={Colors.green} />
            ) : (
              <View style={styles.authBtnRow}>
                <AntDesign name="google" size={22} color="#EA4335" />
                <Text style={styles.authBtnText}>Continuer avec Google</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.authBtn, pressed && styles.btnPressed, busy && styles.btnDisabled]}
            onPress={async () => {
              if (busy) return;
              try {
                setBusy('apple');
                const { userId } = await signInWithApple();
                setUserId(userId);
                navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
              } catch (e) {
                Alert.alert('Connexion impossible', e instanceof Error ? e.message : 'Erreur inconnue.');
              } finally {
                setBusy(null);
              }
            }}
            disabled={!!busy}
          >
            {busy === 'apple' ? (
              <ActivityIndicator color={Colors.green} />
            ) : (
              <View style={styles.authBtnRow}>
                <FontAwesome name="apple" size={24} color="#FFFFFF" />
                <Text style={styles.authBtnText}>Continuer avec Apple</Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  hero: {
    marginTop: 10,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.14)',
    backgroundColor: '#07160C',
    padding: 16,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flagChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(12,28,14,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagChipText: { fontSize: 18 },
  avatarCornerOuter: { borderRadius: 999 },
  avatarCornerRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    padding: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  avatarCornerInner: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCornerInitial: {
    color: 'rgba(4,17,8,0.88)',
    fontWeight: '900',
    fontSize: 16,
  },
  heroName: {
    marginTop: 14,
    color: Colors.text,
    fontSize: 46,
    fontWeight: '900',
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 0.5,
  },
  heroFlagInline: { fontSize: 34 },
  heroBadges: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  badgeGreen: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.35)',
    backgroundColor: 'rgba(41, 121, 255, 0.10)',
  },
  badgeGreenText: { color: Colors.green, fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  heroSubtitle: { color: 'rgba(255,255,255,0.70)', fontWeight: '800', fontSize: 12 },
  heroQuote: { marginTop: 10, color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 18 },

  missionCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(12,28,14,0.92)',
    padding: 14,
  },
  missionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  missionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(41, 121, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionIcon: { fontSize: 20 },
  missionOverline: { color: Colors.green, fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  missionTitle: { marginTop: 4, color: Colors.text, fontWeight: '900', fontSize: 16 },
  progressBox: { alignItems: 'flex-end' },
  progressLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  progressPct: { marginTop: 4, color: Colors.green, fontWeight: '900' },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.12)',
  },
  progressFill: { height: '100%', backgroundColor: Colors.green },

  statsGrid: { marginTop: 12, flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(12,28,14,0.92)',
    padding: 12,
  },
  statIcon: { fontSize: 18 },
  statTitle: { marginTop: 8, color: Colors.green, fontWeight: '900', fontSize: 11, letterSpacing: 0.8 },
  statBig: { marginTop: 8, color: Colors.text, fontWeight: '900', fontSize: 22 },
  statSmall: { marginTop: 4, color: Colors.textMuted, fontSize: 11 },

  chapterCardNew: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(12,28,14,0.92)',
    padding: 14,
  },
  chapterHeaderRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  chapterOverline: { color: Colors.green, fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  chapterHeadline: { marginTop: 6, color: Colors.text, fontWeight: '900', fontSize: 18, letterSpacing: 0.3 },
  trophyWrap: {
    width: 96,
    height: 112,
    borderRadius: 16,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.22)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyImage: { width: '92%', height: '92%' },
  chapterTextNew: { marginTop: 12, color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 18 },
  moreBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.20)',
    backgroundColor: 'rgba(41, 121, 255, 0.06)',
  },
  moreBtnText: { color: Colors.green, fontWeight: '900', letterSpacing: 0.9, fontSize: 11 },
  moreBtnArrow: { color: Colors.green, fontSize: 18, marginTop: -2 },

  bonusCardOuter: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.42)',
    overflow: 'hidden',
  },
  bonusCard: {
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  bonusIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.28)',
  },
  bonusGift: { fontSize: 24 },
  bonusOverline: { color: GOLD, fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  bonusAmount: { marginTop: 8, color: GOLD, fontWeight: '900', fontSize: 22 },
  bonusText: { marginTop: 6, color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 16 },

  primaryCta: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.green,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  primaryCtaEmoji: { fontSize: 18 },
  primaryCtaText: { flex: 1, color: '#041108', fontWeight: '900', letterSpacing: 1, fontSize: 13 },
  primaryCtaArrow: { color: '#041108', fontWeight: '900', fontSize: 20, marginTop: -2 },

  loginCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(12,28,14,0.92)',
    padding: 14,
  },
  loginOverline: { color: Colors.textMuted, fontWeight: '900', letterSpacing: 1, fontSize: 12 },
  loginSub: { marginTop: 6, color: 'rgba(255,255,255,0.70)', fontWeight: '800', fontSize: 12, marginBottom: 12 },
  authBtn: {
    width: '100%',
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPressed: {
    opacity: 0.92,
  },
  authBtnText: {
    color: Colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
});
