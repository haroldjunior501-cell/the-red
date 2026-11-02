import React, { memo } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';

export type DateHeaderProps = {
  label: string;
  matchCount: number;
};

export const DateHeader = memo(function DateHeader({ label, matchCount }: DateHeaderProps) {
  const onShare = () => {
    void Share.share({
      message: `Mes pronos GOALYA — ${label} (${matchCount} match${matchCount > 1 ? 's' : ''})`,
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.txt}>{label}</Text>
      <Pressable style={styles.shareBtn} onPress={onShare} hitSlop={8}>
        <Text style={styles.shareTxt}>↗ Partager</Text>
      </Pressable>
      <View style={styles.sep} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: C.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  txt: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.3,
    color: C.text2,
    textTransform: 'capitalize',
  },
  shareBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: C.border,
  },
  shareTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: C.blue2,
  },
  sep: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
