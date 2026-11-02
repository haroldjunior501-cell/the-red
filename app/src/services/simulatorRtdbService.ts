import { off, onValue, ref, type Unsubscribe } from 'firebase/database';
import { SIMULATOR_SEASON_ID } from '../constants/simulator';
import type {
  SimulatorCurrentMatch,
  SimulatorHistoryEntry,
  SimulatorLiveEvent,
  SimulatorScoreState,
  SimulatorSeasonStats,
} from '../types/arena.types';
import { summarizeHistory } from '../utils/simulatorHistory';
import { getFirebaseRtdb } from './firebase';

const EMPTY_SCORE: SimulatorScoreState = {
  totalPoints: 0,
  worldRank: 0,
  dayGain: 0,
  leaderPoints: 0,
  leaderName: '—',
  gapToLeader: 0,
};

const EMPTY_STATS: SimulatorSeasonStats = {
  wins: 0,
  losses: 0,
  draws: 0,
  totalDuels: 0,
  currentStreakLabel: null,
};

function rtdbSafe() {
  try {
    return getFirebaseRtdb();
  } catch {
    return null;
  }
}

type RankingRtdb = {
  totalPoints?: number;
  weeklyPoints?: number;
  rank?: number;
  dayGain?: number;
  leaderPoints?: number;
  leaderName?: string;
  gapToLeader?: number;
};

type MatchRtdb = {
  opponentUserId?: string;
  opponentName?: string;
  opponentCountry?: string;
  userScore?: number;
  opponentScore?: number;
  isLive?: boolean;
  matchdayLabel?: string;
};

export function subscribeSimulatorScore(
  userId: string,
  cb: (score: SimulatorScoreState) => void
): Unsubscribe {
  if (!userId) {
    cb(EMPTY_SCORE);
    return () => undefined;
  }

  const db = rtdbSafe();
  if (!db) {
    cb(EMPTY_SCORE);
    return () => undefined;
  }

  const r = ref(db, `simulator/${SIMULATOR_SEASON_ID}/rankings/${userId}`);
  const handler = onValue(r, (snap) => {
    const v = (snap.val() as RankingRtdb | null) ?? {};
    cb({
      totalPoints: v.totalPoints ?? 0,
      worldRank: v.rank ?? 0,
      dayGain: v.dayGain ?? 0,
      leaderPoints: v.leaderPoints ?? 0,
      leaderName: v.leaderName ?? '—',
      gapToLeader: v.gapToLeader ?? 0,
    });
  });
  return () => off(r, 'value', handler);
}

export function subscribeSimulatorMatch(
  userId: string,
  cb: (match: SimulatorCurrentMatch | null) => void
): Unsubscribe {
  if (!userId) {
    cb(null);
    return () => undefined;
  }

  const db = rtdbSafe();
  if (!db) {
    cb(null);
    return () => undefined;
  }

  const r = ref(db, `simulator/${SIMULATOR_SEASON_ID}/rankings/${userId}/currentMatch`);
  const handler = onValue(r, (snap) => {
    const v = snap.val() as MatchRtdb | null;
    if (!v) {
      cb(null);
      return;
    }
    cb({
      opponentUserId: v.opponentUserId ?? '',
      opponentName: v.opponentName ?? 'Adversaire',
      opponentCountry: v.opponentCountry ?? 'BR',
      opponentProfilePhotoUrl: null,
      userScore: v.userScore ?? 0,
      opponentScore: v.opponentScore ?? 0,
      isLive: v.isLive ?? false,
      matchdayLabel: v.matchdayLabel ?? '',
    });
  });
  return () => off(r, 'value', handler);
}

type HistoryRtdb = {
  matchdayId?: string;
  matchdayLabel?: string;
  playedAt?: number;
  opponentUserId?: string;
  opponentName?: string;
  opponentCountry?: string;
  userScore?: number;
  opponentScore?: number;
  outcome?: 'win' | 'loss' | 'draw';
  fantasyPointsDelta?: number;
  rankAfter?: number;
  rankDelta?: 'up' | 'down' | 'stable';
};

