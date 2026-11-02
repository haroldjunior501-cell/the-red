import { StyleSheet } from 'react-native';
import { ARENA_THEME as T } from '../../constants/arenaTheme';

export const arenaStyles = StyleSheet.create({
  scroll: { flex: 1 },
  pad: { paddingBottom: 32 },
  center: { paddingVertical: 48, alignItems: 'center' },
  section: { marginTop: 14, paddingHorizontal: 12 },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: T.muted2,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  card: {
    backgroundColor: T.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    padding: 14,
  },
  linkBtn: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  linkBtnTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: T.purpleLight,
    letterSpacing: 0.5,
  },
});
