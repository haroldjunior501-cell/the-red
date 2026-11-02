import { StyleSheet } from 'react-native';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';

export const worldMapViewStyles = StyleSheet.create({
  wrap: { backgroundColor: MAP_HUB_COLORS.background, overflow: 'hidden' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 16 },
  err: { color: MAP_HUB_COLORS.textMuted, fontSize: 12, textAlign: 'center' },
});
