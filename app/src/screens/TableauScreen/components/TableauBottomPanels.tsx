import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TABLEAU } from '../../../constants/tableauTheme';

type Stats = {
  points: number;
  goodPicks: number;
  podiums: number;
  accuracy: number;
};

type Props = {
  picksCount: number;
  stats: Stats;
  saving: boolean;
  onCta: () => void;
  onScrollToBracket: () => void;
};

export const TableauBottomPanels = memo(function TableauBottomPanels({
  picksCount,
  stats,
  saving,
  onCta,
  onScrollToBracket,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.pronoCard}>
        <MaterialCommunityIcons name="shield-outline" size={48} color={TABLEAU.textMuted} style={styles.shield} />
        <Text style={styles.pronoTitle}>MON PRONOSTIC</Text>
        <Text style={styles.pronoSub}>Trace le parcours de ta nation match par match jusqu&apos;à la finale.</Text>
        <Pressable style={styles.goldBtn} onPress={onScrollToBracket} disabled={saving}>
          <Text style={styles.goldBtnTxt}>{picksCount > 0 ? 'Continuer mon parcours' : 'Tracer mon parcours'}</Text>
        </Pressable>
        <Pressable style={styles.validateLink} onPress={onCta} disabled={saving}>
          <Text style={styles.validateTxt}>{saving ? 'Enregistrement…' : 'Valider mon parcours'}</Text>
        </Pressable>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>MES STATS</Text>
        <View style={styles.statsGrid}>
          <Stat icon="trophy" label="Points" value={String(stats.points)} />
          <Stat icon="check-circle-outline" label="Bon pronostics" value={String(stats.goodPicks)} />
          <Stat icon="podium" label="Podiums" value={String(stats.podiums)} />
          <Stat icon="target" label="Précision" value={`${stats.accuracy}%`} />
        </View>
      </View>
    </View>
  );
});

function Stat({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <MaterialCommunityIcons name={icon} size={22} color={TABLEAU.gold} />
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  pronoCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: TABLEAU.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TABLEAU.border,
    padding: 16,
    alignItems: 'center',
  },
  shield: { marginBottom: 8, opacity: 0.7 },
  pronoTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 14, color: TABLEAU.text, letterSpacing: 0.5 },
  pronoSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: TABLEAU.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 18,
  },
  goldBtn: {
    backgroundColor: TABLEAU.goldBtn,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  goldBtnTxt: { fontFamily: 'Inter_800ExtraBold', fontSize: 13, color: TABLEAU.goldBtnText },
  validateLink: { marginTop: 10, paddingVertical: 6 },
  validateTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: TABLEAU.link },
  statsCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: TABLEAU.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TABLEAU.border,
    padding: 16,
  },
  statsTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    color: TABLEAU.text,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '46%', alignItems: 'center', gap: 4 },
  statVal: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: TABLEAU.text },
  statLbl: { fontFamily: 'Inter_500Medium', fontSize: 10, color: TABLEAU.textMuted, textAlign: 'center' },
});
