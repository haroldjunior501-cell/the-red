import React, { memo, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { flagEmoji } from '../../../constants/mapHub';
import { EmptyState } from '../../../components/EmptyState';
import { countryMeta } from '../../../services/gamesService';
import { WC_TROPHY_IMAGE } from '../../../constants/tableauAssets';
import { POINTS } from '../../../services/gamesService';
import { TABLEAU } from '../../../constants/tableauTheme';
import type { BracketPrediction, BracketRound } from '../../../types/games.types';
import type { BracketRounds } from '../../../utils/tableauBracket';
import { formatKickoffLabel } from '../../../utils/liveMatchUtils';
import {
  buildCountryPath,
  codesMatch,
  firstLossIndex,
  isStepLost,
  isStepWon,
  pathPickForStep,
  pathProgress,
  predictedChampion,
  type CountryPathStep,
} from '../../../utils/countryPath';
import type { BracketTeam } from '../../../utils/bracketState';
import { bracketRoundToLegacy } from '../../../utils/tableauBracket';
import { ElimDirecteTab } from './ElimDirecteTab';

type Props = {
  countryCode: string;
  fixtures: import('../../../types/games.types').GamesFixture[];
  rounds: BracketRounds;
  predictions: BracketPrediction[];
  saving: boolean;
  submittedAt: number | null;
  onPickWinner: (matchId: string, round: BracketRound, team: BracketTeam) => void;
  onValidate: () => void;
};

function PathStepCard({
  step,
  predictions,
  locked,
  onPick,
}: {
  step: CountryPathStep;
  predictions: BracketPrediction[];
  locked: boolean;
  onPick: (team: BracketTeam) => void;
}) {
  const pick = pathPickForStep(predictions, step);
  const won = isStepWon(predictions, step);
  const lost = isStepLost(predictions, step);

  return (
    <View style={[styles.stepCard, locked && styles.stepLocked]}>
      <Text style={styles.stepRound}>{step.roundLabel.toUpperCase()}</Text>
      <Text style={styles.stepDate}>{formatKickoffLabel(step.fixture.kickoffMs)}</Text>
      <Text style={styles.stepHint}>
        {locked ? 'Complète les étapes précédentes' : 'Qui gagne ce match ?'}
      </Text>

      <TeamPick
        team={step.myTeam}
        selected={pick != null && codesMatch(pick.predictedWinnerCode, step.myTeam.code)}
        highlight={!locked}
        label="Ma nation"
        onPress={() => !locked && onPick(step.myTeam)}
      />
      <Text style={styles.vs}>VS</Text>
      <TeamPick
        team={step.opponent}
        selected={pick != null && codesMatch(pick.predictedWinnerCode, step.opponent.code)}
        highlight={!locked}
        label="Adversaire"
        onPress={() => !locked && onPick(step.opponent)}
      />

      {won ? <Text style={styles.stepOk}>✓ Ta nation continue vers le tour suivant</Text> : null}
      {lost ? <Text style={styles.stepOut}>Parcours terminé ici selon ton prono</Text> : null}
    </View>
  );
}

function TeamPick({
  team,
  selected,
  highlight,
  label,
  onPress,
}: {
  team: BracketTeam;
  selected: boolean;
  highlight: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!highlight}
      style={({ pressed }) => [
        styles.teamPick,
        selected && styles.teamPickOn,
        highlight && pressed && styles.teamPickPressed,
        !highlight && styles.teamPickDisabled,
      ]}
    >
      <Text style={styles.teamPickLbl}>{label}</Text>
      <Text style={styles.teamPickFlag}>{flagEmoji(team.code)}</Text>
      <Text style={[styles.teamPickName, selected && styles.teamPickNameOn]} numberOfLines={1}>
        {team.name}
      </Text>
      {selected ? <Text style={styles.check}>✓</Text> : null}
    </Pressable>
  );
}

