import { useCallback, useEffect, useMemo, useState } from 'react';
import { fotmobPlayerImageUrl } from '../constants/fotmob';
import { ALL_SLOT_KEYS } from '../constants/fantasyPitch';
import { isArenaUnlocked, isCupStartedForSimulator } from '../constants/simulator';
import { getCountdownParts } from '../data/arenaSimulationData';
import { registerSimulatorArena } from '../services/simulatorArenaService';
import { fetchUserRanking } from '../services/simulatorService';
import { isApiConfigured } from '../services/apiClient';
import { loadFantasyTeamForUser } from '../services/fantasyService';
import { useUserStore } from '../store/useUserStore';
import { buildHeroLineupFromTeam } from '../utils/arenaHeroLineup';
import { useFantasyEconomy } from './useFantasyEconomy';
import { useAggregatedMissionStats } from './useAggregatedMissionStats';
import { useFantasyMissionTracker } from './useFantasyMissionTracker';
import { useSimulatorHistory } from './useSimulatorHistory';
import type { FantasyPitchPlayer, FantasySlotKey } from '../types/fantasy.types';
import type {
  SimulatorAccess,
  SimulatorCaptainState,
  SimulatorReward,
  SimulatorRankingEntry,
} from '../types/arena.types';
import { useArenaRanking } from './useArenaRanking';
import { useSimulatorMatch } from './useSimulatorMatch';
import { useSimulatorScore } from './useSimulatorScore';

function countFilled(
  slots: Record<FantasySlotKey, FantasyPitchPlayer | null> | undefined
): number {
  if (!slots) return 0;
  return ALL_SLOT_KEYS.filter((k) => slots[k]).length;
}

const DEFAULT_REWARDS: SimulatorReward[] = [
  { id: 'd1', label: '#1 du jour', points: 50, unlocked: true },
  { id: 't1', label: '1000 pts Fantasy', points: 100, unlocked: true },
  { id: 't10', label: 'Top 100 mondial', points: 250, unlocked: true },
  { id: 't3', label: 'Top 10 mondial', points: 500, unlocked: false },
  { id: 'ch', label: 'Champion GOALYA 2026', points: 5000, unlocked: false },
];

export function useSimulator(rankingFilter: import('../types/arena.types').RankingFilter = 'mondial') {
  const userId = useUserStore((s) => s.userId) || '';
  const userName = useUserStore((s) => s.name);
  const countryCode = useUserStore((s) => s.countryCode) || 'FR';
  const [filledCount, setFilledCount] = useState(0);
  const [teamSlots, setTeamSlots] = useState<
    Record<FantasySlotKey, FantasyPitchPlayer | null> | undefined
  >(undefined);
  const [captainSlot, setCaptainSlot] = useState<FantasySlotKey | null>(null);
  const [captain, setCaptain] = useState<SimulatorCaptainState | null>(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [myRanking, setMyRanking] = useState<SimulatorRankingEntry | null>(null);
  const [tick, setTick] = useState(0);

  const cupStarted = isCupStartedForSimulator();
  const arenaUnlocked = isArenaUnlocked();
  const score = useSimulatorScore(userId);
  const { match, events } = useSimulatorMatch(userId);
  const { entries: historyEntries, stats: historyStats } = useSimulatorHistory(
    userId,
    userName || 'Joueur',
    countryCode,
    match
  );
  const { entries: rankingPreview, loading: rankingLoading } = useArenaRanking(
    rankingFilter,
    userId,
    userName || 'Joueur',
    countryCode
  );

  useEffect(() => {
    if (!userId) {
      setMyRanking(null);
      return;
    }
    void fetchUserRanking(userId).then(setMyRanking);
  }, [userId]);

  const refreshTeam = useCallback(async () => {
    if (!userId) {
      setFilledCount(0);
      setTeamSlots(undefined);
      setCaptainSlot(null);
      setCaptain(null);
      setTeamLoading(false);
      return;
    }
    setTeamLoading(true);
    try {
      const doc = await Promise.race([
        loadFantasyTeamForUser(userId),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
      ]);
      const count = doc ? countFilled(doc.slots) : 0;
      setFilledCount(count);
      setTeamSlots(doc?.slots);
      setCaptainSlot(doc?.captainSlot ?? null);
      if (doc?.captainSlot && doc.slots[doc.captainSlot]) {
        const cap = doc.slots[doc.captainSlot]!;
        setCaptain({
          playerId: String(cap.fotmobId ?? cap.id),
          name: cap.name,
          photo: cap.photo || fotmobPlayerImageUrl(cap.fotmobId ?? Number(cap.id)),
        });
      } else {
        setCaptain(null);
      }
    } catch {
      setFilledCount(0);
      setTeamSlots(undefined);
      setCaptainSlot(null);
      setCaptain(null);
    } finally {
      setTeamLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refreshTeam();
  }, [refreshTeam]);

  useEffect(() => {
    if (!userId || filledCount < 11 || !isApiConfigured()) return;
    void registerSimulatorArena({
      displayName: userName || 'Joueur',
      country: countryCode,
    }).catch(() => undefined);
  }, [userId, filledCount, userName, countryCode]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = useMemo(() => getCountdownParts(), [tick]);

  const access: SimulatorAccess = useMemo(() => {
    const locked = filledCount < 11 || !cupStarted;
    let message = 'Ton équipe doit être complète pour participer au Simulator';
    let reason: SimulatorAccess['reason'] = 'EQUIPE_INCOMPLETE';
    if (filledCount >= 11 && !cupStarted) {
      message = 'La Coupe du Monde commence le 11 juin 2026';
      reason = 'CUP_NOT_STARTED';
    }
    return {
      locked,
      reason,
      message,
      actionLabel: locked && reason === 'EQUIPE_INCOMPLETE' ? 'Gérer mon équipe' : null,
    };
  }, [arenaUnlocked, cupStarted, filledCount]);

  const heroLineup = useMemo(
    () => buildHeroLineupFromTeam(teamSlots, captainSlot),
    [teamSlots, captainSlot]
  );

  const leaderProgress =
    score.leaderPoints > 0 ? Math.min(1, score.totalPoints / score.leaderPoints) : 0;

  const economy = useFantasyEconomy(userId);
  const missionStats = useAggregatedMissionStats(Boolean(userId));
  useFantasyMissionTracker(userId, missionStats);

  const rankingTotalCount = Math.max(
    myRanking?.rank ?? 0,
    rankingPreview.length,
    score.worldRank
  );

  return {
    userId,
    userName: userName || 'Joueur',
    countryCode,
    access,
    filledCount,
    countdown,
    score,
    captain,
    match,
    events,
    historyEntries,
    historyStats,
    heroLineup,
    rankingPreview,
    rankingTotalCount,
    myRanking: myRanking ?? rankingPreview.find((e) => e.userId === userId) ?? null,
    rankingLoading,
    leaderProgress,
    rewards: DEFAULT_REWARDS,
    loading: teamLoading,
    cupStarted,
    refreshTeam,
  };
}
