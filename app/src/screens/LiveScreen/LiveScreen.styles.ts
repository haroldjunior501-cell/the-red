import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const DS = {
  bg: COLORS.bgDeep,
  card: COLORS.card,
  primary: COLORS.primary,
  green: COLORS.primary,
  gold: COLORS.accentGold,
  red: COLORS.live,
  muted: COLORS.textSecondary,
  border: COLORS.borderLight,
  bebas: 'BebasNeue_400Regular' as const,
  inter: 'Inter_700Bold' as const,
} as const;

/** Hauteur tab bar AppTabs — padding scroll sous la barre */
export const LIVE_TAB_BAR_HEIGHT = 72;

export const liveStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.bg },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 12 },
  /** États vides / chargement : occupe l’écran sans bloquer le scroll du contenu long */
  bodyGrow: { flexGrow: 1 },
  rowLayout: { flexDirection: 'row', gap: 0 },
  colLeft: { flex: 0.6, paddingRight: 8 },
  colRight: { flex: 0.4, borderLeftWidth: 1, borderLeftColor: DS.border, paddingLeft: 10 },
  colStack: { gap: 12 },
  center: { flexGrow: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { color: DS.muted, fontSize: 14, textAlign: 'center' },
  errorText: { color: DS.red, fontSize: 14, textAlign: 'center', marginTop: 8 },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DS.green,
  },
  retryTxt: { color: DS.green, fontWeight: '800', fontSize: 13 },
});
