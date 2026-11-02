import React, { memo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useAppPreferencesStore } from '../../../store/useAppPreferencesStore';

export const HubFeedbackSettings = memo(function HubFeedbackSettings() {
  const enabled = useAppPreferencesStore((s) => s.feedbackEnabled);
  const setEnabled = useAppPreferencesStore((s) => s.setFeedbackEnabled);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.row}>
        <Text style={styles.label}>Sons et vibrations</Text>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: '#1f2937', true: 'rgba(41, 121, 255, 0.35)' }}
          thumbColor={enabled ? '#2979ff' : '#9CA3AF'}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 12,
    top: 8,
    zIndex: 18,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(13,18,32,0.82)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
});
