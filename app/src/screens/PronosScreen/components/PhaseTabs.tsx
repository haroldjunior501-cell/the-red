import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';
import type { PronoPhaseDef } from '../../../constants/pronosPhases';
import type { PronoPhaseKey } from '../../../types/pronos.types';

export type PhaseTabsProps = {
  phases: readonly PronoPhaseDef[];
  activePhase: PronoPhaseKey;
  phasePoints: Record<string, number>;
  onSelect: (phase: PronoPhaseKey) => void;
};

export const PhaseTabs = memo(function PhaseTabs({ phases, activePhase, phasePoints, onSelect }: PhaseTabsProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        bounces
      >
        {phases.map((phase) => {
          const active = phase.key === activePhase;
          const pts = phasePoints[phase.key] ?? 0;
          return (
            <Pressable key={phase.key} style={styles.tab} onPress={() => onSelect(phase.key)}>
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {phase.label}
              </Text>
              {phase.subtitle ? (
                <Text style={[styles.sub, active && styles.subActive]} numberOfLines={1}>
                  {phase.subtitle}
                </Text>
              ) : null}
              <Text style={[styles.pts, active && styles.ptsActive]}>
                {pts > 0 ? `+${pts} pts` : '—'}
              </Text>
              {active ? <View style={styles.activeBar} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  row: { paddingHorizontal: 12, paddingVertical: 12, gap: 4 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 108,
    maxWidth: 160,
    alignItems: 'flex-start',
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
    height: 2,
    backgroundColor: C.blue,
    borderRadius: 1,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: C.muted2,
    marginBottom: 3,
  },
  labelActive: {
    fontFamily: 'Inter_700Bold',
    color: C.text,
  },
  pts: { fontFamily: 'Inter_500Medium', fontSize: 10, color: C.muted },
  ptsActive: { fontFamily: 'Inter_600SemiBold', color: C.blue2 },
  sub: { fontFamily: 'Inter_500Medium', fontSize: 9, color: C.muted, marginTop: 1 },
  subActive: { color: C.muted2 },
});
