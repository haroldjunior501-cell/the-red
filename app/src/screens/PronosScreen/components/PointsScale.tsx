import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';
import { POINTS } from '../../../services/gamesService';

export const PointsScale = memo(function PointsScale() {
  const { t } = useTranslation();

  const rows = [
    { label: t('pronos.pointsScale.exactLabel'), pts: POINTS.prono_exact_score },
    { label: t('pronos.pointsScale.winnerLabel'), pts: POINTS.prono_winner },
    { label: t('pronos.pointsScale.diffLabel'), pts: POINTS.prono_goal_diff },
    { label: t('pronos.pointsScale.scorerLabel'), pts: POINTS.prono_scorer },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('pronos.pointsScale.title')}</Text>
      <View style={styles.row}>
        {rows.map((r) => (
          <View key={r.label} style={styles.chip}>
            <Text style={styles.pts}>+{r.pts}</Text>
            <Text style={styles.lbl}>{r.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginBottom: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: C.muted, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.border },
  pts: { fontFamily: 'BebasNeue_400Regular', fontSize: 20, color: C.blue2, letterSpacing: 0.5 },
  lbl: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: C.muted2, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
});
