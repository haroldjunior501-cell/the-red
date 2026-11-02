import React, { memo, useMemo } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { flagEmoji } from '../../../constants/mapHub';
import { WC_TROPHY_IMAGE } from '../../../constants/tableauAssets';
import { POINTS } from '../../../services/gamesService';
import { TABLEAU } from '../../../constants/tableauTheme';
import type { BracketPrediction, BracketRound } from '../../../types/games.types';
import type { BracketRounds } from '../../../utils/tableauBracket';
import { getPrediction } from '../../../utils/tableauBracket';
import {
  BRACKET_CARD_WIDTH,
  BRACKET_MATCH_H,
  bracketSlotTop,
  bracketTreeHeight,
  bracketContentHeight,
} from '../../../utils/bracketLayout';
import {
  buildDisplayBracket,
  championTeam,
  type BracketTeam,
  type DisplayBracketMatch,
} from '../../../utils/bracketState';
import { bracketRoundToLegacy } from '../../../utils/tableauBracket';
import { BracketConnectors } from './BracketConnectors';
import { BracketMatchCard } from './BracketMatchCard';

type Props = {
  rounds: BracketRounds;
  predictions: BracketPrediction[];
  saving: boolean;
  submittedAt: number | null;
  onPickWinner: (matchId: string, round: BracketRound, team: BracketTeam) => void;
  onValidate: () => void;
};

