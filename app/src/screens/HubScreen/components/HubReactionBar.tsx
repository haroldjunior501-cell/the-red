import React, { memo, useCallback, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { HUB_COLORS } from '../../../constants/hubGlobe';

const SEND_BLUE = '#1a6fff';
const SCREEN_H = Dimensions.get('window').height;

const QUICK_GROUPS: readonly (readonly string[])[] = [
  ['🔥', '😭', '🤯', '💀', '🎉'],
  ['⚽', '🏆', '🐐', '👑', '🙌'],
  ['🇫🇷', '🇧🇷'],
] as const;

const PICKER_CATEGORIES = [
  {
    title: 'Football',
    emojis: ['⚽', '🏆', '🥅', '🟥', '🟨', '👟', '🥇', '🎽'],
  },
  {
    title: 'Réactions',
    emojis: ['🔥', '😭', '🤯', '😱', '💀', '🎉', '👑', '🐐', '😤', '🙌', '💪', '❤️'],
  },
  {
    title: 'Nations',
    emojis: ['🇫🇷', '🇧🇷', '🇦🇷', '🇩🇪', '🇪🇸', '🇵🇹', '🇯🇵', '🇲🇦'],
  },
] as const;

export type HubReactionBarProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Filtre chat nation — placeholder adapté. */
  nationOnly?: boolean;
};

export const HubReactionBar = memo(function HubReactionBar({
  onSend,
  disabled,
  nationOnly = false,
}: HubReactionBarProps) {
  const [text, setText] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const send = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setText('');
      setPickerOpen(false);
    },
    [disabled, onSend]
  );

  const insertEmoji = useCallback((emoji: string) => {
    setText((prev) => `${prev}${emoji}`);
    setPickerOpen(false);
  }, []);

  const closePicker = useCallback(() => setPickerOpen(false), []);

  return (
    <View style={styles.wrap}>
      {pickerOpen ? (
        <>
          <Pressable style={styles.pickerBackdrop} onPress={closePicker} accessibilityRole="button" accessibilityLabel="Fermer le sélecteur d'emojis" />
          <View style={styles.picker} pointerEvents="box-none">
            {PICKER_CATEGORIES.map((cat) => (
              <View key={cat.title} style={styles.pickerSection}>
                <Text style={styles.pickerSectionTitle}>{cat.title}</Text>
                <View style={styles.pickerGrid}>
                  {cat.emojis.map((emoji) => (
                    <TouchableOpacity
                      key={`${cat.title}-${emoji}`}
                      style={styles.pickerEmojiBtn}
                      onPress={() => insertEmoji(emoji)}
                      disabled={disabled}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.pickerEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickLine}
        contentContainerStyle={styles.quickContent}
        keyboardShouldPersistTaps="handled"
      >
        {QUICK_GROUPS.map((group, gi) => (
          <View key={`g-${gi}`} style={styles.quickGroup}>
            {gi > 0 ? <View style={styles.quickSep} /> : null}
            {group.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.quickBtn}
                onPress={() => send(emoji)}
                disabled={disabled}
                activeOpacity={0.8}
              >
                <Text style={styles.quickEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <View style={styles.inputShell}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={nationOnly ? 'Réagis pour ta nation…' : 'Réagis au match...'}
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.input}
            editable={!disabled}
            onSubmitEditing={() => send(text)}
            returnKeyType="send"
            onFocus={closePicker}
          />
          <TouchableOpacity
            style={styles.emojiInInput}
            onPress={() => setPickerOpen((o) => !o)}
            disabled={disabled}
            activeOpacity={0.8}
            hitSlop={6}
          >
            <Text style={styles.emojiInInputTxt}>😊</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sendBtn} onPress={() => send(text)} disabled={disabled} activeOpacity={0.85}>
          <MaterialCommunityIcons name="arrow-up" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    minHeight: 110,
    backgroundColor: HUB_COLORS.cardBg,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    zIndex: 30,
  },
  pickerBackdrop: {
    position: 'absolute',
    left: -12,
    right: -12,
    bottom: 0,
    height: SCREEN_H,
    zIndex: 1,
  },
  picker: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: '100%',
    marginBottom: 8,
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 12,
    zIndex: 2,
    maxHeight: 220,
  },
  pickerSection: { marginBottom: 10 },
  pickerSectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: HUB_COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pickerEmojiBtn: {
    width: 36,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerEmoji: { fontSize: 18 },
  quickLine: {
    borderRadius: 12,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 10,
    maxHeight: 48,
  },
  quickContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
  },
  quickGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickSep: {
    width: 1,
    height: 22,
    backgroundColor: COLORS.primaryBorder,
    marginHorizontal: 2,
  },
  quickBtn: {
    width: 36,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickEmoji: { fontSize: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    color: HUB_COLORS.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    paddingVertical: 8,
    paddingRight: 4,
  },
  emojiInInput: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiInInputTxt: { fontSize: 18 },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SEND_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
