import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ARENA_THEME as T } from '../../../constants/arenaTheme';
import { countryMeta } from '../../../services/gamesService';
import type { SimulatorDuelOutcome, SimulatorHistoryEntry, SimulatorSeasonStats } from '../../../types/arena.types';
import { arenaStyles } from '../ArenaScreen.styles';

const PREVIEW_COUNT = 6;

type Props = {
  entries: SimulatorHistoryEntry[];
  stats: SimulatorSeasonStats;
  onEntryPress?: (entry: SimulatorHistoryEntry) => void;
  onViewAll?: () => void;
};

function outcomeLabel(outcome: SimulatorDuelOutcome): string {
  if (outcome === 'win') return 'V';
  if (outcome === 'loss') return 'D';
  return 'N';
}

function outcomeColors(outcome: SimulatorDuelOutcome, isLive?: boolean) {
  if (isLive) {
    return { bg: 'rgba(124, 58, 237, 0.25)', border: T.purple, text: T.purpleLight };
  }
  if (outcome === 'win') {
    return { bg: 'rgba(0, 230, 118, 0.15)', border: T.green, text: T.green };
  }
  if (outcome === 'loss') {
    return { bg: 'rgba(229, 56, 43, 0.15)', border: T.red, text: T.red };
  }
  return { bg: 'rgba(138, 160, 190, 0.12)', border: T.muted2, text: T.muted2 };
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function RankDeltaIcon({ delta }: { delta?: 'up' | 'down' | 'stable' }) {
  if (delta === 'up') return <Ionicons name="arrow-up" size={12} color={T.green} />;
  if (delta === 'down') return <Ionicons name="arrow-down" size={12} color={T.red} />;
  return null;
}

export const MyProgressionCard = memo(function MyProgressionCard({
  entries,
  stats,
  onEntryPress,
  onViewAll,
}: Props) {
  const { t } = useTranslation();
  const preview = entries.slice(0, PREVIEW_COUNT);
  const hasMore = entries.length > PREVIEW_COUNT;

  return (
    <View style={arenaStyles.section}>
      <View style={styles.titleRow}>
        <Text style={arenaStyles.sectionTitle}>{t('arena.myProgression')}</Text>
        {hasMore && onViewAll ? (
          <Pressable onPress={onViewAll} hitSlop={8}>
            <Text style={styles.viewAll}>{t('common.viewAll')}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={arenaStyles.card}>
        <View style={styles.summary}>
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: T.green }]}>{stats.wins}</Text>
            <Text style={styles.statLbl}>{t('arena.wins')}</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: T.red }]}>{stats.losses}</Text>
            <Text style={styles.statLbl}>{t('arena.losses')}</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: T.muted2 }]}>{stats.draws}</Text>
            <Text style={styles.statLbl}>{t('arena.draws')}</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{stats.totalDuels}</Text>
            <Text style={styles.statLbl}>{t('arena.duels')}</Text>
          </View>
        </View>

        {stats.currentStreakLabel ? (
          <Text style={styles.streak}>{stats.currentStreakLabel}</Text>
        ) : null}

        {preview.length === 0 ? (
          <Text style={styles.empty}>{t('arena.noHistory')}</Text>
        ) : (
          preview.map((entry, index) => {
            const colors = outcomeColors(entry.outcome, entry.isLive);
            const flag = countryMeta(entry.opponentCountry).flag;
            const pts =
              entry.fantasyPointsDelta > 0
                ? `+${entry.fantasyPointsDelta}`
                : entry.fantasyPointsDelta < 0
                  ? `${entry.fantasyPointsDelta}`
                  : '—';

            const row = (
              <View
                style={[
                  styles.row,
                  entry.isLive && styles.rowLive,
                  index < preview.length - 1 && styles.rowBorder,
                ]}
              >
                <View style={styles.lineCol}>
                  <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.badgeTxt, { color: colors.text }]}>
                      {entry.isLive ? '•' : outcomeLabel(entry.outcome)}
                    </Text>
                  </View>
                  {index < preview.length - 1 ? <View style={styles.connector} /> : null}
                </View>

                <View style={styles.body}>
                  <View style={styles.topLine}>
                    <Text style={styles.vs} numberOfLines={1}>
                      {entry.isLive ? `${t('arena.live')} · ` : ''}vs {flag} {entry.opponentName}
                    </Text>
                    <Text style={styles.score}>
                      {entry.userScore}–{entry.opponentScore}
                    </Text>
                  </View>
                  <View style={styles.metaLine}>
                    <Text style={styles.meta} numberOfLines={1}>
                      {entry.matchdayLabel} · {formatDate(entry.playedAt)}
                    </Text>
                    <View style={styles.metaRight}>
                      {!entry.isLive ? (
                        <Text
                          style={[
                            styles.pts,
                            entry.fantasyPointsDelta > 0 && { color: T.green },
                            entry.fantasyPointsDelta < 0 && { color: T.red },
                          ]}
                        >
                          {pts} pts
                        </Text>
                      ) : (
                        <Text style={styles.ptsLive}>{t('arena.inProgress')}</Text>
                      )}
                      {entry.rankAfter > 0 ? (
                        <View style={styles.rankChip}>
                          <Text style={styles.rankTxt}>#{entry.rankAfter}</Text>
                          <RankDeltaIcon delta={entry.rankDelta} />
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            );

            if (onEntryPress) {
              return (
                <Pressable
                  key={entry.id}
                  onPress={() => onEntryPress(entry)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  {row}
                </Pressable>
              );
            }
            return <View key={entry.id}>{row}</View>;
          })
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  viewAll: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: T.purpleLight,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statVal: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    color: T.text,
    letterSpacing: 0.5,
  },
  statLbl: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: T.muted2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statSep: {
    width: 1,
    height: 32,
    backgroundColor: T.border,
  },
  streak: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: T.purpleLight,
    marginBottom: 10,
    marginTop: -4,
  },
  empty: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: T.muted2,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  rowLive: {
    backgroundColor: 'rgba(139, 43, 226, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 6,
    marginHorizontal: -6,
  },
  rowBorder: {},
  pressed: { opacity: 0.88 },
  lineCol: { alignItems: 'center', width: 32 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 4,
  },
  body: { flex: 1, gap: 4 },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  vs: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: T.text,
  },
  score: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    color: T.purpleLight,
    letterSpacing: 0.5,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: T.muted2,
  },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pts: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: T.text2,
  },
  ptsLive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: T.purpleLight,
  },
  rankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  rankTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: T.muted2,
  },
});
