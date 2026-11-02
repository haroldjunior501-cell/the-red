import { StyleSheet } from 'react-native';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';

export const liveScoreBarStyles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(17,24,39,0.95)',
    borderWidth: 1,
    borderColor: MAP_HUB_COLORS.cardBorder,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  team: { flex: 1, color: MAP_HUB_COLORS.text, fontWeight: '800', fontSize: 13 },
  score: { color: MAP_HUB_COLORS.text, fontWeight: '900', fontSize: 18 },
  livePill: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,48,0.2)',
    borderWidth: 1,
    borderColor: MAP_HUB_COLORS.live,
  },
  liveText: { color: MAP_HUB_COLORS.live, fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
});