export const CountryPathTab = memo(function CountryPathTab({
  countryCode,
  fixtures,
  rounds,
  predictions,
  saving,
  submittedAt,
  onPickWinner,
  onValidate,
}: Props) {
  const [showFullBracket, setShowFullBracket] = useState(false);
  const meta = useMemo(() => countryMeta(countryCode), [countryCode]);
  const path = useMemo(() => buildCountryPath(fixtures, countryCode), [fixtures, countryCode]);
  const lossAt = useMemo(() => firstLossIndex(path, predictions), [path, predictions]);
  const progress = pathProgress(path, predictions);
  const champion = useMemo(() => predictedChampion(path, predictions), [path, predictions]);

  const handlePick = (step: CountryPathStep, team: BracketTeam) => {
    const round = bracketRoundToLegacy(step.round);
    onPickWinner(step.fixture.id, round, team);
  };

  if (!countryCode) {
    return (
      <Text style={styles.empty}>Choisis ton pays dans ton profil pour tracer ton parcours.</Text>
    );
  }

  if (!path.length) {
    return (
      <View>
        <EmptyState
          icon="🏆"
          title="Parcours en préparation"
          subtitle={`Aucun match à élimination directe trouvé pour ${meta.name}. Ouvre le tableau mondial ci-dessous ou vérifie ton pays dans le profil.`}
        />
        <Pressable style={styles.linkBtn} onPress={() => setShowFullBracket((v) => !v)}>
          <Text style={styles.linkTxt}>{showFullBracket ? 'Masquer le tableau mondial' : 'Voir le tableau mondial'}</Text>
        </Pressable>
        {showFullBracket ? (
          <ElimDirecteTab
            rounds={rounds}
            predictions={predictions}
            saving={saving}
            submittedAt={submittedAt}
            onPickWinner={onPickWinner}
            onValidate={onValidate}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.heroFlag}>{meta.flag}</Text>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>MON PARCOURS</Text>
          <Text style={styles.heroSub}>
            Trace le chemin de {meta.name} jusqu&apos;à la finale. À chaque étape, choisis si ta nation gagne ou
            s&apos;arrête.
          </Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressLbl}>
          {progress} / {path.length} étape{path.length > 1 ? 's' : ''} validée{progress > 1 ? 's' : ''}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${path.length ? (progress / path.length) * 100 : 0}%` }]} />
        </View>
      </View>

      {path.map((step, idx) => {
        const locked =
          lossAt >= 0 ? idx > lossAt : idx > 0 && !pathPickForStep(predictions, path[idx - 1]);
        return (
          <View key={step.fixture.id} style={styles.stepWrap}>
            {idx > 0 ? <View style={styles.connector} /> : null}
            <PathStepCard
              step={step}
              predictions={predictions}
              locked={locked}
              onPick={(team) => handlePick(step, team)}
            />
          </View>
        );
      })}

      {champion ? (
        <View style={styles.championCard}>
          <Image source={WC_TROPHY_IMAGE} style={styles.trophy} contentFit="cover" />
          <Text style={styles.championLbl}>TON CHAMPION PRÉDIT</Text>
          <Text style={styles.championFlag}>{flagEmoji(champion.code)}</Text>
          <Text style={styles.championName}>{champion.name}</Text>
          <Text style={styles.championPts}>Finale réussie · +{POINTS.tableau_champion} pts si correct</Text>
        </View>
      ) : null}

      <Pressable style={styles.linkBtn} onPress={() => setShowFullBracket((v) => !v)}>
        <Text style={styles.linkTxt}>
          {showFullBracket ? 'Masquer le tableau mondial complet' : 'Voir le tableau mondial complet (optionnel)'}
        </Text>
      </Pressable>
      {showFullBracket ? (
        <ElimDirecteTab
          rounds={rounds}
          predictions={predictions}
          saving={saving}
          submittedAt={submittedAt}
          onPickWinner={onPickWinner}
          onValidate={onValidate}
        />
      ) : (
        <Pressable style={[styles.validateBtn, saving && styles.validateDisabled]} onPress={onValidate} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#1a1200" />
          ) : (
            <Text style={styles.validateTxt}>{submittedAt ? 'Parcours enregistré ✓' : 'Valider mon parcours'}</Text>
          )}
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { flexGrow: 0 },
  hero: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'center' },
  heroFlag: { fontSize: 40 },
  heroText: { flex: 1 },
  heroTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: TABLEAU.text, letterSpacing: 1 },
  heroSub: { fontFamily: 'Inter_500Medium', fontSize: 12, color: TABLEAU.textMuted, lineHeight: 18, marginTop: 4 },
  progressCard: {
    backgroundColor: TABLEAU.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TABLEAU.border,
    padding: 12,
    marginBottom: 16,
  },
  progressLbl: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: TABLEAU.textSoft, marginBottom: 8 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: TABLEAU.shield, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: TABLEAU.gold, borderRadius: 4 },
  stepWrap: { alignItems: 'stretch' },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(41, 121, 255, 0.35)',
    alignSelf: 'center',
    marginVertical: 4,
  },
  stepCard: {
    backgroundColor: '#0a1020',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TABLEAU.border,
    padding: 14,
    marginBottom: 4,
  },
  stepLocked: { opacity: 0.45 },
  stepRound: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 11,
    letterSpacing: 1,
    color: TABLEAU.link,
  },
  stepDate: { fontFamily: 'Inter_500Medium', fontSize: 11, color: TABLEAU.textMuted, marginTop: 4 },
  stepHint: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#334466', marginTop: 6, marginBottom: 10 },
  teamPick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 8,
  },
  teamPickOn: {
    backgroundColor: 'rgba(41, 121, 255, 0.18)',
    borderColor: 'rgba(41, 121, 255, 0.45)',
  },
  teamPickPressed: { opacity: 0.9 },
  teamPickDisabled: { opacity: 0.5 },
  teamPickLbl: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: TABLEAU.textMuted, width: 56 },
  teamPickFlag: { fontSize: 22 },
  teamPickName: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 14, color: TABLEAU.textSoft },
  teamPickNameOn: { color: TABLEAU.text },
  check: { color: '#00e676', fontFamily: 'Inter_800ExtraBold', fontSize: 16 },
  vs: {
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: TABLEAU.textMuted,
    marginVertical: 2,
  },
  stepOk: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#00e676', marginTop: 6 },
  stepOut: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#e5382b', marginTop: 6 },
  championCard: {
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(240, 180, 41, 0.35)',
  },
  trophy: { width: 64, height: 64, borderRadius: 10, marginBottom: 8 },
  championLbl: { fontFamily: 'Inter_800ExtraBold', fontSize: 10, color: TABLEAU.gold, letterSpacing: 1 },
  championFlag: { fontSize: 36 },
  championName: { fontFamily: 'BebasNeue_400Regular', fontSize: 28, color: TABLEAU.text },
  championPts: { fontFamily: 'Inter_500Medium', fontSize: 11, color: TABLEAU.textMuted, marginTop: 4 },
  linkBtn: { paddingVertical: 10, alignItems: 'center' },
  linkTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: TABLEAU.link, textDecorationLine: 'underline' },
  validateBtn: {
    backgroundColor: TABLEAU.goldBtn,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  validateDisabled: { opacity: 0.7 },
  validateTxt: { fontFamily: 'Inter_800ExtraBold', fontSize: 15, color: TABLEAU.goldBtnText },
  empty: { fontFamily: 'Inter_500Medium', fontSize: 13, color: TABLEAU.textMuted, lineHeight: 20 },
});
