import { StyleSheet } from 'react-native';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';

export const arenaViewStyles = StyleSheet.create({
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

  // Hero stade
  heroRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 12,
  },
  backBtn: { padding: 4 },
  heroTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: MAP_HUB_COLORS.text, letterSpacing: 0.3 },
  heroIcons: { flexDirection: 'row', gap: 14 },

  // Score bar
  scoreBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,59,48,0.25)', gap: 16,
  },
  scoreTeam: { flex: 1, fontSize: 13, fontWeight: '700', color: MAP_HUB_COLORS.text },
  scoreTeamAway: { textAlign: 'right' },
  scoreCenter: { alignItems: 'center', gap: 2 },
  scoreDigits: { fontSize: 26, fontWeight: '900', color: MAP_HUB_COLORS.text, letterSpacing: 2 },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,59,48,0.15)',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: MAP_HUB_COLORS.live },
  liveText: { fontSize: 9, fontWeight: '800', color: MAP_HUB_COLORS.live },

  // Tabs
  tabsRow: { paddingHorizontal: 12, gap: 6, paddingVertical: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: MAP_HUB_COLORS.cardBorder,
  },
  tabActive: { backgroundColor: MAP_HUB_COLORS.primary },
  tabText: { fontSize: 11, fontWeight: '700', color: MAP_HUB_COLORS.textMuted },
  tabTextActive: { color: '#000' },

  // Bataille
  nationsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  nationBlock: { flex: 1, alignItems: 'center', gap: 4 },
  nationFlag: { fontSize: 28 },
  nationName: { fontSize: 10, fontWeight: '700', color: MAP_HUB_COLORS.textMuted, textAlign: 'center' },
  vsText: { fontSize: 16, fontWeight: '900', color: MAP_HUB_COLORS.primary },
  powerTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: MAP_HUB_COLORS.cardBorder },
  powerFillHome: { height: 6, borderRadius: 3, backgroundColor: MAP_HUB_COLORS.primary },
  powerFillAway: { height: 6, borderRadius: 3, backgroundColor: MAP_HUB_COLORS.accent, alignSelf: 'flex-end' },

  // Gifts
  giftRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  giftBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: MAP_HUB_COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  giftEmoji: { fontSize: 20 },
  giftLabel: { fontSize: 8, color: MAP_HUB_COLORS.textMuted },

  // Events feed
  eventRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: MAP_HUB_COLORS.cardBorder,
  },
  eventIcon: { fontSize: 15, marginRight: 10, marginTop: 1 },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 12, fontWeight: '700', color: MAP_HUB_COLORS.text },
  eventDesc: { fontSize: 10, color: MAP_HUB_COLORS.textMuted, marginTop: 1 },

  // Stats
  statRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: MAP_HUB_COLORS.cardBorder,
  },
  statHome: { width: 48, fontSize: 13, fontWeight: '700', color: MAP_HUB_COLORS.primary },
  statLabel: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: MAP_HUB_COLORS.textMuted },
  statAway: { width: 48, fontSize: 13, fontWeight: '700', color: MAP_HUB_COLORS.accent, textAlign: 'right' },

  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  placeholderText: { fontSize: 12, color: MAP_HUB_COLORS.textMuted, textAlign: 'center', lineHeight: 18 },

  muted: { fontSize: 12, color: MAP_HUB_COLORS.textMuted, textAlign: 'center', padding: 20 },
});
