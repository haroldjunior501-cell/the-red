import { StyleSheet } from 'react-native';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';

export const nationViewStyles = StyleSheet.create({
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: MAP_HUB_COLORS.cardBg,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: 1, borderColor: MAP_HUB_COLORS.cardBorder,
    overflow: 'hidden',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: MAP_HUB_COLORS.cardBorder,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 10,
  },
  flag: { fontSize: 32 },
  headerInfo: { flex: 1 },
  nationName: { fontSize: 18, fontWeight: '800', color: MAP_HUB_COLORS.text, letterSpacing: 0.5 },
  supportersCount: { fontSize: 11, color: MAP_HUB_COLORS.textMuted, marginTop: 1 },
  backBtn: { padding: 4 },

  // Force bar
  forceWrap: { paddingHorizontal: 16, marginBottom: 10 },
  forceLabel: { fontSize: 10, fontWeight: '700', color: MAP_HUB_COLORS.textMuted, marginBottom: 4 },
  forceTrack: { height: 8, borderRadius: 4, backgroundColor: MAP_HUB_COLORS.cardBorder },
  forceFill: { height: 8, borderRadius: 4, backgroundColor: MAP_HUB_COLORS.primary },
  forceValueRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  forceValue: { fontSize: 10, fontWeight: '700', color: MAP_HUB_COLORS.primary },
  forceLabel2: { fontSize: 10, color: MAP_HUB_COLORS.textMuted },

  // Gifts row
  giftsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  giftBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: MAP_HUB_COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  giftEmoji: { fontSize: 22 },
  giftLabel: { fontSize: 9, color: MAP_HUB_COLORS.textMuted, marginTop: 2 },

  // Events list
  sectionTitle: {
    fontSize: 10, fontWeight: '800', color: MAP_HUB_COLORS.textMuted,
    paddingHorizontal: 16, marginBottom: 6, letterSpacing: 1,
  },
  eventRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: MAP_HUB_COLORS.cardBorder,
  },
  eventIcon: { fontSize: 16, marginRight: 10, marginTop: 1 },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 12, fontWeight: '700', color: MAP_HUB_COLORS.text },
  eventDesc: { fontSize: 10, color: MAP_HUB_COLORS.textMuted, marginTop: 1 },

  // Stadiums
  stRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: MAP_HUB_COLORS.cardBorder,
  },
  stDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: MAP_HUB_COLORS.primary, marginRight: 12,
  },
  stName: { fontSize: 13, fontWeight: '700', color: MAP_HUB_COLORS.text },
  stCity: { fontSize: 10, color: MAP_HUB_COLORS.textMuted, marginTop: 1 },

  // Tab bar
  tabsRow: { paddingHorizontal: 12, gap: 6, paddingBottom: 2 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: MAP_HUB_COLORS.cardBorder,
  },
  tabActive: { backgroundColor: MAP_HUB_COLORS.primary },
  tabText: { fontSize: 10, fontWeight: '700', color: MAP_HUB_COLORS.textMuted },
  tabTextActive: { color: '#000' },

  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  placeholderText: { fontSize: 12, color: MAP_HUB_COLORS.textMuted, textAlign: 'center' },
});
