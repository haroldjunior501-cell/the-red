import React, { memo } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, UNITED_RED } from '../../../constants/colors';
import type { PreMatchModalKind } from '../../../hooks/usePreMatchInsights';
import type { FormChar, FormMatchDetail, H2HDetail, Injury } from '../../../services/footballService';

export type PreMatchTeamUi = {
  name: string;
  code: string;
  flag: string;
  logo?: string;
};

type PreMatchModalsProps = {
  visible: boolean;
  kind: PreMatchModalKind;
  onClose: () => void;
  self: PreMatchTeamUi;
  opp: PreMatchTeamUi;
  h2hDetail: H2HDetail | null;
  h2hLoading: boolean;
  formSelf: FormMatchDetail[];
  formOpp: FormMatchDetail[];
  formLoading: boolean;
  injuries: Injury[];
  injuriesOpp?: Injury[];
};

function formLetter(c: FormChar): string {
  if (c === 'G') return 'V';
  if (c === 'N') return 'N';
  return 'D';
}

function formColors(c: FormChar) {
  if (c === 'G') return { bg: '#1B8A4A', text: '#fff' };
  if (c === 'N') return { bg: 'rgba(255,255,255,0.22)', text: '#fff' };
  return { bg: UNITED_RED, text: '#fff' };
}

function translateReturn(raw?: string): string | undefined {
  if (!raw) return undefined;
  return raw
    .replace('Early November', 'Début novembre')
    .replace('Late November', 'Fin novembre')
    .replace('Mid November', 'Mi-novembre')
    .replace('Early December', 'Début décembre')
    .replace('Mid December', 'Mi-décembre')
    .replace('Late December', 'Fin décembre')
    .replace('Early January', 'Début janvier')
    .replace('Early April', 'Début avril')
    .replace('Mid April', 'Mi-avril')
    .replace('A few days', 'Quelques jours')
    .replace('Unknown', 'Inconnu');
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12} accessibilityLabel="Fermer">
      <MaterialCommunityIcons name="close" size={22} color={COLORS.text} />
    </Pressable>
  );
}

