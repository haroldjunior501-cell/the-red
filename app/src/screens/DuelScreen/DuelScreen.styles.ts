import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const duelStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  body: { padding: 16, paddingBottom: 32, flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  back: { padding: 8 },
  title: { flex: 1, fontFamily: 'BebasNeue_400Regular', fontSize: 28, letterSpacing: 2, color: COLORS.text },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
  },
  vs: { fontFamily: 'BebasNeue_400Regular', fontSize: 36, color: COLORS.primary, marginVertical: 12 },
  name: { color: COLORS.text, fontFamily: 'Inter_800ExtraBold', fontSize: 16 },
  flag: { fontSize: 32, marginBottom: 8 },
  sub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 20 },
  cta: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaTxt: { color: COLORS.bg, fontFamily: 'Inter_800ExtraBold', fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  err: { color: COLORS.live, fontSize: 13, marginTop: 12, textAlign: 'center' },
});
