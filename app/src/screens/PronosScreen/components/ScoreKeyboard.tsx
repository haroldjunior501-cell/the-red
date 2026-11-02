import React, { memo, useCallback } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { flagEmoji } from '../../../constants/mapHub';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';
import type { PronoDraft, PronoMatch, ScoreSide } from '../../../types/pronos.types';

const KEYS: (number | 'back' | 'ok')[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'back', 0, 'ok'];

export type ScoreKeyboardProps = {
  visible: boolean;
  match: PronoMatch | null;
  draft: PronoDraft;
  activeTeam: ScoreSide;
  onChange: (draft: PronoDraft, nextActive: ScoreSide) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function displayScore(v: number | null): string {
  if (v === null) return '—';
  return String(v);
}

export const ScoreKeyboard = memo(function ScoreKeyboard({
  visible,
  match,
  draft,
  activeTeam,
  onChange,
  onClose,
  onConfirm,
}: ScoreKeyboardProps) {
  const insets = useSafeAreaInsets();

  const handleKey = useCallback(
    (key: number | 'back' | 'ok') => {
      if (!match) return;
      if (key === 'ok') {
        onConfirm();
        return;
      }
      if (key === 'back') {
        if (activeTeam === 'away') {
          onChange({ ...draft, away: null }, 'home');
        } else {
          onChange({ ...draft, home: null }, 'home');
        }
        return;
      }
      if (activeTeam === 'home') {
        onChange({ ...draft, home: key }, 'away');
      } else {
        onChange({ ...draft, away: key }, 'away');
      }
    },
    [activeTeam, draft, match, onChange, onConfirm]
  );

  if (!match) return null;

  const homeFilled = draft.home !== null;
  const awayFilled = draft.away !== null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          <View style={styles.preview}>
            <View style={styles.previewTeam}>
              <Text style={styles.previewFlag}>{flagEmoji(match.homeCode)}</Text>
              <View
                style={[
                  styles.previewBox,
                  homeFilled && styles.previewBoxFilled,
                  activeTeam === 'home' && styles.previewBoxHome,
                ]}
              >
                <Text style={styles.previewScore}>{displayScore(draft.home)}</Text>
              </View>
            </View>
            <Text style={styles.previewSep}>—</Text>
            <View style={styles.previewTeam}>
              <View
                style={[
                  styles.previewBox,
                  awayFilled && styles.previewBoxFilled,
                  activeTeam === 'away' && styles.previewBoxAway,
                ]}
              >
                <Text style={styles.previewScore}>{displayScore(draft.away)}</Text>
              </View>
              <Text style={styles.previewFlag}>{flagEmoji(match.awayCode)}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {KEYS.map((k) => (
              <Pressable
                key={String(k)}
                style={({ pressed }) => [
                  styles.key,
                  k === 'ok' && styles.keyOk,
                  k === 'back' && styles.keyBack,
                  pressed && k !== 'ok' && styles.keyPressed,
                ]}
                onPress={() => handleKey(k)}
              >
                <Text style={[styles.keyTxt, k === 'ok' && styles.keyTxtOk, k === 'back' && styles.keyTxtBack]}>
                  {k === 'back' ? '⌫' : k === 'ok' ? 'OK' : k}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 12,
  },
  previewTeam: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewFlag: { fontSize: 28 },
  previewBox: {
    width: 56,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBoxFilled: {
    backgroundColor: C.blueFillSoft,
    borderColor: C.blueBorder,
  },
  previewBoxHome: {
    backgroundColor: C.blueFill,
    borderColor: C.blue,
    shadowColor: C.blue,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  previewBoxAway: {
    backgroundColor: C.orangeFill,
    borderColor: C.orangeBorder,
  },
  previewScore: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    color: C.text,
    lineHeight: 38,
  },
  previewSep: { fontFamily: 'BebasNeue_400Regular', fontSize: 24, color: C.muted },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingBottom: 4,
  },
  key: {
    width: '30%',
    maxWidth: 112,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: C.blueFill,
    borderColor: C.blueBorder,
  },
  keyBack: { backgroundColor: 'rgba(255,255,255,0.04)' },
  keyOk: {
    backgroundColor: C.blue,
    borderColor: C.blue,
    shadowColor: C.blue,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  keyTxt: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    color: C.text2,
  },
  keyTxtBack: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: C.muted2,
  },
  keyTxtOk: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 16,
    color: C.text,
    letterSpacing: 1,
  },
});
