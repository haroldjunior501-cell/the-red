import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SimulatorLiveEventType } from '../../types/arena.types';

const ICON_SIZE = 18;

type Props = {
  type: SimulatorLiveEventType;
  color?: string;
};

export const EventTypeIcon = memo(function EventTypeIcon({ type, color = '#a78bfa' }: Props) {
  switch (type) {
    case 'goal':
    case 'captain_goal':
      return (
        <MaterialCommunityIcons name="soccer" size={ICON_SIZE} color={color} />
      );
    case 'assist':
      return (
        <MaterialCommunityIcons name="handshake" size={ICON_SIZE} color={color} />
      );
    case 'clean_sheet':
      return (
        <MaterialCommunityIcons name="handball" size={ICON_SIZE} color={color} />
      );
    case 'motm':
      return <Ionicons name="star" size={ICON_SIZE} color={color} />;
    case 'yellow':
      return (
        <MaterialCommunityIcons name="card" size={ICON_SIZE} color="#f0b429" />
      );
    case 'red':
      return (
        <MaterialCommunityIcons name="card" size={ICON_SIZE} color="#e5382b" />
      );
    default:
      return <Ionicons name="ellipse" size={12} color={color} />;
  }
});

export const EventTypeIconWrap = memo(function EventTypeIconWrap(props: Props) {
  return (
    <View style={styles.wrap}>
      <EventTypeIcon {...props} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
