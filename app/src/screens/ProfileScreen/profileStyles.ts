import { StyleSheet } from 'react-native';
import { PROFILE_V2 } from '../../constants/profileV2Theme';
import { PROFILE_FONTS as F } from './profileTypography';

export const profileStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PROFILE_V2.bg },
  safe: { flex: 1 },
  scroll: { paddingBottom: 48 },

  heroHeader: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  heroGlow: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    width: 250,
    height: 200,
    borderRadius: 125,
    backgroundColor: 'rgba(41,121,255,0.14)',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: PROFILE_V2.border2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  greeting: {
    fontFamily: F.semi,
    fontSize: 13,
    color: PROFILE_V2.text3,
    marginBottom: 3,
  },
  displayName: {
    fontFamily: F.bebas,
    fontSize: 26,
    letterSpacing: 3,
    color: PROFILE_V2.text1,
    lineHeight: 28,
    marginBottom: 6,
  },
  nationRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  nationName: { fontFamily: F.bold, fontSize: 12, color: PROFILE_V2.blue2 },
  nationDot: { fontFamily: F.semi, fontSize: 11, color: PROFILE_V2.text3 },
  nationRank: { fontFamily: F.semi, fontSize: 11, color: PROFILE_V2.text3 },

  listSection: { marginTop: 14, marginHorizontal: 16 },
  listCard: {
    backgroundColor: PROFILE_V2.card,
    borderWidth: 1,
    borderColor: PROFILE_V2.border1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  legalCard: {
    backgroundColor: PROFILE_V2.card,
    borderWidth: 1,
    borderColor: PROFILE_V2.border1,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 10,
  },

  logoutSection: { marginTop: 12, marginHorizontal: 16 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(229,56,43,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(229,56,43,0.16)',
    borderRadius: 14,
    paddingVertical: 16,
  },
  logoutText: {
    fontFamily: F.bold,
    fontSize: 15,
    letterSpacing: 0.5,
    color: PROFILE_V2.red,
  },

  footer: { alignItems: 'center', paddingTop: 16, paddingBottom: 32 },
  footerTagline: {
    fontFamily: F.bold,
    fontSize: 13,
    color: PROFILE_V2.text3,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  footerCopy: {
    fontFamily: F.medium,
    fontSize: 11,
    color: PROFILE_V2.text3,
    letterSpacing: 0.3,
  },
});
