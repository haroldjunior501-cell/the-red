import React, { memo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlayerCard } from '../../../components/fantasy/PlayerCard';
import { ALL_SLOT_KEYS } from '../../../constants/fantasyPitch';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';
import type { FantasySlotKey, FantasyPitchPlayer } from '../../../types/fantasy.types';
import { getPlayerPhoto } from '../../../utils/playerPhoto';

export type CaptainSelectModalProps = {
  visible: boolean;
  slots: Record<FantasySlotKey, FantasyPitchPlayer | null>;
  captainSlot: FantasySlotKey | null;
  onClose: () => void;
  onSelect: (slotKey: FantasySlotKey) => void;
};

export const CaptainSelectModal = memo(function CaptainSelectModal({
  visible,
  slots,
  captainSlot,
  onClose,
  onSelect,
}: CaptainSelectModalProps) {
  const insets = useSafeAreaInsets();
  const starters = ALL_SLOT_KEYS.map((key) => ({ key, player: slots[key] })).filter(
    (x): x is { key: FantasySlotKey; player: FantasyPitchPlayer } => Boolean(x.player)
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Choisir le capitaine</Text>
          <Text style={styles.sub}>Le capitaine marque le double de points</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {starters.map(({ key, player }) => {
              const isCap = captainSlot === key;
              const posLabel = player.position === 'MID' ? 'MIL' : player.position;
              return (
                <Pressable
                  key={key}
                  style={[styles.item, isCap && styles.itemOn]}
                  onPress={() => onSelect(key)}
                >
                  <PlayerCard
                    name={player.shortName}
                    pts={player.pts}
                    photo={getPlayerPhoto(player)}
                    positionLabel={posLabel}
                    size="bench"
                    isCaptain={isCap}
                  />
                  {isCap ? <Text style={styles.selectedLbl}>Capitaine</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>Fermer</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: T.bgDeep,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(240, 180, 41, 0.25)',
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 2,
    color: T.text,
    textAlign: 'center',
  },
  sub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: T.muted2,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  row: {
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  item: {
    alignItems: 'center',
    gap: 6,
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemOn: {
    borderColor: T.gold,
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
  },
  selectedLbl: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: T.gold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  closeTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: T.text2,
  },
});
