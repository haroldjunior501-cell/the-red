import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TABLEAU } from '../../../constants/tableauTheme';
import { TableauBottomPanels } from './TableauBottomPanels';

type Stats = {
  points: number;
  goodPicks: number;
  podiums: number;
  accuracy: number;
};

type Props = {
  picksCount: number;
  totalMatches: number;
  submitted: boolean;
  stats: Stats;
  saving: boolean;
  onValidate: () => void;
  onScrollToBracket: () => void;
};

export const TableauApercuTab = memo(function TableauApercuTab({
  picksCount,
  totalMatches,
  submitted,
  stats,
  saving,
  onValidate,
  onScrollToBracket,
}: Props) {
  const pct = totalMatches > 0 ? Math.round((picksCount / totalMatches) * 100) : 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.metricLine}>
        <Text style={styles.metric}>{picksCount}</Text> étape{picksCount > 1 ? 's' : ''} de ton parcours
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.hint}>
        {totalMatches > 0
          ? `${picksCount} / ${totalMatches} étapes · ${pct}%`
          : 'Configure ton pays dans le profil pour tracer ton parcours.'}
      </Text>
      {submitted ? (
        <Text style={styles.ok}>Parcours validé — points crédités à la fin des matchs réels.</Text>
      ) : (
        <Text style={styles.warn}>Passe à l&apos;onglet Mon parcours pour tracer le chemin de ta nation jusqu&apos;à la finale.</Text>
      )}
      <TableauBottomPanels
        picksCount={picksCount}
        stats={stats}
        saving={saving}
        onCta={onValidate}
        onScrollToBracket={onScrollToBracket}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingTop: 4 },
  metricLine: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: TABLEAU.textSoft, marginBottom: 10 },
  metric: { fontFamily: 'BebasNeue_400Regular', fontSize: 32, color: TABLEAU.gold },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: TABLEAU.shield,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: { height: '100%', backgroundColor: TABLEAU.gold, borderRadius: 4 },
  hint: { fontFamily: 'Inter_500Medium', fontSize: 11, color: TABLEAU.textMuted, marginBottom: 12 },
  ok: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#00e676', marginBottom: 8 },
  warn: { fontFamily: 'Inter_500Medium', fontSize: 12, color: TABLEAU.textSoft, marginBottom: 8 },
});
