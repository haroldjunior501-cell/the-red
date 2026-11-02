import React, { memo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SIMULATION_NATIONS } from '../../../constants/simulation';
import type { SimConfig } from '../../../services/simulationService';

type SimStats = {
  messagesPerMinute: number;
  reactionsPerSecond: number;
  activeUsers: number;
};

export type SimulationPanelProps = {
  config: SimConfig;
  stats: SimStats;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  onSpeedChange: (speed: number) => void;
  onTriggerGoal?: () => void;
  onTriggerRedCard: () => void;
  onTriggerChaos: () => void;
  onClean: () => void;
};

export const SimulationPanel = memo(function SimulationPanel({
  config,
  stats,
  isActive,
  onToggle,
  onSpeedChange,
  onTriggerGoal,
  onTriggerRedCard,
  onTriggerChaos,
  onClean,
}: SimulationPanelProps) {
  const [open, setOpen] = useState(false);

  if (typeof __DEV__ === 'undefined' || !__DEV__) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable style={styles.toggle} onPress={() => setOpen((value) => !value)}>
        <Text style={styles.toggleText}>{open ? 'SIM ▾' : 'SIM ▸'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.panel}>
          <View style={styles.row}>
            <Text style={styles.label}>Simulation 500K</Text>
            <Switch value={isActive} onValueChange={onToggle} />
          </View>
          <Text style={styles.meta}>
            {stats.messagesPerMinute}/min · {stats.reactionsPerSecond}/s · {(stats.activeUsers / 1000).toFixed(0)}K actifs
          </Text>
          <View style={styles.speedRow}>
            {[1, 2, 3, 4, 5].map((speed) => (
              <Pressable
                key={speed}
                style={[styles.speedBtn, config.speed === speed && styles.speedBtnActive]}
                onPress={() => onSpeedChange(speed)}
              >
                <Text style={styles.speedText}>x{speed}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.nationList}>
            {SIMULATION_NATIONS.slice(0, 4).map((nation) => (
              <Text key={nation.code} style={styles.nationLine}>
                {nation.flag} {nation.name} · {(nation.users / 1000).toFixed(0)}K
              </Text>
            ))}
          </View>
          <View style={styles.actions}>
            {onTriggerGoal ? (
              <Pressable style={styles.actionBtn} onPress={onTriggerGoal}>
                <Text style={styles.actionText}>⚽ BUT TEST</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.actionBtn} onPress={onTriggerRedCard}>
              <Text style={styles.actionText}>🟥 CARTON ROUGE</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={onTriggerChaos}>
              <Text style={styles.actionText}>☠️ CHAOS MODE</Text>
            </Pressable>
            <Pressable style={styles.cleanBtn} onPress={onClean}>
              <Text style={styles.cleanText}>Nettoyer les données sim</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, bottom: 12, zIndex: 40, elevation: 20 },
  toggle: {
    backgroundColor: 'rgba(6,9,15,0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggleText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#2979ff' },
  panel: {
    marginTop: 8,
    width: 260,
    backgroundColor: 'rgba(6,9,15,0.95)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    gap: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#FFFFFF' },
  meta: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  speedRow: { flexDirection: 'row', gap: 6 },
  speedBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  speedBtnActive: { backgroundColor: 'rgba(41, 121, 255, 0.2)' },
  speedText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#FFFFFF' },
  nationList: { gap: 2 },
  nationLine: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.75)' },
  actions: { gap: 6 },
  actionBtn: {
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#FFFFFF' },
  cleanBtn: { marginTop: 4, alignItems: 'center' },
  cleanText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#2979ff' },
});
