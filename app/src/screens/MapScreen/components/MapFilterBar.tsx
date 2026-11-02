import React, { memo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { MapFilterId } from '../../../store/mapStore';
import { mapFilterBarStyles as s } from './MapFilterBar.styles';

const FILTERS: { id: MapFilterId; label: string }[] = [
  { id: 'tous', label: 'TOUS' },
  { id: 'live', label: 'MATCHS EN DIRECT 🔴' },
  { id: 'fan_zones', label: 'FAN ZONES' },
  { id: 'stades', label: 'STADES' },
  { id: 'tendances', label: 'TENDANCES' },
];

export type MapFilterBarProps = {
  value: MapFilterId;
  onChange: (id: MapFilterId) => void;
};

export const MapFilterBar = memo(function MapFilterBar({ value, onChange }: MapFilterBarProps) {
  return (
    <View style={s.wrap} pointerEvents="box-none">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {FILTERS.map((f) => {
          const active = f.id === value;
          return (
            <Pressable key={f.id} onPress={() => onChange(f.id)} style={[s.chip, active && s.chipActive]}>
              <Text style={[s.chipText, active && s.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});
