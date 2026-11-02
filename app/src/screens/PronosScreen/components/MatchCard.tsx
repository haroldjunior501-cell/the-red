import React, { memo, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { flagEmoji } from '../../../constants/mapHub';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';
import { getMatchScheduleStatus, WC2026_MATCHES } from '../../../data/wc2026Matches';
import { POINTS } from '../../../services/gamesService';
import type { Prono } from '../../../types/games.types';
import type { PopularProno, PronoDraft, PronoMatch, ScoreSide } from '../../../types/pronos.types';
import { MatchExtraEvents } from './MatchExtraEvents';
import { PopularPronos } from './PopularPronos';
import { ScoreBoxes } from './ScoreBoxes';

export type MatchCardProps = {
  match: PronoMatch;
  prono: Prono | null;
  draft: PronoDraft;
  popularPronos: PopularProno[];
  selectedPopular: string | null;
  activeScoreSide: ScoreSide | null;
  isEditing: boolean;
  canSubmitMatch: boolean;
  saving: boolean;
  onHomePress: () => void;
  onAwayPress: () => void;
  onSelectPopular: (score: string) => void;
  onSubmit: () => void;
};

function TeamBadge({ code, name }: { code: string; name: string }) {
  return (
    <View style={styles.teamCol}>
      <View style={styles.logo}>
        <Text style={styles.logoEmoji}>{flagEmoji(code, name)}</Text>
      </View>
      <Text style={styles.teamName} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

export const MatchCard = memo(function MatchCard({
  match,
  prono,
  draft,
  popularPronos,
  selectedPopular,
  activeScoreSide,
  isEditing,
  canSubmitMatch,
  saving,
  onHomePress,
  onAwayPress,
  onSelectPopular,
  onSubmit,
}: MatchCardProps) {
  const { t } = useTranslation();
  const submitted = Boolean(prono);
  const filled = draft.home !== null && draft.away !== null;
  const locked = submitted || !canSubmitMatch;
  const ptsLabel = prono?.pointsAwarded ?? POINTS.prono_exact_score;

  const submitLabel = useMemo(() => {
    if (submitted) return t('pronos.registered', { points: ptsLabel });
    if (!canSubmitMatch) return t('pronos.matchStarted');
    if (!filled) return t('pronos.tapScore');
    return t('pronos.validate', { points: POINTS.prono_exact_score });
  }, [canSubmitMatch, filled, ptsLabel, submitted, t]);

  const wc = WC2026_MATCHES.find((m) => m.id === match.id);
  const scheduleStatus = wc ? getMatchScheduleStatus(wc) : 'scheduled';

  const cardStyle = submitted ? styles.cardSubmitted : isEditing ? styles.cardEditing : styles.card;

  const submitStyle = submitted ? styles.btnDone : filled ? styles.btnReady : styles.btnEmpty;
  const submitTxtStyle = submitted ? styles.submitTxtDone : filled ? styles.submitTxtReady : styles.submitTxtEmpty;

  return (
    <View style={cardStyle}>
      <View style={styles.timeRow}>
        <Text style={styles.time}>{match.kickoff_label}</Text>
        {match.group ? <Text style={styles.group}> · {match.group}</Text> : null}
      </View>

      <View style={styles.body}>
        <TeamBadge code={match.homeCode} name={match.homeName} />
        <ScoreBoxes
          homeScore={draft.home}
          awayScore={draft.away}
          activeSide={activeScoreSide}
          locked={locked}
          onHomePress={onHomePress}
          onAwayPress={onAwayPress}
        />
        <TeamBadge code={match.awayCode} name={match.awayName} />
      </View>

      <PopularPronos
        items={popularPronos}
        selectedScore={selectedPopular}
        disabled={locked}
        onSelect={onSelectPopular}
      />

      {!submitted ? <MatchExtraEvents disabled={locked} /> : null}

      <Pressable
        style={[styles.submit, submitStyle, saving && styles.submitSaving]}
        disabled={locked || !filled || saving}
        onPress={onSubmit}
      >
        {saving ? (
          <ActivityIndicator color={C.text} size="small" />
        ) : (
          <Text style={[styles.submitTxt, submitTxtStyle]}>{submitLabel}</Text>
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardEditing: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: 'rgba(51,133,255,0.4)',
    shadowColor: C.blue,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardSubmitted: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.greenBorder,
    shadowColor: C.green,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 16 },
  time: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: C.muted2 },
  group: { fontFamily: 'Inter_500Medium', fontSize: 11, color: C.muted },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(229,56,43,0.15)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e5382b' },
  liveTxt: { fontFamily: 'Inter_800ExtraBold', fontSize: 9, color: '#e5382b', letterSpacing: 0.5 },
  finishedBadge: {
    marginLeft: 'auto',
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: C.muted,
    letterSpacing: 0.5,
  },
  scheduledBadge: {
    marginLeft: 'auto',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: C.blue,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  teamCol: { flex: 1, alignItems: 'center', maxWidth: 92 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logoEmoji: { fontSize: 34 },
  teamName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: C.text2,
    textAlign: 'center',
  },
  submit: {
    marginTop: 14,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnEmpty: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  btnReady: {
    backgroundColor: C.blue,
    borderColor: C.blue,
    shadowColor: C.blue,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnDone: {
    backgroundColor: C.greenBg,
    borderColor: C.greenBorder,
  },
  submitSaving: { opacity: 0.88 },
  submitTxt: { fontFamily: 'Inter_700Bold', fontSize: 13, textAlign: 'center' },
  submitTxtEmpty: { color: C.muted },
  submitTxtReady: { color: C.text },
  submitTxtDone: { color: C.green },
});
