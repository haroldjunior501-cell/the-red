import { useEffect, useState } from 'react';
import { subscribeSimulatorScore } from '../services/simulatorRtdbService';
import type { SimulatorScoreState } from '../types/arena.types';

const EMPTY: SimulatorScoreState = {
  totalPoints: 0,
  worldRank: 0,
  dayGain: 0,
  leaderPoints: 0,
  leaderName: '—',
  gapToLeader: 0,
};

export function useSimulatorScore(userId: string) {
  const [score, setScore] = useState<SimulatorScoreState>(EMPTY);

  useEffect(() => {
    if (!userId) {
      setScore(EMPTY);
      return;
    }
    return subscribeSimulatorScore(userId, (next) => {
      setScore((prev) =>
        prev.totalPoints === next.totalPoints &&
        prev.worldRank === next.worldRank &&
        prev.dayGain === next.dayGain &&
        prev.gapToLeader === next.gapToLeader &&
        prev.leaderPoints === next.leaderPoints &&
        prev.leaderName === next.leaderName
          ? prev
          : next
      );
    });
  }, [userId]);

  return score;
}
