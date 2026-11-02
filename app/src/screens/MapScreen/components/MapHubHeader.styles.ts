import { StyleSheet } from 'react-native';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';

export const mapHubHeaderStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: MAP_HUB_COLORS.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: MAP_HUB_COLORS.cardBorder,
  },
  logoBlock: { width: 72 },
  logoSmall: { color: MAP_HUB_COLORS.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  logoYear: { color: MAP_HUB_COLORS.primary, fontSize: 20, fontWeight: '900', lineHeight: 22 },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MAP_HUB_COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MAP_HUB_COLORS.cardBorder,
    paddingHorizontal: 8,
    minHeight: 40,
  },
  searchIcon: { marginRight: 4 },
  searchInput: { flex: 1, color: MAP_HUB_COLORS.text, fontSize: 12, paddingVertical: 6 },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { marginLeft: 2 },
});