function Column({
  label,
  matches,
  roundIndex,
  predictions,
  onPick,
}: {
  label: string;
  matches: DisplayBracketMatch[];
  roundIndex: number;
  predictions: BracketPrediction[];
  onPick: (match: DisplayBracketMatch, team: BracketTeam) => void;
}) {
  const treeH = bracketTreeHeight();
  return (
    <View style={[styles.col, { minHeight: treeH + 40 }]}>
      <Text style={styles.roundLabel}>{label}</Text>
      <View style={{ height: treeH, position: 'relative', width: BRACKET_CARD_WIDTH }}>
        {matches.map((m, idx) => {
          const pick = m.fixtureId ? getPrediction(predictions, m.fixtureId) : undefined;
          return (
            <View
              key={m.fixtureId || `${label}-${idx}`}
              style={[styles.slot, { top: bracketSlotTop(roundIndex, idx), height: BRACKET_MATCH_H + 36 }]}
            >
              <BracketMatchCard
                match={m}
                winnerCode={pick?.predictedWinnerCode}
                onPickTeam={(team) => onPick(m, team)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export const ElimDirecteTab = memo(function ElimDirecteTab({
  rounds,
  predictions,
  saving,
  submittedAt,
  onPickWinner,
  onValidate,
}: Props) {
  const display = useMemo(() => buildDisplayBracket(rounds, predictions), [rounds, predictions]);
  const champion = useMemo(() => championTeam(display, predictions), [display, predictions]);
  const treeH = bracketTreeHeight();
  const contentH = bracketContentHeight();

  const handlePick = (match: DisplayBracketMatch, team: BracketTeam) => {
    if (!match.fixtureId || !match.team1 || !match.team2) return;
    const round = bracketRoundToLegacy(match.round);
    onPickWinner(match.fixtureId, round, team);
  };

  const finalPick = display.final?.fixtureId
    ? getPrediction(predictions, display.final.fixtureId)
    : undefined;

  return (
    <View style={styles.root}>
      <View style={styles.pointsBar}>
        <Text style={styles.pointsTxt}>
          8e +{POINTS.tableau_r16} · Quarts +{POINTS.tableau_quarter} · Demi +{POINTS.tableau_semi} · Finale +{' '}
          {POINTS.tableau_final} · Champion +{POINTS.tableau_champion}
        </Text>
      </View>

      <ScrollView
        style={{ maxHeight: contentH }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
          <View style={styles.bracketRow}>
            <Column
              label="HUITIÈMES"
              matches={display.r16}
              roundIndex={0}
              predictions={predictions}
              onPick={handlePick}
            />
            <BracketConnectors variant="8to4" treeHeight={treeH} />
            <Column
              label="QUARTS"
              matches={display.quarter}
              roundIndex={1}
              predictions={predictions}
              onPick={handlePick}
            />
            <BracketConnectors variant="4to2" treeHeight={treeH} />
            <Column
              label="DEMI-FINALES"
              matches={display.semi}
              roundIndex={2}
              predictions={predictions}
              onPick={handlePick}
            />
            <BracketConnectors variant="2to1" treeHeight={treeH} />
            <View style={[styles.finaleCol, { minHeight: treeH + 40 }]}>
              <Text style={styles.roundLabel}>FINALE</Text>
              <View style={{ height: treeH, position: 'relative', width: BRACKET_CARD_WIDTH }}>
                <View style={[styles.finaleBlock, { top: bracketSlotTop(3, 0) }]}>
                  <Image source={WC_TROPHY_IMAGE} style={styles.trophy} contentFit="cover" />
                  {display.final ? (
                    <BracketMatchCard
                      match={display.final}
                      winnerCode={finalPick?.predictedWinnerCode}
                      onPickTeam={(team) => handlePick(display.final!, team)}
                    />
                  ) : null}
                </View>
              </View>
              {display.third ? (
                <>
                  <Text style={[styles.roundLabel, styles.thirdLabel]}>PETITE FINALE</Text>
                  <BracketMatchCard
                    match={display.third}
                    winnerCode={
                      display.third.fixtureId
                        ? getPrediction(predictions, display.third.fixtureId)?.predictedWinnerCode
                        : undefined
                    }
                    onPickTeam={(team) => handlePick(display.third!, team)}
                  />
                </>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </ScrollView>

      {champion ? (
        <View style={styles.championCard}>
          <Text style={styles.championLbl}>TON CHAMPION</Text>
          <Text style={styles.championFlag}>{flagEmoji(champion.code)}</Text>
          <Text style={styles.championName}>{champion.name}</Text>
        </View>
      ) : null}

      <Pressable style={[styles.validateBtn, saving && styles.validateDisabled]} onPress={onValidate} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#1a1200" />
        ) : (
          <Text style={styles.validateTxt}>{submittedAt ? 'Tableau enregistré ✓' : 'Valider mon tableau'}</Text>
        )}
      </Pressable>
      <Text style={styles.hint}>Tape sur une équipe pour la faire avancer au tour suivant.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  root: { flexGrow: 0 },
  pointsBar: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: TABLEAU.border,
  },
  pointsTxt: { fontFamily: 'Inter_500Medium', fontSize: 10, color: TABLEAU.textMuted, lineHeight: 15 },
  bracketRow: { flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 12, paddingRight: 16 },
  col: { width: BRACKET_CARD_WIDTH + 8, marginRight: 4 },
  finaleCol: { width: BRACKET_CARD_WIDTH + 12 },
  roundLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#334466',
    textAlign: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  thirdLabel: { marginTop: 12 },
  slot: { position: 'absolute', left: 0, right: 0 },
  finaleBlock: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  trophy: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(240, 180, 41, 0.35)',
  },
  championCard: {
    marginTop: 12,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(240, 180, 41, 0.35)',
  },
  championLbl: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 11,
    color: TABLEAU.gold,
    letterSpacing: 1,
    marginBottom: 6,
  },
  championFlag: { fontSize: 36, marginBottom: 4 },
  championName: { fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: TABLEAU.text, letterSpacing: 1 },
  validateBtn: {
    backgroundColor: TABLEAU.goldBtn,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  validateDisabled: { opacity: 0.7 },
  validateTxt: { fontFamily: 'Inter_800ExtraBold', fontSize: 15, color: TABLEAU.goldBtnText },
  hint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: TABLEAU.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
