import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BUDGET_CONVERSIONS,
  bonusBadgeStyle,
  FP_PACKS,
  type BudgetConversion,
  type FpPackDef,
  type FpPackId,
} from '../../../constants/fantasyEconomy';
import { BACKGROUND_GRADIENT, COLORS, PRIMARY_BUTTON_GRADIENT } from '../../../constants/colors';
import { QUICK_BOOSTS, type QuickBoostDef, type QuickBoostId } from '../../../constants/quickBoosts';
import { PaymentBrandIcons } from './PaymentBrandIcons';

const { width: SW } = Dimensions.get('window');
const PACK_W = (SW - 48 - 16) / 3;
const CONV_CARD_W = 88;

type Props = {
  visible: boolean;
  fantasyPoints: number;
  budgetCapM: number;
  busy: boolean;
  balanceSyncing?: boolean;
  stripeReady: boolean;
  stripeStatusMessage?: string;
  onClose: () => void;
  onConvert: (fp: number, gain: number) => void;
  onQuickBoost?: (boostId: QuickBoostId) => void;
  onBuyPack?: (packId: FpPackId) => void;
};

function FloatingCoins() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <Animated.Text style={[styles.coinsArt, { transform: [{ translateY }] }]}>
      💎💎 €
    </Animated.Text>
  );
}

function ConversionCard({
  item,
  canAfford,
  busy,
  onConvert,
}: {
  item: BudgetConversion;
  canAfford: boolean;
  busy: boolean;
  onConvert: () => void;
}) {
  const badge = bonusBadgeStyle(item.bonus);
  return (
    <View style={styles.convCard}>
      <View style={styles.convBody}>
        <Text style={styles.convFp}>💎 {item.fp} FP</Text>
        <Text style={styles.convArrow}>↓</Text>
        <Text style={styles.convGain}>+{item.budgetGain}M €</Text>
        <View style={[styles.bonusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.bonusTxt, { color: badge.color }]}>
            {item.bonus > 0 ? `Bonus ${item.bonus}%` : 'Standard'}
          </Text>
        </View>
      </View>
      <Pressable
        style={[styles.convBtn, (!canAfford || busy) && styles.btnOff]}
        disabled={!canAfford || busy}
        onPress={onConvert}
      >
        <Text style={styles.convBtnTxt}>Convertir</Text>
      </Pressable>
    </View>
  );
}

function PackCard({
  pack,
  busy,
  stripeReady,
  onBuy,
}: {
  pack: FpPackDef;
  busy: boolean;
  stripeReady: boolean;
  onBuy?: () => void;
}) {
  const total = pack.fp + pack.bonus;
  return (
    <LinearGradient colors={[...pack.gradient]} style={[styles.packCard, { borderColor: pack.borderColor }]}>
      <View style={[styles.packTopBar, { backgroundColor: pack.topBarColor }]} />
      <View style={styles.packContent}>
        <Text style={[styles.packName, { color: pack.nameColor }]}>{pack.name}</Text>
        <Text style={styles.packGem} numberOfLines={1}>
          {pack.gem}
        </Text>
        <Text style={styles.packFp}>{pack.fp} FP</Text>
        {pack.bonus > 0 ? (
          <View style={styles.packBonusBadge}>
            <Text style={styles.packBonusTxt}>+{pack.bonus} FP offerts</Text>
          </View>
        ) : (
          <View style={styles.packBonusSpacer} />
        )}
        <Text style={styles.packPrice}>{pack.price.toFixed(2).replace('.', ',')} €</Text>
      </View>
      <Pressable
        style={[styles.packBuyBtn, (busy || !stripeReady) && styles.btnOff]}
        disabled={busy || !stripeReady}
        onPress={onBuy}
      >
        <Text style={styles.packBuyTxt}>Acheter</Text>
      </Pressable>
    </LinearGradient>
  );
}

