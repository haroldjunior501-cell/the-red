import { StyleSheet } from 'react-native';
import { TABLEAU } from '../../constants/tableauTheme';

export const tableauStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: TABLEAU.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 2,
    paddingBottom: 4,
    flexGrow: 0,
  },
  back: { padding: 8, width: 44 },
  title: {
    flex: 1,
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    letterSpacing: 2,
    color: TABLEAU.text,
    textAlign: 'center',
  },
  headerSpacer: { width: 44 },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexGrow: 0,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 32,
    flexGrow: 0,
    alignItems: 'stretch',
  },
  center: { paddingVertical: 32, alignItems: 'center' },
  err: { color: '#e5382b', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  ok: { color: '#00e676', fontSize: 11, marginBottom: 8, textAlign: 'center' },
});
