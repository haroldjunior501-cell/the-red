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
import { COLORS } from '../../../constants/colors';
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
};

function formLetter(c: FormChar): string {
  if (c === 'G') return 'V';
  if (c === 'N') return 'N';
  return 'P';
}

function formColors(c: FormChar) {
  if (c === 'G') return { bg: COLORS.primary, text: COLORS.bg };
  if (c === 'N') return { bg: 'rgba(255,255,255,0.28)', text: COLORS.text };
  return { bg: COLORS.live, text: COLORS.text };
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12} accessibilityLabel="Fermer">
      <MaterialCommunityIcons name="close" size={22} color={COLORS.text} />
    </Pressable>
  );
}

function TeamLogo({ logo, flag, size = 40 }: { logo?: string; flag: string; size?: number }) {
  if (logo) {
    return <Image source={{ uri: logo }} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  return <Text style={{ fontSize: size * 0.85 }}>{flag}</Text>;
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
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  const summary = detail ?? { winsTeam1: 0, draws: 0, winsTeam2: 0, goalsTeam1: 0, goalsTeam2: 0, matches: [] };

  return (
    <>
      <View style={styles.h2hTeams}>
        <View style={styles.h2hTeamCol}>
          <TeamLogo logo={self.logo} flag={self.flag} />
          <Text style={styles.h2hTeamName}>{self.name}</Text>
        </View>
        <View style={styles.h2hTeamCol}>
          <TeamLogo logo={opp.logo} flag={opp.flag} />
          <Text style={[styles.h2hTeamName, { textAlign: 'right' }]}>{opp.name}</Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCol}>
          <Text style={styles.statNum}>{summary.winsTeam1}</Text>
          <Text style={styles.statLbl}>Victoires</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statNum}>{summary.draws}</Text>
          <Text style={styles.statLbl}>Nuls</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statNum}>{summary.winsTeam2}</Text>
          <Text style={styles.statLbl}>Victoires</Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCol}>
          <Text style={styles.statNum}>{summary.goalsTeam1}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statLbl}>Buts</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statNum}>{summary.goalsTeam2}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Matches</Text>

      {summary.matches.length === 0 ? (
        <Text style={styles.empty}>Aucun face-à-face enregistré entre ces deux équipes.</Text>
      ) : (
        summary.matches.map((m) => (
          <View key={m.id} style={styles.matchBlock}>
            <Text style={styles.matchPhase}>{m.phase}</Text>
            {m.dateMs ? (
              <Text style={styles.matchDate}>
                {new Intl.DateTimeFormat('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(m.dateMs))}
              </Text>
            ) : null}
            <View style={styles.matchScoreRow}>
              <Text style={styles.matchTeam} numberOfLines={1}>
                {m.home.name}
              </Text>
              <TeamLogo logo={m.home.logo} flag="" size={28} />
              <Text style={styles.matchScore}>
                {m.goalsHome} - {m.goalsAway}
              </Text>
              <TeamLogo logo={m.away.logo} flag="" size={28} />
              <Text style={[styles.matchTeam, { textAlign: 'right' }]} numberOfLines={1}>
                {m.away.name}
              </Text>
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
  return (
    <View style={styles.formTeamBlock}>
      <View style={styles.formTeamHead}>
        <TeamLogo logo={team.logo} flag={team.flag} size={36} />
        <Text style={styles.formTeamName}>{team.name}</Text>
      </View>
      <Text style={styles.formSub}>5 derniers matches.</Text>
      {matches.length === 0 ? (
        <Text style={styles.empty}>Historique indisponible.</Text>
      ) : (
        matches.map((m, i) => {
          const fc = formColors(m.result);
          return (
            <View key={`${m.label}-${i}`} style={styles.formRow}>
              <View style={[styles.formBadge, { backgroundColor: fc.bg }]}>
                <Text style={[styles.formBadgeT, { color: fc.text }]}>{formLetter(m.result)}</Text>
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
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <FormTeamBlock team={self} matches={formSelf} />
      <View style={styles.divider} />
      <FormTeamBlock team={opp} matches={formOpp} />
    </>
  );
});

const InjuriesBody = memo(function InjuriesBody({
  self,
  opp,
  injuries,
}: {
  self: PreMatchTeamUi;
  opp: PreMatchTeamUi;
  injuries: Injury[];
}) {
  return (
    <>
      <Text style={styles.injIntro}>
        Joueurs indisponibles ou blessés signalés avant le match.
      </Text>
      <View style={styles.injTeamHead}>
        <Text style={styles.injFlag}>{self.flag}</Text>
        <Text style={styles.injTeamName}>{self.name}</Text>
      </View>
      {injuries.length === 0 ? (
        <Text style={styles.empty}>Aucune blessure signalée pour ton équipe.</Text>
      ) : (
        injuries.map((inj, i) => (
          <View key={`${inj.name}-${i}`} style={styles.injRow}>
            <MaterialCommunityIcons name="medical-bag" size={18} color={COLORS.live} />
            <View style={styles.injTexts}>
              <Text style={styles.injName}>{inj.name}</Text>
              {inj.reason ? <Text style={styles.injReason}>{inj.reason}</Text> : null}
            </View>
          </View>
        ))
      )}
      <View style={[styles.divider, { marginTop: 20 }]} />
      <View style={styles.injTeamHead}>
        <Text style={styles.injFlag}>{opp.flag}</Text>
        <Text style={styles.injTeamName}>{opp.name}</Text>
      </View>
      <Text style={styles.empty}>Données adverses bientôt disponibles.</Text>
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
}: PreMatchModalsProps) {
  if (!kind) return null;

  const title =
    kind === 'h2h' ? 'Face-à-face' : kind === 'form' ? 'Forme du moment' : 'Ne joue pas';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <CloseBtn onClose={onClose} />
        </View>
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
          {kind === 'injuries' ? <InjuriesBody self={self} opp={opp} injuries={injuries} /> : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060d1a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '400',
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 0.5,
    flex: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  loader: { paddingVertical: 48, alignItems: 'center' },
  empty: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 20 },
  sectionTitle: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 12 },

  h2hTeams: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 20 },
  h2hTeamCol: { flex: 1, gap: 8 },
  h2hTeamName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  statRow: { flexDirection: 'row', marginBottom: 16 },
  statCol: { flex: 1, alignItems: 'center' },
  statNum: { color: COLORS.text, fontSize: 28, fontWeight: '700' },
  statLbl: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  matchBlock: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  matchPhase: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4 },
  matchDate: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 8 },
  matchScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matchTeam: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: '700' },
  matchScore: { color: COLORS.text, fontSize: 18, fontWeight: '800', minWidth: 52, textAlign: 'center' },

  formTeamBlock: { marginBottom: 8 },
  formTeamHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  formTeamName: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  formSub: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 12 },
  formRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  formBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  formBadgeT: { fontSize: 14, fontWeight: '900' },
  formTexts: { flex: 1 },
  formLabel: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  formMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },

  injIntro: { color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  injTeamHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  injFlag: { fontSize: 22 },
  injTeamName: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  injRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  injTexts: { flex: 1 },
  injName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  injReason: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
});
