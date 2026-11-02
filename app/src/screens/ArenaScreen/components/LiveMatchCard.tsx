import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UserAvatar } from '../../../components/arena/UserAvatar';
import { ARENA_THEME as T } from '../../../constants/arenaTheme';
import { countryMeta } from '../../../services/gamesService';
import { arenaStyles } from '../ArenaScreen.styles';
import type { SimulatorCurrentMatch } from '../../../types/arena.types';

type Props = {
  match: SimulatorCurrentMatch;
  userId: string;
  userName: string;
  userCountry: string;
  onOpenMatch: () => void;
};

export const LiveMatchCard = memo(function LiveMatchCard({
  match,
  userId,
  userName,
  userCountry,
  onOpenMatch,
}: Props) {
  const userLeading = match.userScore >= match.opponentScore;
  const diff = match.userScore - match.opponentScore;
  const userMeta = countryMeta(userCountry);
  const oppMeta = countryMeta(match.opponentCountry);

  return (
    <View style={arenaStyles.section}>
      <Text style={arenaStyles.sectionTitle}>MATCH EN COURS</Text>
      <View style={[arenaStyles.card, match.isLive && styles.cardLive]}>
        <View style={styles.vsRow}>
          <View style={styles.side}>
            <UserAvatar userId={userId} displayName={userName} countryCode={userCountry} size={52} />
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.country}>{userMeta.flag} {userCountry}</Text>
          </View>
          <View style={styles.vsCenter}>
            {match.isLive ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTxt}>EN DIRECT</Text>
              </View>
            ) : null}
            <Text style={styles.vs}>VS</Text>
          </View>
          <View style={styles.side}>
            <UserAvatar
              userId={match.opponentUserId}
              displayName={match.opponentName}
              countryCode={match.opponentCountry}
              photoUrl={match.opponentProfilePhotoUrl}
              size={52}
            />
            <Text style={styles.name}>{match.opponentName}</Text>
            <Text style={styles.country}>{oppMeta.flag} {match.opponentCountry}</Text>
          </View>
        </View>
        <View style={styles.scoreRow}>
          <Text style={[styles.score, userLeading && styles.scoreWin]}>{match.userScore}</Text>
          <Text style={styles.dash}>—</Text>
          <Text style={[styles.score, !userLeading && styles.scoreWin]}>{match.opponentScore}</Text>
        </View>
        <Text style={styles.leadTxt}>
          {diff > 0
            ? `Tu domines · +${diff} pts d'avance`
            : diff < 0
              ? `En retard · ${diff} pts`
              : 'Égalité parfaite'}
        </Text>
        <Text style={styles.meta}>{match.matchdayLabel}</Text>
        <Pressable style={styles.btn} onPress={onOpenMatch}>
          <MaterialCommunityIcons name="broadcast" size={16} color="#7eb8ff" />
          <Text style={styles.btnTxt}>Voir le match en direct</Text>
          <Ionicons name="arrow-forward" size={14} color="#7eb8ff" />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardLive: { borderColor: 'rgba(0, 230, 118, 0.35)' },
  vsRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  side: { flex: 1, alignItems: 'center', gap: 4 },
  vsCenter: { alignItems: 'center', paddingTop: 8, gap: 6 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.live },
  liveTxt: { fontSize: 8, fontFamily: 'Inter_700Bold', color: T.live },
  vs: { fontFamily: 'Inter_900Black', fontSize: 14, color: T.purpleLight },
  name: { fontFamily: 'Inter_700Bold', fontSize: 12, color: T.text, marginTop: 4 },
  country: { fontSize: 10, color: T.muted2, fontFamily: 'Inter_500Medium' },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 14,
  },
  score: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 36,
    color: '#e5382b',
  },
  scoreWin: {
    color: T.green,
    textShadowColor: 'rgba(0, 230, 118, 0.45)',
    textShadowRadius: 8,
  },
  dash: { fontSize: 24, color: T.muted },
  leadTxt: {
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: T.text2,
    marginTop: 8,
  },
  meta: {
    textAlign: 'center',
    fontSize: 10,
    color: T.muted2,
    marginTop: 4,
    fontFamily: 'Inter_500Medium',
  },
  btn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(41, 121, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.25)',
  },
  btnTxt: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7eb8ff', letterSpacing: 0.4 },
});
