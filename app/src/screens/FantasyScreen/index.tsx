import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { BENCH_SLOT_KEYS } from '../../constants/fantasyPitch';
import type { FantasyPhaseTabKey } from '../../constants/fantasyPitch';
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
import { CaptainPickerBar } from './components/CaptainPickerBar';
import { CaptainSelectModal } from './components/CaptainSelectModal';
import { FantasyHeader } from './components/FantasyHeader';
import { FantasyUnitedBar } from './components/FantasyUnitedBar';
import { PitchView } from './components/PitchView';
import { PlayerListScreen } from './components/PlayerListScreen';
import { SubstitutesCarousel } from './components/SubstitutesCarousel';
import { fantasyStyles as s, saveStyles } from './FantasyScreen.styles';

type PickTarget =
  | { kind: 'xi'; slotKey: FantasySlotKey }
  | { kind: 'bench'; benchKey: FantasyBenchSlotKey };

export default function FantasyScreen() {
  const storeUserId = useUserStore((st) => st.userId);
  const [storageUserId, setStorageUserId] = useState('');
  const [activePhase, setActivePhase] = useState<FantasyPhaseTabKey>('xi');
  const [listOpen, setListOpen] = useState(false);
  const [listPosition, setListPosition] = useState<FantasyListPosition>('ATT');
  const [pickTarget, setPickTarget] = useState<PickTarget | null>(null);
  const [captainModalOpen, setCaptainModalOpen] = useState(false);
  const [captainPickMode, setCaptainPickMode] = useState(false);

  useEffect(() => {
    void ensureFantasyStorageUserId().then(setStorageUserId);
  }, []);

  void storageUserId;
  void storeUserId;

  const { getPool, players: allPlayers, loading: poolLoading } = useFantasyPlayerPool();

  const {
    slots,
    benchArray,
    benchCount,
    captainSlot,
    captainPlayer,
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
  } = useFantasyTeam();

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
      return [...allPlayers].sort((a, b) => b.rating - a.rating);
    }
    return getPool(listPosition);
  }, [allPlayers, getPool, listPosition, pickTarget?.kind]);

  const openPicker = useCallback((target: PickTarget) => {
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
  }, []);

  const closeList = useCallback(() => {
    setListOpen(false);
    setPickTarget(null);
  }, []);

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

  const onSlotLongPress = useCallback(
    (slotKey: FantasySlotKey) => {
      if (slots[slotKey]) {
        openPicker({ kind: 'xi', slotKey });
      }
    },
    [openPicker, slots]
  );

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

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <ScreenAmbience style={{ flex: 1 }}>
        <View style={s.view}>
          <FantasyHeader
            totalPoints={totalPoints}
            activePhase={activePhase}
            onPhaseChange={setActivePhase}
          />
          <FantasyUnitedBar filledCount={filledCount} benchCount={benchCount} />

          <CaptainPickerBar
            captain={captainPlayer}
            pickMode={captainPickMode}
            onPress={onCaptainBarPress}
          />

          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollPad}
            showsVerticalScrollIndicator={false}
          >
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
                {saving ? 'Sauvegarde…' : 'Enregistrer mon XI'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        <CaptainSelectModal
          visible={captainModalOpen}
          slots={slots}
          captainSlot={captainSlot}
          onClose={() => setCaptainModalOpen(false)}
          onSelect={selectCaptain}
        />

        <PlayerListScreen
          visible={listOpen}
          position={listPosition}
          players={listPlayers}
          usedIds={usedIds}
          loading={poolLoading}
          benchMode={pickTarget?.kind === 'bench'}
          hidePrice
          onClose={closeList}
          onSelect={onSelectPlayer}
        />
      </ScreenAmbience>
    </SafeAreaView>
  );
}
