import { StyleSheet } from 'react-native';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';

export const mapHubSidebarStyles = StyleSheet.create({
  col: {
    width: 76,
    maxWidth: 76,
    overflow: 'hidden',
    backgroundColor: MAP_HUB_COLORS.background,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: MAP_HUB_COLORS.cardBorder,
    paddingTop: 4,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  nav: { gap: 4 },
  navItem: { alignItems: 'center', paddingVertical: 6, paddingHorizontal: 2, borderRadius: 10, marginHorizontal: 4, overflow: 'hidden', width: '100%' },
  navItemActive: { backgroundColor: 'rgba(41, 121, 255, 0.12)' },
  navLabel: { color: MAP_HUB_COLORS.textMuted, fontSize: 9, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  navLabelActive: { color: MAP_HUB_COLORS.text },
  nextCard: {
    marginHorizontal: 6,
    marginTop: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: MAP_HUB_COLORS.cardBg,
    borderWidth: 1,
    borderColor: MAP_HUB_COLORS.cardBorder,
  },
  nextTitle: { color: MAP_HUB_COLORS.textMuted, fontSize: 9, fontWeight: '800', marginBottom: 4 },
  nextTeams: { color: MAP_HUB_COLORS.text, fontSize: 11, fontWeight: '900' },
  nextMeta: { color: MAP_HUB_COLORS.primaryLight, fontSize: 10, fontWeight: '800', marginTop: 4 },
  nextVenue: { color: MAP_HUB_COLORS.textMuted, fontSize: 9, marginTop: 4 },
});
