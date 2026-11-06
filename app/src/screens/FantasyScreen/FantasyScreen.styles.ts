import { StyleSheet } from 'react-native';
import { FANTASY_THEME as T } from '../../constants/fantasyTheme';

export const fantasyStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bgDeep },
  view: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollPad: { paddingBottom: 28, flexGrow: 1 },
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
    color: T.blue2,
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
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: T.glowRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  saveDisabled: { opacity: 0.65 },
  saveTxt: {
    color: T.text,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    letterSpacing: 0.8,
  },
  arenaLink: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 225, 34, 0.35)',
    backgroundColor: 'rgba(251, 225, 34, 0.08)',
  },
  arenaLinkTxt: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 13,
    color: T.gold,
    letterSpacing: 0.5,
  },
});
