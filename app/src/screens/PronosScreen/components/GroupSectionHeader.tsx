import React, { memo } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { GROUP_BORDER_COLORS } from '../../../constants/tableauTheme';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';

export type GroupSectionHeaderProps = {
  label: string;
  teamsLabel: string;
  matchCount: number;
  groupLetter: string;
};

export const GroupSectionHeader = memo(function GroupSectionHeader({
  label,
  teamsLabel,
  matchCount,
  groupLetter,
}: GroupSectionHeaderProps) {
  const border = GROUP_BORDER_COLORS[groupLetter] ?? C.blue;

  const onShare = () => {
    void Share.share({
      message: `Mes pronos GOALYA — ${label} (${matchCount} match${matchCount > 1 ? 's' : ''})`,
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.accent, { backgroundColor: border }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.lbl}>{label}</Text>
          <Text style={styles.count}>
            {matchCount} match{matchCount > 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={styles.teams} numberOfLines={2}>
          {teamsLabel}
        </Text>
        <Pressable style={styles.shareBtn} onPress={onShare} hitSlop={8}>
          <Text style={styles.shareTxt}>↗ Partager</Text>
        </Pressable>
      </View>
      <View style={styles.sep} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    zIndex: 10,
  },
  accent: { width: 3, marginVertical: 10, marginLeft: 12, borderRadius: 2 },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  lbl: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 13,
    letterSpacing: 0.5,
    color: C.text,
  },
  count: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: C.muted },
  teams: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: C.muted2,
    lineHeight: 15,
    marginBottom: 8,
  },
  shareBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: C.border,
  },
  shareTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: C.blue2 },
  sep: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
