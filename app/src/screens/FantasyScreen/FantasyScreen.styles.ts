import { StyleSheet } from 'react-native';
import { FANTASY_THEME as T } from '../../constants/fantasyTheme';

export const fantasyStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bgDeep },
  view: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollPad: { paddingBottom: 28 },
  poolHint: {
    textAlign: 'center',
    fontSize: 10,
    color: T.muted,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  captainHint: {
    textAlign: 'center',
    fontSize: 11,
    color: T.gold,
    fontFamily: 'Inter_600SemiBold',
    marginHorizontal: 16,
    marginBottom: 6,
    marginTop: 4,
  },
});

export const saveStyles = StyleSheet.create({
  err: {
    color: '#ff6b6b',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginHorizontal: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  ok: {
    color: T.green,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginHorizontal: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  save: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
    backgroundColor: T.blue,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: T.glowBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  saveDisabled: { opacity: 0.65 },
  saveTxt: {
    color: T.text,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    letterSpacing: 0.6,
  },
  arenaLink: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 43, 226, 0.35)',
    backgroundColor: 'rgba(139, 43, 226, 0.1)',
  },
  arenaLinkTxt: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 13,
    color: '#a855f7',
    letterSpacing: 0.5,
  },
});
