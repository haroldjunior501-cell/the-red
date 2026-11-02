import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { EmptyState } from '../../components/EmptyState';
import { PRONO_COLORS as C } from '../../constants/pronosColors';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { draftFromProno, usePronos } from '../../hooks/usePronos';
import type { PronoDraft, PronoMatch, ScoreSide } from '../../types/pronos.types';
import { canSubmitProno } from '../../utils/gamesFixtures';
import { groupMatchesForPhase } from '../../utils/pronosGroupSections';
import { groupLetterFromName } from '../../constants/liveGroups';
import { GroupSectionHeader } from './components/GroupSectionHeader';
import { MatchCard } from './components/MatchCard';
import { NationBar } from './components/NationBar';
import { PhaseTabs } from './components/PhaseTabs';
import { PointsScale } from './components/PointsScale';
import { PronosHeader } from './components/PronosHeader';
import { ScoreKeyboard } from './components/ScoreKeyboard';
import { pronosScreenStyles as s } from './PronosScreen.styles';

function parsePopularScore(score: string): { home: number; away: number } | null {
  const parts = score.split('-').map((x) => Number(x.trim()));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n) || n < 0)) return null;
  return { home: parts[0], away: parts[1] };
}

export default function PronosScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const {
    phases,
    activePhase,
    setActivePhase,
    phasePoints,
    matches,
    saved,
    popularByMatchId,
    loading,
    savingId,
    error,
    submitProno,
    canSubmit,
    nationFlag,
    nationLabel,
    nationPower,
    worldRank,
  } = usePronos();

  const [drafts, setDrafts] = useState<Record<string, PronoDraft>>({});
  const [selectedPopular, setSelectedPopular] = useState<Record<string, string | null>>({});
  const [keyboardMatch, setKeyboardMatch] = useState<PronoMatch | null>(null);
  const [keyboardSide, setKeyboardSide] = useState<ScoreSide>('home');
  const [activeScoreSide, setActiveScoreSide] = useState<Record<string, ScoreSide | null>>({});

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const m of matches) {
        if (saved[m.id]) {
          next[m.id] = draftFromProno(saved[m.id]);
        } else if (!next[m.id]) {
          next[m.id] = { home: null, away: null };
        }
      }
      return next;
    });
  }, [matches, saved]);

  const sections = useMemo(
    () => groupMatchesForPhase(matches, activePhase),
    [matches, activePhase]
  );

  const openKeyboard = useCallback(
    (match: PronoMatch, side: ScoreSide) => {
      if (saved[match.id] || !canSubmit(match)) return;
      setKeyboardMatch(match);
      setKeyboardSide(side);
      setActiveScoreSide((p) => ({ ...p, [match.id]: side }));
    },
    [canSubmit, saved]
  );

  const closeKeyboard = useCallback(() => {
    setKeyboardMatch(null);
  }, []);

  const updateDraft = useCallback((matchId: string, draft: PronoDraft, side?: ScoreSide) => {
    setDrafts((p) => ({ ...p, [matchId]: draft }));
    if (side) setActiveScoreSide((p) => ({ ...p, [matchId]: side }));
  }, []);

  const handlePopular = useCallback(
    (matchId: string, score: string) => {
      const parsed = parsePopularScore(score);
      if (!parsed) return;
      setSelectedPopular((p) => ({ ...p, [matchId]: score }));
      updateDraft(matchId, { home: parsed.home, away: parsed.away });
    },
    [updateDraft]
  );

  const handleSubmit = useCallback(
    async (matchId: string) => {
      const draft = drafts[matchId];
      if (draft?.home === null || draft?.away === null) return;
      const ok = await submitProno(matchId, draft.home, draft.away);
      if (ok) closeKeyboard();
    },
    [closeKeyboard, drafts, submitProno]
  );

  const stickyHeaderIndices = useMemo(() => {
    const sticky: number[] = [];
    let index = error ? 1 : 0;
    for (const section of sections) {
      sticky.push(index);
      index += 1 + section.items.length;
    }
    return sticky;
  }, [error, sections]);

  const keyboardDraft = keyboardMatch
    ? (drafts[keyboardMatch.id] ?? { home: null, away: null })
    : { home: null, away: null };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenAmbience style={s.ambience}>
      <PronosHeader onBack={() => navigation.goBack()} />

      <PhaseTabs
        phases={phases}
        activePhase={activePhase}
        phasePoints={phasePoints}
        onSelect={setActivePhase}
      />

      <NationBar flag={nationFlag} countryName={nationLabel} power={nationPower} rank={worldRank} />
      <PointsScale />

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.blue} />
        </View>
      ) : sections.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Aucun match ici"
          subtitle="Choisis « Match d'ouverture » ou un jour de poule dans les onglets au-dessus."
        />
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          stickyHeaderIndices={stickyHeaderIndices}
          showsVerticalScrollIndicator={false}
        >
          {error ? <Text style={s.err}>{error}</Text> : null}
          {sections.map((section) => (
            <View key={section.sectionKey}>
              <GroupSectionHeader
                label={section.label}
                teamsLabel={section.teamsLabel}
                matchCount={section.items.length}
                groupLetter={groupLetterFromName(section.label)}
              />
              {section.items.map((match) => {
                const prono = saved[match.id] ?? null;
                const draft = drafts[match.id] ?? draftFromProno(prono);
                const popularScore =
                  selectedPopular[match.id] ??
                  (prono ? `${prono.homeScore}-${prono.awayScore}` : null);
                const isEditing =
                  keyboardMatch?.id === match.id ||
                  (!prono &&
                    (draft.home !== null || draft.away !== null || activeScoreSide[match.id] != null));

                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prono={prono}
                    draft={draft}
                    popularPronos={popularByMatchId[match.id] ?? []}
                    selectedPopular={popularScore}
                    activeScoreSide={activeScoreSide[match.id] ?? null}
                    isEditing={isEditing}
                    canSubmitMatch={canSubmit(match)}
                    saving={savingId === match.id}
                    onHomePress={() => openKeyboard(match, 'home')}
                    onAwayPress={() => openKeyboard(match, 'away')}
                    onSelectPopular={(score) => handlePopular(match.id, score)}
                    onSubmit={() => void handleSubmit(match.id)}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      <ScoreKeyboard
        visible={keyboardMatch != null}
        match={keyboardMatch}
        draft={keyboardDraft}
        activeTeam={keyboardSide}
        onChange={(draft, nextActive) => {
          if (!keyboardMatch) return;
          updateDraft(keyboardMatch.id, draft, nextActive);
          setKeyboardSide(nextActive);
        }}
        onClose={closeKeyboard}
        onConfirm={closeKeyboard}
      />
      </ScreenAmbience>
    </SafeAreaView>
  );
}
