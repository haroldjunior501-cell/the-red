import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';

export type FantasyActionRowProps = {
  onTransfers: () => void;
  onSubs?: () => void;
};

export const FantasyActionRow = memo(function FantasyActionRow({ onTransfers, onSubs }: FantasyActionRowProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.sub} onPress={onSubs}>
        <Text style={styles.subTxt}>⇄ Remplaçants</Text>
      </Pressable>
      <Pressable style={styles.transfer} onPress={onTransfers}>
        <Text style={styles.transferTxt}>⇆ Transferts</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  sub: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
  },
  subTxt: { fontFamily: 'Inter_700Bold', fontSize: 12, color: T.text2, letterSpacing: 0.5 },
  transfer: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: T.blue,
    alignItems: 'center',
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  transferTxt: { fontFamily: 'Inter_700Bold', fontSize: 12, color: T.text, letterSpacing: 0.5 },
});
