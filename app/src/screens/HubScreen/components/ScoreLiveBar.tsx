import React, { memo, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { HUB_COLORS } from '../../../constants/hubGlobe';
import type { ParsedLiveScore, ParsedUpcomingMatch } from '../../../services/livescoreApi';

const F = {
  bebas: 'BebasNeue_400Regular' as const,
  mono: 'Inter_700Bold' as const,
  body: 'Inter_600SemiBold' as const,
};

export type ScoreLiveBarProps = {
  status: 'loading' | 'ready' | 'empty' | 'error' | 'upcoming' | 'disabled';
  live: ParsedLiveScore | null;
  upcoming: ParsedUpcomingMatch | null;
  errorMessage: string | null;
  isSimActive?: boolean;
  connectedUsers?: number;
};

function formatCountdown(target: Date): string {
  const diff = Math.max(0, target.getTime() - Date.now());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const ScoreLiveBar = memo(function ScoreLiveBar({
  status,
  live,
  upcoming,
  errorMessage,
  isSimActive,
  connectedUsers,
}: ScoreLiveBarProps) {
  const pulse = useSharedValue(1);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const liveDotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  useEffect(() => {
    if (!upcoming) return undefined;
    const tick = () => setCountdown(formatCountdown(upcoming.kickoff));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [upcoming]);

  const possession = live?.possession ?? { home: 50, away: 50 };
  const possessionGradient = useMemo(
    () => [`${live?.home.code ? HUB_COLORS.primary : '#3B82F6'}`, `${live?.away.code ? HUB_COLORS.primary : '#F59E0B'}`] as const,
    [live?.away.code, live?.home.code]
  );

  if (status === 'loading') {
    return (
      <View style={styles.wrap}>
        <ActivityIndicator color={HUB_COLORS.primary} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.wrap}>
        <Text style={styles.emptyTitle}>Match Hub</Text>
        <Text style={styles.emptySub}>{errorMessage ?? 'Recharge dans un instant.'}</Text>
      </View>
    );
  }

  if (status === 'empty' || status === 'disabled') {
    return (
      <View style={styles.wrap}>
        <Text style={styles.emptyTitle}>Match Hub</Text>
        <Text style={styles.emptySub}>Calendrier Coupe du Monde en cours de chargement…</Text>
      </View>
    );
  }

  if (status === 'upcoming' && upcoming) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.upcomingLabel}>Prochain match</Text>
        <View style={styles.teamsRow}>
          <Text style={styles.teamName}>{upcoming.home.flag} {upcoming.home.name}</Text>
          <Text style={styles.vs}>VS</Text>
          <Text style={styles.teamName}>{upcoming.away.name} {upcoming.away.flag}</Text>
        </View>
        <Text style={styles.countdown}>{countdown}</Text>
      </View>
    );
  }

  if (!live) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.emptySub}>En attente du match live…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.teamsRow}>
        <Text style={styles.teamName}>{live.home.flag} {live.home.name}</Text>
        <Text style={styles.score}>
          {live.home.score} — {live.away.score}
        </Text>
        <Text style={styles.teamName}>{live.away.name} {live.away.flag}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.minute}>{live.minute}&apos;</Text>
        {live.isLive ? (
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, liveDotStyle]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>Poss {live.possession.home}%—{live.possession.away}%</Text>
        <Text style={styles.stat}>Tirs {live.shots.home}—{live.shots.away}</Text>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>EN DIRECT</Text>
          <Text style={[styles.statValue, styles.statValueLive]}>
            {isSimActive && typeof connectedUsers === 'number'
              ? `${(connectedUsers / 1000).toFixed(0)}K 🌍`
              : '—'}
          </Text>
        </View>
        <Text style={styles.stat}>xG {live.xg.home.toFixed(1)}—{live.xg.away.toFixed(1)}</Text>
      </View>
      <View style={styles.possessionTrack}>
        <LinearGradient colors={possessionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.possessionFill, { width: `${possession.home}%` }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    height: 72,
    backgroundColor: HUB_COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(180, 210, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    justifyContent: 'center',
    zIndex: 30,
  },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamName: { flex: 1, color: HUB_COLORS.text, fontFamily: F.body, fontSize: 11 },
  score: { fontFamily: F.bebas, fontSize: 32, color: HUB_COLORS.text, letterSpacing: 1, paddingHorizontal: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  minute: { fontFamily: F.mono, fontSize: 11, color: HUB_COLORS.textMuted },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: HUB_COLORS.live },
  liveText: { fontFamily: F.body, fontSize: 10, color: HUB_COLORS.live, letterSpacing: 1 },
  simBadge: {
    fontFamily: F.body,
    fontSize: 9,
    color: HUB_COLORS.primary,
    letterSpacing: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(41, 121, 255, 0.12)',
  },
  crowdBadge: {
    fontFamily: F.body,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statCol: { alignItems: 'center', minWidth: 56 },
  statLabel: { fontFamily: F.mono, fontSize: 7, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6 },
  statValue: { fontFamily: F.mono, fontSize: 9, color: 'rgba(255,255,255,0.85)' },
  statValueLive: { color: '#9eb8d9' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  stat: { fontFamily: F.mono, fontSize: 9, color: 'rgba(255,255,255,0.72)' },
  possessionTrack: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 4, overflow: 'hidden' },
  possessionFill: { height: '100%' },
  upcomingLabel: { fontFamily: F.bebas, fontSize: 14, color: HUB_COLORS.text, letterSpacing: 2 },
  vs: { fontFamily: F.bebas, fontSize: 18, color: HUB_COLORS.primary },
  countdown: { fontFamily: F.mono, fontSize: 16, color: HUB_COLORS.text, marginTop: 4 },
  emptyTitle: { fontFamily: F.bebas, fontSize: 14, color: HUB_COLORS.text },
  emptySub: { fontFamily: F.body, fontSize: 11, color: HUB_COLORS.textMuted, marginTop: 2 },
});
