import { StyleSheet } from 'react-native';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';

export const actionButtonsStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 10,
    justifyContent: 'space-between',
  },
  cell: { width: '22%', minWidth: 72, alignItems: 'center', marginBottom: 8 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: { marginTop: 6, color: MAP_HUB_COLORS.textMuted, fontSize: 10, fontWeight: '800', textAlign: 'center' },
});