function QuickBoostButton({
  boost,
  busy,
  stripeReady,
  onPress,
}: {
  boost: QuickBoostDef;
  busy: boolean;
  stripeReady: boolean;
  onPress?: () => void;
}) {
  const priceLabel = boost.price.toFixed(2).replace('.', ',');
  return (
    <Pressable
      style={[styles.boostBtnWrap, (busy || !stripeReady) && styles.btnOff]}
      disabled={busy || !stripeReady}
      onPress={onPress}
    >
      <LinearGradient colors={[...PRIMARY_BUTTON_GRADIENT]} style={styles.boostBtn}>
        <Text style={styles.boostGain}>+{boost.gain}M€</Text>
        <Text style={styles.boostPrice}>{priceLabel}€</Text>
      </LinearGradient>
    </Pressable>
  );
}

export const BudgetModal = memo(function BudgetModal({
  visible,
  fantasyPoints,
  budgetCapM,
  busy,
  balanceSyncing,
  stripeReady,
  stripeStatusMessage,
  onClose,
  onConvert,
  onQuickBoost,
  onBuyPack,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <LinearGradient
            colors={[...BACKGROUND_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.gridOverlay} pointerEvents="none" />

          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={20} color="#c8d6f0" />
          </Pressable>

          <FloatingCoins />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>AUGMENTER MON BUDGET</Text>
            <Text style={styles.subtitle}>Plus de budget, plus de stars, plus de victoires.</Text>

            <View style={styles.statsBar}>
              <View style={styles.statCol}>
                <Text style={styles.statLbl}>💎 VOS FANTASY POINTS</Text>
                <Text style={styles.statVal}>
                  {balanceSyncing ? '…' : fantasyPoints.toLocaleString('fr-FR')}
                </Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statCol}>
                <Text style={styles.statLbl}>📊 CAP ACTUEL</Text>
                <Text style={[styles.statVal, styles.statGreen]}>
                  {balanceSyncing ? '…' : `${budgetCapM.toFixed(0)}M €`}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>CONVERTIR MES FANTASY POINTS</Text>
            <Text style={styles.sectionSub}>Échange tes FP contre du budget supplémentaire.</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.convScroll}
            >
              {BUDGET_CONVERSIONS.map((c) => (
                <ConversionCard
                  key={c.fp}
                  item={c}
                  canAfford={fantasyPoints >= c.fp}
                  busy={busy}
                  onConvert={() => onConvert(c.fp, c.budgetGain)}
                />
              ))}
            </ScrollView>

            <View style={styles.quickRow}>
              <View style={styles.quickHeader}>
                <Ionicons name="flash" size={16} color="#5b9aff" />
                <View style={styles.quickTextCol}>
                  <Text style={styles.quickTitle}>⚡ AMÉLIORATION RAPIDE</Text>
                  <Text style={styles.quickSub}>Boost instantané · Sans attendre</Text>
                </View>
              </View>
              <View style={styles.boostRow}>
                {QUICK_BOOSTS.map((boost) => (
                  <QuickBoostButton
                    key={boost.id}
                    boost={boost}
                    busy={busy}
                    stripeReady={stripeReady}
                    onPress={onQuickBoost ? () => onQuickBoost(boost.id) : undefined}
                  />
                ))}
              </View>
            </View>

            <View style={styles.shopHeader}>
              <View>
                <Text style={styles.sectionTitle}>ACHETER DES FANTASY POINTS</Text>
                <Text style={styles.sectionSub}>Paiement 100% sécurisé par Stripe.</Text>
              </View>
              <PaymentBrandIcons />
            </View>

            {!stripeReady && stripeStatusMessage ? (
              <Text style={styles.stripeWarn}>{stripeStatusMessage}</Text>
            ) : null}

            <View style={styles.packGrid}>
              {FP_PACKS.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  busy={busy}
                  stripeReady={stripeReady}
                  onBuy={onBuyPack ? () => onBuyPack(pack.id) : undefined}
                />
              ))}
            </View>

            <View style={styles.featuresRow}>
              <Feature icon="infinite" title="Budget illimité" sub="Augmente sans plafond" />
              <Feature icon="trending-up" title="Progression rapide" sub="Meilleurs joueurs" />
              <Feature icon="lock-closed" title="Paiement sécurisé" sub="Stripe · Apple · Carte" />
              <Feature icon="headset" title="Support 24/7" sub="Équipe dédiée" />
            </View>

            <View style={styles.stripeFooter}>
              <Ionicons name="lock-closed" size={12} color="#8aa0be" />
              <Text style={styles.stripeFooterTxt}>
                Paiement sécurisé par Stripe · Vos données sont protégées
              </Text>
            </View>

            {busy ? <ActivityIndicator color="#5b9aff" style={{ marginTop: 12 }} /> : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

function Feature({
  icon,
  title,
  sub,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  sub: string;
}) {
  return (
    <View style={styles.feature}>
      <Ionicons name={icon} size={16} color="#5b9aff" />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '94%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255,0.25)',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.15)',
  },
  scroll: { paddingHorizontal: 16, paddingTop: 44, paddingBottom: 28 },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinsArt: {
    position: 'absolute',
    top: 14,
    right: 52,
    fontSize: 28,
    zIndex: 5,
    textShadowColor: 'rgba(255,184,0,0.45)',
    textShadowRadius: 10,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 4,
    color: '#f0ecff',
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#8aa0be',
    marginBottom: 14,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(41, 121, 255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255,0.22)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  statCol: { flex: 1, alignItems: 'center', gap: 4 },
  statSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 8 },
  statLbl: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    letterSpacing: 1,
    color: '#8aa0be',
    textTransform: 'uppercase',
  },
  statVal: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    color: '#fff',
    letterSpacing: 1,
  },
  statGreen: { color: '#00e87a' },
  sectionTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 11,
    letterSpacing: 2.5,
    color: '#c8d6f0',
    textTransform: 'uppercase',
  },
  sectionSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#8aa0be',
    marginTop: 4,
    marginBottom: 10,
  },
  convScroll: { gap: 10, paddingBottom: 8, paddingRight: 4, alignItems: 'stretch' },
  convCard: {
    width: CONV_CARD_W,
    minHeight: 158,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(14,22,42,0.95)',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convBody: { alignItems: 'center', gap: 5, width: '100%' },
  convFp: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#a855f7', textAlign: 'center' },
  convArrow: { fontSize: 11, color: '#5a7090', lineHeight: 14 },
  convGain: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 19,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  bonusBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginTop: 2 },
  bonusTxt: { fontFamily: 'Inter_700Bold', fontSize: 8, textAlign: 'center' },
  convBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  convBtnTxt: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff' },
  btnOff: { opacity: 0.4 },
  quickRow: {
    marginTop: 16,
    marginBottom: 18,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    gap: 12,
  },
  quickHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  quickTextCol: { flex: 1, gap: 4 },
  quickTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#e8f0ff' },
  quickSub: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#8aa0be', lineHeight: 15 },
  boostRow: { flexDirection: 'row', gap: 8 },
  boostBtnWrap: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  boostBtn: { paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', gap: 2 },
  boostGain: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.5,
  },
  boostPrice: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#8aa0be' },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stripeWarn: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#ffb800',
    marginBottom: 10,
  },
  packGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  packCard: {
    width: PACK_W,
    minHeight: 176,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'stretch',
    overflow: 'hidden',
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  packTopBar: { width: '100%', height: 3 },
  packContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingTop: 6,
    gap: 3,
    width: '100%',
  },
  packName: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 9,
    letterSpacing: 2,
    textAlign: 'center',
  },
  packGem: {
    fontSize: 12,
    lineHeight: 16,
    marginVertical: 2,
    textAlign: 'center',
    letterSpacing: -0.5,
    maxWidth: '100%',
  },
  packFp: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  packBonusBadge: {
    backgroundColor: 'rgba(0,232,122,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginVertical: 2,
  },
  packBonusTxt: { fontFamily: 'Inter_700Bold', fontSize: 7, color: '#00e87a', textAlign: 'center' },
  packBonusSpacer: { height: 16 },
  packPrice: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 2,
  },
  packBuyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  packBuyTxt: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff' },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  feature: { width: '47%', gap: 4, marginBottom: 8 },
  featureTitle: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#c8d6f0' },
  featureSub: { fontFamily: 'Inter_500Medium', fontSize: 9, color: '#5a7090' },
  stripeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  stripeFooterTxt: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#8aa0be',
  },
});
