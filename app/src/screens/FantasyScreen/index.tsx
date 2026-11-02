import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { useNavigation } from '@react-navigation/native';
import { navigateToArena } from '../../navigation/navigateToArena';
import { BENCH_SLOT_KEYS } from '../../constants/fantasyPitch';
import type { FantasyPhaseTabKey } from '../../constants/fantasyPitch';
import { useFantasyEconomy } from '../../hooks/useFantasyEconomy';
import { useAggregatedMissionStats } from '../../hooks/useAggregatedMissionStats';
import { useFantasyMissionTracker } from '../../hooks/useFantasyMissionTracker';
import {
  canUseStripeApi,
  canUseStripePayments,
  stripeStatusMessage,
  stripeUnavailableReason,
} from '../../utils/stripeAvailability';
import { useFantasyMarketPrices } from '../../hooks/useFantasyMarketPrices';
import { useFantasyPlayerPool } from '../../hooks/useFantasyPlayerPool';
import { useFantasyTeam } from '../../hooks/useFantasyTeam';
import { ensureFantasyStorageUserId } from '../../services/fantasyService';
import { useUserStore } from '../../store/useUserStore';
import type {
  FantasyBenchSlotKey,
  FantasyListPosition,
  FantasyPitchPlayer,
  FantasySlotKey,
} from '../../types/fantasy.types';
import { BudgetModal } from './components/BudgetModal';
import { CaptainPickerBar } from './components/CaptainPickerBar';
import { CaptainSelectModal } from './components/CaptainSelectModal';
import { FantasyEconomyBar } from './components/FantasyEconomyBar';
import { FantasyBudgetModalWithStripe } from './components/FantasyBudgetModalWithStripe';
import { FantasyHeader } from './components/FantasyHeader';
import { PitchView } from './components/PitchView';
import { PlayerListScreen } from './components/PlayerListScreen';
import { SubstitutesCarousel } from './components/SubstitutesCarousel';
import { fantasyStyles as s, saveStyles } from './FantasyScreen.styles';

const { width: SCREEN_W } = Dimensions.get('window');

type PickTarget =
  | { kind: 'xi'; slotKey: FantasySlotKey }
  | { kind: 'bench'; benchKey: FantasyBenchSlotKey };

