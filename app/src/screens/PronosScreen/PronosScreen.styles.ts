import { StyleSheet } from 'react-native';
import { PRONO_COLORS as C } from '../../constants/pronosColors';

/** Alias local — palette Pronos uniquement. */
export const COLORS = C;

export const pronosScreenStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  ambience: { flex: 1 },
  headerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLine: {
    height: 1,
    marginHorizontal: 24,
    backgroundColor: 'rgba(51,133,255,0.5)',
    opacity: 0.85,
  },
  back: { padding: 4, marginRight: 4 },
  title: {
    flex: 1,
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 3,
    color: C.text,
  },
  scheduleBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(51,133,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(51,133,255,0.18)',
  },
  scheduleBannerTxt: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 16,
    color: C.muted2,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  center: { paddingVertical: 48, alignItems: 'center' },
  err: {
    color: '#ff8a80',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  empty: {
    color: C.muted2,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    lineHeight: 22,
  },
});