function parseHistoryEntry(id: string, v: HistoryRtdb): SimulatorHistoryEntry | null {
  if (!v.matchdayId || !v.opponentName) return null;
  return {
    id,
    matchdayId: v.matchdayId,
    matchdayLabel: v.matchdayLabel ?? v.matchdayId,
    playedAt: v.playedAt ?? 0,
    opponentUserId: v.opponentUserId ?? '',
    opponentName: v.opponentName,
    opponentCountry: v.opponentCountry ?? 'BR',
    userScore: v.userScore ?? 0,
    opponentScore: v.opponentScore ?? 0,
    outcome: v.outcome ?? 'draw',
    fantasyPointsDelta: v.fantasyPointsDelta ?? 0,
    rankAfter: v.rankAfter ?? 0,
    rankDelta: v.rankDelta,
  };
}

export function subscribeSimulatorHistory(
  userId: string,
  _userName: string,
  _country: string,
  currentMatch: SimulatorCurrentMatch | null,
  cb: (payload: { entries: SimulatorHistoryEntry[]; stats: SimulatorSeasonStats }) => void
): Unsubscribe {
  if (!userId) {
    cb({ entries: [], stats: EMPTY_STATS });
    return () => undefined;
  }

  const db = rtdbSafe();
  if (!db) {
    cb({ entries: [], stats: EMPTY_STATS });
    return () => undefined;
  }

  const r = ref(db, `simulator/${SIMULATOR_SEASON_ID}/rankings/${userId}/history`);
  const handler = onValue(r, (snap) => {
    const raw = snap.val();
    let entries: SimulatorHistoryEntry[] = [];
    if (raw && typeof raw === 'object') {
      entries = Object.entries(raw as Record<string, HistoryRtdb>)
        .map(([id, v]) => parseHistoryEntry(id, v))
        .filter((e): e is SimulatorHistoryEntry => e !== null)
        .sort((a, b) => b.playedAt - a.playedAt);
    }

    if (currentMatch?.isLive) {
      const liveId = `live_${SIMULATOR_SEASON_ID}`;
      const withoutLive = entries.filter((e) => !e.isLive && e.id !== liveId);
      entries = [
        {
          id: liveId,
          matchdayId: 'md_current',
          matchdayLabel: currentMatch.matchdayLabel || 'Duel du jour',
          playedAt: Date.now(),
          opponentUserId: currentMatch.opponentUserId,
          opponentName: currentMatch.opponentName,
          opponentCountry: currentMatch.opponentCountry,
          userScore: currentMatch.userScore,
          opponentScore: currentMatch.opponentScore,
          outcome:
            currentMatch.userScore > currentMatch.opponentScore
              ? 'win'
              : currentMatch.userScore < currentMatch.opponentScore
                ? 'loss'
                : 'draw',
          fantasyPointsDelta: 0,
          rankAfter: 0,
          isLive: true,
        },
        ...withoutLive,
      ];
    }

    cb({ entries, stats: summarizeHistory(entries) });
  });
  return () => off(r, 'value', handler);
}

export function subscribeSimulatorEvents(
  userId: string,
  matchdayId: string,
  cb: (events: SimulatorLiveEvent[]) => void
): Unsubscribe {
  if (!userId) {
    cb([]);
    return () => undefined;
  }

  const db = rtdbSafe();
  if (!db) {
    cb([]);
    return () => undefined;
  }

  const r = ref(db, `simulator/${SIMULATOR_SEASON_ID}/matchday/${matchdayId}/team/${userId}/events`);
  const handler = onValue(r, (snap) => {
    const raw = snap.val();
    if (!raw || typeof raw !== 'object') {
      cb([]);
      return;
    }
    const list = Object.entries(raw as Record<string, SimulatorLiveEvent>).map(([id, ev]) => ({
      ...ev,
      id: ev.id ?? id,
    }));
    list.sort((a, b) => a.minute - b.minute);
    cb(list);
  });
  return () => off(r, 'value', handler);
}
