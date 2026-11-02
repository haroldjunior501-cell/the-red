import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventTypeIconWrap } from '../../components/arena/EventTypeIcon';
import { PlayerPhoto } from '../../components/arena/PlayerPhoto';
import { UserAvatar } from '../../components/arena/UserAvatar';
import { ARENA_THEME as T } from '../../constants/arenaTheme';
import { ALL_SLOT_KEYS } from '../../constants/fantasyPitch';
import { useSimulator } from '../../hooks/useSimulator';
import { loadFantasyTeamForUser } from '../../services/fantasyService';
import { countryMeta } from '../../services/gamesService';
import type { SimulatorLiveEvent } from '../../types/arena.types';
import type { FantasyPitchPlayer } from '../../types/fantasy.types';
import { useEffect, useState } from 'react';

// eventLabel is now built inside the component via useTranslation

function LineupGrid({ players }: { players: FantasyPitchPlayer[] }) {
  return (
    <View style={styles.lineup}>
      {players.map((p) => (
        <View key={p.id} style={styles.lineupItem}>
          <PlayerPhoto
            playerId={String(p.fotmobId ?? p.id)}
            playerName={p.name}
            size={36}
            countryCode={p.countryCode}
          />
          <Text style={styles.lineupName} numberOfLines={1}>
            {p.name}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function MatchDetailScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const sim = useSimulator();
  const match = sim.match;

  function eventLabel(type: SimulatorLiveEvent['type']): string {
    switch (type) {
      case 'goal': return t('arena.goalEventShort');
      case 'captain_goal': return t('arena.captainGoalShort');
      case 'assist': return t('arena.assistShort');
      case 'clean_sheet': return t('arena.cleanSheetShort');
      case 'motm': return t('arena.motmShort');
      case 'yellow': return t('arena.yellowShort');
      case 'red': return t('arena.redShort');
      default: return '';
    }
  }
  const [myTeam, setMyTeam] = useState<FantasyPitchPlayer[]>([]);

  useEffect(() => {
    void loadFantasyTeamForUser(sim.userId).then((doc) => {
      if (!doc?.slots) return;
      const list = ALL_SLOT_KEYS.map((k) => doc.slots[k]).filter(
        (p): p is FantasyPitchPlayer => p !== null
      );
      setMyTeam(list);
    });
  }, [sim.userId]);

  if (!match) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={T.text2} />
        </Pressable>
        <Text style={styles.empty}>{t('arena.noMatch')}</Text>
      </SafeAreaView>
    );
  }

  const userLeading = match.userScore >= match.opponentScore;
  const scoreDiff = Math.abs(match.userScore - match.opponentScore);
  const timeline = [...sim.events].sort((a, b) => b.minute - a.minute);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={T.text2} />
        </Pressable>
        <Text style={styles.title}>{t('arena.liveMatch')}</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={styles.vsRow}>
            <View style={styles.side}>
              <UserAvatar
                userId={sim.userId}
                displayName={sim.userName}
                countryCode={sim.countryCode}
                size={56}
              />
              <Text style={styles.pName}>{sim.userName}</Text>
            </View>
            <Text style={styles.bigScore}>
              {match.userScore} — {match.opponentScore}
            </Text>
            <View style={styles.side}>
              <UserAvatar
                userId={match.opponentUserId}
                displayName={match.opponentName}
                countryCode={match.opponentCountry}
                photoUrl={match.opponentProfilePhotoUrl}
                size={56}
              />
              <Text style={styles.pName}>{match.opponentName}</Text>
            </View>
          </View>
          <Text style={[styles.lead, userLeading ? styles.leadWin : styles.leadLose]}>
            {userLeading ? t('arena.leading', { diff: scoreDiff }) : t('arena.trailing', { diff: scoreDiff })}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{t('arena.timeline')}</Text>
        <View style={styles.card}>
          {timeline.length === 0 ? (
            <Text style={styles.emptyEv}>{t('arena.noEventsTimeline')}</Text>
          ) : (
            timeline.map((ev) => (
              <View key={ev.id} style={styles.evRow}>
                <PlayerPhoto
                  playerId={ev.playerId}
                  playerName={ev.playerName}
                  size={40}
                  isCaptain={ev.isCaptain}
                />
                <View style={styles.evMid}>
                  <Text style={styles.evName}>{ev.playerName}</Text>
                  <Text style={styles.evType}>{eventLabel(ev.type)}</Text>
                </View>
                <Text style={[styles.evPts, ev.points < 0 && styles.evPtsNeg]}>
                  {ev.points > 0 ? `+${ev.points}` : ev.points}
                </Text>
                <Text style={styles.evMin}>{ev.minute}&apos;</Text>
                <EventTypeIconWrap type={ev.type} />
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>{t('arena.fantasyLineups')}</Text>
        <View style={styles.card}>
          <Text style={styles.compLbl}>{t('arena.myEleven')} {countryMeta(sim.countryCode).flag}</Text>
          {myTeam.length > 0 ? (
            <LineupGrid players={myTeam} />
          ) : (
            <Text style={styles.compHint}>{t('arena.completeTeam')}</Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.compLbl}>
            {match.opponentName} · {countryMeta(match.opponentCountry).flag}
          </Text>
          <Text style={styles.compHint}>{t('arena.opponentLineup')}</Text>
        </View>

        <Pressable style={styles.liveBtn}>
          <MaterialCommunityIcons name="television-play" size={18} color="#7eb8ff" />
          <Text style={styles.liveBtnTxt}>{t('arena.viewLive')}</Text>
          <Ionicons name="arrow-forward" size={14} color="#7eb8ff" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 2,
    color: T.text,
  },
  pad: { padding: 12, paddingBottom: 32 },
  scoreCard: {
    backgroundColor: T.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    padding: 16,
    marginBottom: 16,
  },
  vsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { flex: 1, alignItems: 'center', gap: 6 },
  pName: { fontFamily: 'Inter_700Bold', fontSize: 12, color: T.text },
  bigScore: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 36,
    color: T.purpleLight,
    paddingHorizontal: 8,
  },
  lead: { textAlign: 'center', marginTop: 12, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  leadWin: { color: T.green },
  leadLose: { color: '#e5382b' },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: T.muted2,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  card: {
    backgroundColor: T.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    padding: 14,
    marginBottom: 16,
  },
  evRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  evMid: { flex: 1 },
  evName: { fontFamily: 'Inter_700Bold', fontSize: 12, color: T.text },
  evType: { fontSize: 10, color: T.muted2, marginTop: 2 },
  evPts: { fontFamily: 'Inter_800ExtraBold', fontSize: 12, color: T.green },
  evPtsNeg: { color: '#e5382b' },
  evMin: { width: 28, fontSize: 10, color: T.muted2 },
  empty: { color: T.muted2, textAlign: 'center', marginTop: 40, fontFamily: 'Inter_500Medium' },
  emptyEv: { color: T.muted2, textAlign: 'center', padding: 12, fontFamily: 'Inter_500Medium' },
  compLbl: { fontFamily: 'Inter_700Bold', fontSize: 13, color: T.text },
  compHint: { fontSize: 11, color: T.muted2, marginTop: 6, fontFamily: 'Inter_500Medium' },
  lineup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  lineupItem: { width: '22%', alignItems: 'center', gap: 4 },
  lineupName: { fontSize: 8, color: T.muted2, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(41, 121, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.25)',
  },
  liveBtnTxt: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#7eb8ff' },
});