export default function FantasyScreen() {
  const navigation = useNavigation();
  const storeUserId = useUserStore((st) => st.userId);
  const userName = useUserStore((st) => st.name);
  const countryCode = useUserStore((st) => st.countryCode) || 'FR';
  const [storageUserId, setStorageUserId] = useState('');
  const [activePhase, setActivePhase] = useState<FantasyPhaseTabKey>('transfer');
  const [listOpen, setListOpen] = useState(false);
  const [listPosition, setListPosition] = useState<FantasyListPosition>('ATT');
  const [pickTarget, setPickTarget] = useState<PickTarget | null>(null);
  const [captainModalOpen, setCaptainModalOpen] = useState(false);
  const [captainPickMode, setCaptainPickMode] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const effectiveUserId = storeUserId?.trim() || storageUserId;

  useEffect(() => {
    void ensureFantasyStorageUserId().then(setStorageUserId);
  }, []);

  const economy = useFantasyEconomy(effectiveUserId);
  const budgetCapM = economy.budgetCapM;
  const loggedIn = Boolean(storeUserId?.trim());
  const stripeCardReady = canUseStripePayments(loggedIn);

  const { getPool, players: allPlayers, loading: poolLoading, source: poolSource } =
    useFantasyPlayerPool();
  const { marketPlayers } = useFantasyMarketPrices(allPlayers);

  const {
    slots,
    benchArray,
    benchCount,
    captainSlot,
    captainPlayer,
    spent,
    remaining,
    filledCount,
    totalPoints,
    saving,
    error,
    saveSuccess,
    assignPlayer,
    assignBenchPlayer,
    clearBenchSlot,
    setCaptain,
    saveTeam,
  } = useFantasyTeam(budgetCapM);

  const missionStats = useAggregatedMissionStats(Boolean(effectiveUserId));
  useFantasyMissionTracker(effectiveUserId, missionStats);

  const usedIds = useMemo(() => {
    const ids = new Set<string>();
    const exceptXi = pickTarget?.kind === 'xi' ? pickTarget.slotKey : undefined;
    const exceptBench = pickTarget?.kind === 'bench' ? pickTarget.benchKey : undefined;
    Object.entries(slots).forEach(([key, p]) => {
      if (p && key !== exceptXi) ids.add(p.id);
    });
    benchArray.forEach((p, i) => {
      const key = BENCH_SLOT_KEYS[i];
      if (p && key !== exceptBench) ids.add(p.id);
    });
    return ids;
  }, [benchArray, pickTarget, slots]);

  const listPlayers = useMemo(() => {
    if (pickTarget?.kind === 'bench') {
      return [...marketPlayers].sort((a, b) => b.price - a.price);
    }
    const pool = getPool(listPosition);
    const byId = new Map(marketPlayers.map((p) => [p.id, p]));
    return pool.map((p) => byId.get(p.id) ?? p);
  }, [getPool, listPosition, marketPlayers, pickTarget?.kind]);

  const openPicker = useCallback(
    (target: PickTarget) => {
      if (target.kind === 'xi') {
        const pos: FantasyListPosition = target.slotKey.startsWith('ATT')
          ? 'ATT'
          : target.slotKey.startsWith('MID')
            ? 'MID'
            : target.slotKey.startsWith('DEF')
              ? 'DEF'
              : 'GK';
        setListPosition(pos);
      }
      setPickTarget(target);
      setListOpen(true);
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, friction: 9 }).start();
    },
    [slideAnim]
  );

  const closeList = useCallback(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setListOpen(false);
      setPickTarget(null);
    });
  }, [slideAnim]);

  const onSelectPlayer = useCallback(
    (player: FantasyPitchPlayer) => {
      if (!pickTarget) return;
      let ok = false;
      if (pickTarget.kind === 'xi') {
        ok = assignPlayer(pickTarget.slotKey, player);
      } else {
        ok = assignBenchPlayer(pickTarget.benchKey, player);
      }
      if (ok) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        closeList();
      }
    },
    [assignBenchPlayer, assignPlayer, closeList, pickTarget]
  );

  const onSlotPress = useCallback(
    (slotKey: FantasySlotKey) => {
      if (captainPickMode) {
        setCaptain(slotKey);
        setCaptainPickMode(false);
        return;
      }
      openPicker({ kind: 'xi', slotKey });
    },
    [captainPickMode, openPicker, setCaptain]
  );

  const onSlotLongPress = useCallback((slotKey: FantasySlotKey) => {
    if (slots[slotKey]) {
      openPicker({ kind: 'xi', slotKey });
    }
  }, [openPicker, slots]);

  const onBenchPress = useCallback(
    (index: number) => {
      const benchKey = BENCH_SLOT_KEYS[index];
      if (benchKey) openPicker({ kind: 'bench', benchKey });
    },
    [openPicker]
  );

  const onBenchLongPress = useCallback(
    (index: number) => {
      const benchKey = BENCH_SLOT_KEYS[index];
      if (benchKey && benchArray[index]) {
        clearBenchSlot(benchKey);
      }
    },
    [benchArray, clearBenchSlot]
  );

  const onCaptainBarPress = useCallback(() => {
    if (captainPickMode) {
      setCaptainPickMode(false);
      return;
    }
    if (captainPlayer) {
      setCaptainModalOpen(true);
    } else {
      setCaptainPickMode(true);
    }
  }, [captainPickMode, captainPlayer]);

  const selectCaptain = useCallback(
    (slotKey: FantasySlotKey) => {
      setCaptain(slotKey);
      setCaptainModalOpen(false);
    },
    [setCaptain]
  );

  const terrainTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_W * 0.3],
  });
  const terrainOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const poolHint =
    poolSource === 'network'
      ? 'Joueurs Coupe du monde · FotMob'
      : poolSource === 'cache'
        ? 'Joueurs · cache local'
        : null;

  const onEconomyRefresh = () => {
    void economy.refresh();
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <ScreenAmbience style={{ flex: 1 }}>
      <Animated.View
        style={[s.view, { opacity: terrainOpacity, transform: [{ translateX: terrainTranslate }] }]}
        pointerEvents={listOpen ? 'none' : 'auto'}
      >
        <FantasyHeader
          totalPoints={totalPoints}
          activePhase={activePhase}
          onPhaseChange={setActivePhase}
        />
        <FantasyEconomyBar
          remaining={remaining}
          budgetCapM={budgetCapM}
          filledCount={filledCount}
          spent={spent}
          fantasyPoints={economy.fantasyPoints}
          prestige={economy.prestige}
          onUpgradePress={() => setBudgetModalOpen(true)}
        />

        <CaptainPickerBar
          captain={captainPlayer}
          pickMode={captainPickMode}
          onPress={onCaptainBarPress}
        />

        <ScrollView style={s.scroll} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
          {captainPickMode ? (
            <Text style={s.captainHint}>Touche un titulaire pour le nommer capitaine</Text>
          ) : null}
          <PitchView
            slots={slots}
            captainSlot={captainSlot}
            captainPickMode={captainPickMode}
            onSlotPress={onSlotPress}
            onSlotLongPress={onSlotLongPress}
          />
          <SubstitutesCarousel
            bench={benchArray}
            benchCount={benchCount}
            onTransfers={() => openPicker({ kind: 'xi', slotKey: 'ATT_0' })}
            onBenchPress={onBenchPress}
            onBenchLongPress={onBenchLongPress}
          />
          {filledCount >= 11 ? (
            <Pressable
              style={saveStyles.arenaLink}
              onPress={() => navigateToArena(navigation)}
            >
              <Text style={saveStyles.arenaLinkTxt}>⚔ Voir mon Arena</Text>
            </Pressable>
          ) : null}
          {poolHint ? <Text style={s.poolHint}>{poolHint}</Text> : null}
          {error ? <Text style={saveStyles.err}>{error}</Text> : null}
          {saveSuccess ? <Text style={saveStyles.ok}>{saveSuccess}</Text> : null}
          <Pressable
            style={[saveStyles.save, saving && saveStyles.saveDisabled]}
            disabled={saving}
            onPress={() => {
              void (async () => {
                const ok = await saveTeam();
                if (ok) {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }
              })();
            }}
          >
            <Text style={saveStyles.saveTxt}>
              {saving ? 'Sauvegarde…' : 'Enregistrer mon équipe'}
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>

      <CaptainSelectModal
        visible={captainModalOpen}
        slots={slots}
        captainSlot={captainSlot}
        onClose={() => setCaptainModalOpen(false)}
        onSelect={selectCaptain}
      />

      <PlayerListScreen
        visible={listOpen}
        slideAnim={slideAnim}
        position={listPosition}
        players={listPlayers}
        usedIds={usedIds}
        loading={poolLoading}
        benchMode={pickTarget?.kind === 'bench'}
        onClose={closeList}
        onSelect={onSelectPlayer}
      />

      {effectiveUserId ? (
        <FantasyBudgetModalWithStripe
          visible={budgetModalOpen}
          userId={effectiveUserId}
          economyBusy={economy.loading}
          stripeCardReady={stripeCardReady}
          stripeStatusMessage={stripeStatusMessage(loggedIn)}
          onClose={() => setBudgetModalOpen(false)}
          onEconomyRefresh={onEconomyRefresh}
        />
      ) : (
        <BudgetModal
          visible={budgetModalOpen}
          fantasyPoints={economy.fantasyPoints}
          budgetCapM={budgetCapM}
          busy={economy.loading}
          stripeReady={false}
          stripeStatusMessage={stripeUnavailableReason(loggedIn)}
          onClose={() => setBudgetModalOpen(false)}
          onConvert={() => Alert.alert('Stripe', stripeUnavailableReason(loggedIn))}
          onQuickBoost={() => Alert.alert('Stripe', stripeUnavailableReason(loggedIn))}
          onBuyPack={() => Alert.alert('Stripe', stripeUnavailableReason(loggedIn))}
        />
      )}
      </ScreenAmbience>
    </SafeAreaView>
  );
}
