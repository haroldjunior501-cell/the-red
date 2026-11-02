import { StyleSheet } from 'react-native';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';

export const mapFilterBarStyles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 8, zIndex: 4, paddingHorizontal: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(17,24,39,0.88)',
    borderWidth: 1,
    borderColor: MAP_HUB_COLORS.cardBorder,
  },
  chipActive: {
    borderColor: MAP_HUB_COLORS.primary,
    backgroundColor: 'rgba(41, 121, 255, 0.12)',
  },
  chipText: { color: MAP_HUB_COLORS.textMuted, fontSize: 11, fontWeight: '800' },
  chipTextActive: { color: MAP_HUB_COLORS.text },
});