function TeamLogo({ logo, code, size = 40 }: { logo?: string; code: string; size?: number }) {
  if (logo) {
    return (
      <View style={[styles.logoWrap, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
        <Image source={{ uri: logo }} style={{ width: size, height: size }} resizeMode="contain" />
      </View>
    );
  }
  return (
    <View style={[styles.logoFallback, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
      <Text style={[styles.logoFallbackT, { fontSize: Math.max(10, size * 0.32) }]}>{code.slice(0, 3)}</Text>
    </View>
  );
}

function PageHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <CloseBtn onClose={onClose} />
    </View>
  );
}

function TeamSectionHead({ team, caption }: { team: PreMatchTeamUi; caption?: string }) {
  return (
    <View style={styles.teamCard}>
      <TeamLogo logo={team.logo} code={team.code} size={36} />
      <View style={{ flex: 1 }}>
        <Text style={styles.teamCardName}>{team.name}</Text>
        {caption ? <Text style={styles.teamCardCap}>{caption}</Text> : null}
      </View>
      <View style={styles.codePill}>
        <Text style={styles.codePillT}>{team.code}</Text>
      </View>
    </View>
  );
}

const FaceAFaceBody = memo(function FaceAFaceBody({
  self,
  opp,
  detail,
  loading,
}: {
  self: PreMatchTeamUi;
  opp: PreMatchTeamUi;
  detail: H2HDetail | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={UNITED_RED} size="large" />
        <Text style={styles.loaderT}>Chargement du face-à-face…</Text>
      </View>
    );
  }

  const summary = detail ?? {
    winsTeam1: 0,
    draws: 0,
    winsTeam2: 0,
    goalsTeam1: 0,
    goalsTeam2: 0,
    matches: [],
  };
  const total = Math.max(1, summary.winsTeam1 + summary.draws + summary.winsTeam2);

  return (
    <>
      <View style={styles.versusCard}>
        <View style={styles.versusCol}>
          <TeamLogo logo={self.logo} code={self.code} size={48} />
          <Text style={styles.versusName}>{self.name}</Text>
        </View>
        <View style={styles.versusMid}>
          <Text style={styles.versusVs}>H2H</Text>
          <Text style={styles.versusTotal}>{total} matchs</Text>
        </View>
        <View style={[styles.versusCol, { alignItems: 'flex-end' }]}>
          <TeamLogo logo={opp.logo} code={opp.code} size={48} />
          <Text style={[styles.versusName, { textAlign: 'right' }]}>{opp.name}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{summary.winsTeam1}</Text>
          <Text style={styles.statLbl}>Victoires {self.code}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{summary.draws}</Text>
          <Text style={styles.statLbl}>Nuls</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{summary.winsTeam2}</Text>
          <Text style={styles.statLbl}>Victoires {opp.code}</Text>
        </View>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barSeg, { flex: summary.winsTeam1 || 0.01, backgroundColor: UNITED_RED }]} />
        <View style={[styles.barSeg, { flex: summary.draws || 0.01, backgroundColor: 'rgba(255,255,255,0.25)' }]} />
        <View style={[styles.barSeg, { flex: summary.winsTeam2 || 0.01, backgroundColor: '#3B82F6' }]} />
      </View>

      <View style={styles.goalsRow}>
        <Text style={styles.goalsNum}>{summary.goalsTeam1}</Text>
        <Text style={styles.goalsLbl}>Buts marqués (historique)</Text>
        <Text style={styles.goalsNum}>{summary.goalsTeam2}</Text>
      </View>

      <Text style={styles.sectionTitle}>Derniers confrontations</Text>
      {summary.matches.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="soccer-field" size={28} color="rgba(255,255,255,0.35)" />
          <Text style={styles.empty}>Aucun match terminé trouvé entre ces deux clubs.</Text>
        </View>
      ) : (
        summary.matches.map((m) => (
          <View key={m.id} style={styles.matchCard}>
            <View style={styles.matchCardTop}>
              <Text style={styles.matchPhase}>{m.phase}</Text>
              {m.dateMs ? (
                <Text style={styles.matchDate}>
                  {new Intl.DateTimeFormat('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date(m.dateMs))}
                </Text>
              ) : null}
            </View>
            <View style={styles.matchScoreRow}>
              <View style={styles.matchSide}>
                <TeamLogo logo={m.home.logo} code={m.home.name.slice(0, 3).toUpperCase()} size={28} />
                <Text style={styles.matchTeam} numberOfLines={2}>
                  {m.home.name}
                </Text>
              </View>
              <View style={styles.scorePill}>
                <Text style={styles.matchScore}>
                  {m.goalsHome} – {m.goalsAway}
                </Text>
              </View>
              <View style={[styles.matchSide, { alignItems: 'flex-end' }]}>
                <TeamLogo logo={m.away.logo} code={m.away.name.slice(0, 3).toUpperCase()} size={28} />
                <Text style={[styles.matchTeam, { textAlign: 'right' }]} numberOfLines={2}>
                  {m.away.name}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </>
  );
});

const FormTeamBlock = memo(function FormTeamBlock({
  team,
  matches,
}: {
  team: PreMatchTeamUi;
  matches: FormMatchDetail[];
}) {
  const wins = matches.filter((m) => m.result === 'G').length;
  const draws = matches.filter((m) => m.result === 'N').length;
  const losses = matches.filter((m) => m.result === 'P').length;

  return (
    <View style={styles.formBlock}>
      <TeamSectionHead team={team} caption={`${matches.length || 5} derniers matchs · ${wins}V ${draws}N ${losses}D`} />
      <View style={styles.formPillsRow}>
        {matches.slice(0, 5).map((m, i) => {
          const fc = formColors(m.result);
          return (
            <View key={`pill-${i}`} style={[styles.formMiniPill, { backgroundColor: fc.bg }]}>
              <Text style={styles.formMiniPillT}>{formLetter(m.result)}</Text>
            </View>
          );
        })}
      </View>
      {matches.length === 0 ? (
        <Text style={styles.empty}>Historique indisponible.</Text>
      ) : (
        matches.map((m, i) => {
          const fc = formColors(m.result);
          return (
            <View key={`${m.label}-${i}`} style={styles.formRow}>
              <View style={[styles.formBadge, { backgroundColor: fc.bg }]}>
                <Text style={styles.formBadgeT}>{formLetter(m.result)}</Text>
              </View>
              <View style={styles.formTexts}>
                <Text style={styles.formLabel}>{m.label}</Text>
                <Text style={styles.formMeta}>{m.subtitle}</Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
});

const FormeBody = memo(function FormeBody({
  self,
  opp,
  formSelf,
  formOpp,
  loading,
}: {
  self: PreMatchTeamUi;
  opp: PreMatchTeamUi;
  formSelf: FormMatchDetail[];
  formOpp: FormMatchDetail[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={UNITED_RED} size="large" />
        <Text style={styles.loaderT}>Chargement de la forme…</Text>
      </View>
    );
  }

  return (
    <>
      <FormTeamBlock team={self} matches={formSelf} />
      <FormTeamBlock team={opp} matches={formOpp} />
    </>
  );
});

const InjuriesBody = memo(function InjuriesBody({
  self,
  opp,
  injuries,
  injuriesOpp,
}: {
  self: PreMatchTeamUi;
  opp: PreMatchTeamUi;
  injuries: Injury[];
  injuriesOpp: Injury[];
}) {
  const renderList = (list: Injury[]) =>
    list.length === 0 ? (
      <View style={styles.emptyCard}>
        <MaterialCommunityIcons name="check-circle-outline" size={26} color="#1B8A4A" />
        <Text style={styles.empty}>Aucun absent signalé.</Text>
      </View>
    ) : (
      list.map((inj, i) => (
        <View key={`${inj.name}-${i}`} style={styles.injCard}>
          {inj.photo ? (
            <Image source={{ uri: inj.photo }} style={styles.injPhoto} />
          ) : (
            <View style={styles.injIcon}>
              <MaterialCommunityIcons name="medical-bag" size={20} color={UNITED_RED} />
            </View>
          )}
          <View style={styles.injTexts}>
            <Text style={styles.injName}>{inj.name}</Text>
            {inj.reason ? (
              <Text style={styles.injReason}>
                {translateReturn(
                  inj.reason
                    .replace(/^Retour\s*\/\s*motif\s*:\s*/i, '')
                    .replace(/^Retour\s*:\s*/i, '')
                ) ?? inj.reason}
              </Text>
            ) : (
              <Text style={styles.injReason}>Blessure non précisée</Text>
            )}
          </View>
          <MaterialCommunityIcons name="medical-bag" size={18} color="rgba(218,41,28,0.7)" />
        </View>
      ))
    );

  return (
    <>
      <View style={styles.infoBanner}>
        <MaterialCommunityIcons name="information-outline" size={18} color="rgba(255,255,255,0.75)" />
        <Text style={styles.infoBannerT}>
          Absents signalés par FotMob avant le coup d’envoi. Les retours sont indicatifs.
        </Text>
      </View>

      <TeamSectionHead team={self} caption={`${injuries.length} joueur${injuries.length > 1 ? 's' : ''} indisponible${injuries.length > 1 ? 's' : ''}`} />
      {renderList(injuries)}

      <View style={{ height: 18 }} />

      <TeamSectionHead team={opp} caption={`${injuriesOpp.length} joueur${injuriesOpp.length > 1 ? 's' : ''} indisponible${injuriesOpp.length > 1 ? 's' : ''}`} />
      {renderList(injuriesOpp)}
    </>
  );
});

export const PreMatchModals = memo(function PreMatchModals({
  visible,
  kind,
  onClose,
  self,
  opp,
  h2hDetail,
  h2hLoading,
  formSelf,
  formOpp,
  formLoading,
  injuries,
  injuriesOpp = [],
}: PreMatchModalsProps) {
  if (!kind) return null;

  const meta =
    kind === 'h2h'
      ? { title: 'Face-à-face', subtitle: `${self.code} vs ${opp.code} · historique FotMob` }
      : kind === 'form'
        ? { title: 'Forme du moment', subtitle: '5 derniers résultats des deux clubs' }
        : { title: 'Ne joue pas', subtitle: 'Blessés et absents confirmés' };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <PageHeader title={meta.title} subtitle={meta.subtitle} onClose={onClose} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {kind === 'h2h' ? (
            <FaceAFaceBody self={self} opp={opp} detail={h2hDetail} loading={h2hLoading} />
          ) : null}
          {kind === 'form' ? (
            <FormeBody self={self} opp={opp} formSelf={formSelf} formOpp={formOpp} loading={formLoading} />
          ) : null}
          {kind === 'injuries' ? (
            <InjuriesBody self={self} opp={opp} injuries={injuries} injuriesOpp={injuriesOpp} />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0c0507' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  headerText: { flex: 1 },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 4 },
  loader: { paddingVertical: 56, alignItems: 'center', gap: 12 },
  loaderT: { color: 'rgba(255,255,255,0.55)', fontSize: 13 },
  empty: { color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
  },

  logoWrap: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallback: {
    backgroundColor: UNITED_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackT: { color: '#fff', fontWeight: '900' },

  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(218,41,28,0.2)',
    marginBottom: 12,
  },
  teamCardName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  teamCardCap: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  codePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(218,41,28,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(218,41,28,0.35)',
  },
  codePillT: { color: UNITED_RED, fontSize: 11, fontWeight: '800' },

  versusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  versusCol: { flex: 1, gap: 8 },
  versusName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  versusMid: { alignItems: 'center', paddingHorizontal: 8 },
  versusVs: { color: UNITED_RED, fontFamily: 'BebasNeue_400Regular', fontSize: 22, letterSpacing: 1 },
  versusTotal: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 },

  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statNum: { color: '#fff', fontSize: 24, fontWeight: '800' },
  statLbl: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4, textAlign: 'center' },
  barTrack: { flexDirection: 'row', height: 8, borderRadius: 999, overflow: 'hidden', marginBottom: 14, gap: 2 },
  barSeg: { height: '100%', borderRadius: 999 },
  goalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 4,
  },
  goalsNum: { color: '#fff', fontSize: 20, fontWeight: '800', minWidth: 36, textAlign: 'center' },
  goalsLbl: { color: 'rgba(255,255,255,0.5)', fontSize: 12, flex: 1, textAlign: 'center' },

  matchCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 10,
  },
  matchCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  matchPhase: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600' },
  matchDate: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  matchScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matchSide: { flex: 1, gap: 6 },
  matchTeam: { color: '#fff', fontSize: 13, fontWeight: '700' },
  scorePill: {
    minWidth: 56,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(218,41,28,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(218,41,28,0.3)',
    alignItems: 'center',
  },
  matchScore: { color: '#fff', fontSize: 15, fontWeight: '800' },

  formBlock: { marginBottom: 18 },
  formPillsRow: { flexDirection: 'row', gap: 6, marginBottom: 12, paddingHorizontal: 2 },
  formMiniPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formMiniPillT: { color: '#fff', fontSize: 12, fontWeight: '900' },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  formBadge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  formBadgeT: { fontSize: 13, fontWeight: '900', color: '#fff' },
  formTexts: { flex: 1 },
  formLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  formMeta: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 3 },

  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  infoBannerT: { flex: 1, color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 18 },
  injCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(218,41,28,0.18)',
    marginBottom: 8,
  },
  injIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(218,41,28,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  injPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  injTexts: { flex: 1 },
  injName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  injReason: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 3 },
});
