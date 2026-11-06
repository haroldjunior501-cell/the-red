import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { UNITED_QUIZ_BANK, type UnitedQuizItem } from '../../constants/unitedQuiz';
import { PRONO_COLORS as C } from '../../constants/pronosColors';
import { useFirebaseAuthUid } from '../../hooks/useFirebaseAuthUid';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import {
  addFanPoints,
  loadQuizVotes,
  saveQuizVote,
} from '../../services/unitedGamesService';

const F = {
  bebas: 'BebasNeue_400Regular' as const,
  i600: 'Inter_600SemiBold' as const,
  i700: 'Inter_700Bold' as const,
  i800: 'Inter_800ExtraBold' as const,
};

export default function UnitedQuizScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const uid = useFirebaseAuthUid();
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!uid) return;
    void loadQuizVotes(uid).then((docs) => {
      const map: Record<string, string> = {};
      for (const [id, v] of Object.entries(docs)) {
        if (v?.optionId) map[id] = v.optionId;
      }
      setVotes(map);
    });
  }, [uid]);

  const answer = useCallback(
    async (item: UnitedQuizItem, optionId: string) => {
      if (votes[item.id]) return;
      if (!uid) {
        setFeedback((f) => ({ ...f, [item.id]: 'Connecte-toi pour jouer' }));
        return;
      }
      setVotes((v) => ({ ...v, [item.id]: optionId }));
      const opt = item.options.find((o) => o.id === optionId);
      let pts = 0;
      let msg = '';
      if (item.kind === 'quiz') {
        const ok = !!opt?.correct;
        pts = ok ? item.points : 0;
        msg = ok ? `Correct · +${item.points} pts` : 'Mauvaise réponse';
      } else {
        pts = item.points;
        msg = `Vote enregistré · +${item.points} pts`;
      }
      setFeedback((f) => ({ ...f, [item.id]: msg }));
      try {
        await saveQuizVote(uid, {
          pollId: item.id,
          optionId,
          submittedAt: Date.now(),
          pointsAwarded: pts,
        });
        if (pts > 0) await addFanPoints(uid, pts, 'men');
      } catch {
        setFeedback((f) => ({ ...f, [item.id]: 'Erreur enregistrement' }));
      }
    },
    [uid, votes]
  );

  return (
    <ScreenAmbience>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={C.text2} />
          </Pressable>
          <Text style={styles.title}>QUIZ & SONDAGES</Text>
        </View>
        <Text style={styles.sub}>
          Engagement hors match — histoire du club, stats et avis fans.
        </Text>
        <ScrollView contentContainerStyle={styles.scroll}>
          {UNITED_QUIZ_BANK.map((item) => {
            const chosen = votes[item.id];
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.badgeRow}>
                  <Text style={styles.badge}>{item.kind === 'quiz' ? 'QUIZ' : 'SONDAGE'}</Text>
                  <Text style={styles.pts}>+{item.points} pts</Text>
                </View>
                {item.subtitle ? <Text style={styles.meta}>{item.subtitle}</Text> : null}
                <Text style={styles.q}>{item.title}</Text>
                {item.options.map((o) => {
                  const on = chosen === o.id;
                  const reveal = item.kind === 'quiz' && !!chosen;
                  const correct = !!o.correct;
                  return (
                    <Pressable
                      key={o.id}
                      disabled={!!chosen}
                      onPress={() => void answer(item, o.id)}
                      style={[
                        styles.opt,
                        on && styles.optOn,
                        reveal && correct && styles.optGood,
                        reveal && on && !correct && styles.optBad,
                      ]}
                    >
                      <Text style={styles.optT}>{o.label}</Text>
                    </Pressable>
                  );
                })}
                {feedback[item.id] ? <Text style={styles.fb}>{feedback[item.id]}</Text> : null}
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenAmbience>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: { fontFamily: F.bebas, fontSize: 24, letterSpacing: 2, color: C.text },
  sub: { color: C.muted2, paddingHorizontal: 16, marginBottom: 12, fontSize: 13 },
  scroll: { paddingHorizontal: 16 },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  badge: { color: C.blue2, fontFamily: F.i800, fontSize: 11, letterSpacing: 1 },
  pts: { color: C.gold, fontFamily: F.i700, fontSize: 12 },
  meta: { color: C.muted, fontSize: 11, marginBottom: 4 },
  q: { color: C.text, fontFamily: F.i700, fontSize: 15, lineHeight: 22, marginBottom: 12 },
  opt: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
    backgroundColor: C.card2,
  },
  optOn: { borderColor: C.blueBorder, backgroundColor: C.blueFill },
  optGood: { borderColor: C.greenBorder, backgroundColor: C.greenBg },
  optBad: { borderColor: C.orangeBorder, backgroundColor: C.orangeFill },
  optT: { color: C.text2, fontFamily: F.i600, fontSize: 14 },
  fb: { marginTop: 6, color: C.muted2, fontFamily: F.i600, fontSize: 12 },
});
