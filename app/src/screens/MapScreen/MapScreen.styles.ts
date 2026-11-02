import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const mapScreenStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgDeep },
  rootRow: { flex: 1, flexDirection: 'row' },
  mainCol: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
  mapHost: { flex: 1, position: 'relative', backgroundColor: COLORS.bgDeep },

  // ── Bottom panel ──────────────────────────────────────────────────────────
  bottomPanel: {
    height: 310,
    backgroundColor: COLORS.bgDeep,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1F2937',
  },
  tabActive: { backgroundColor: '#2979ff' },
  tabText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  tabTextActive: { color: '#000', fontWeight: '800' },

  panelScroll: { paddingHorizontal: 14, paddingVertical: 8, gap: 10 },
  nationPanelCol: { flex: 1, paddingTop: 8 },
});
