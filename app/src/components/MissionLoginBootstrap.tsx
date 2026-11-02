import React, { useEffect } from 'react';
import { useAggregatedMissionStats } from '../hooks/useAggregatedMissionStats';
import { useFantasyMissionTracker } from '../hooks/useFantasyMissionTracker';
import { applyReferralFromUserProfile } from '../services/referralService';
import { useUserStore } from '../store/useUserStore';

/** Vérifie les missions (connexion, Arena, Fantasy, parrainage) dès l’ouverture de l’app. */
export function MissionLoginBootstrap() {
  const userId = useUserStore((s) => s.userId);
  const stats = useAggregatedMissionStats(Boolean(userId));

  useEffect(() => {
    if (!userId) return;
    void applyReferralFromUserProfile(userId);
  }, [userId]);

  useFantasyMissionTracker(userId, stats);

  return null;
}
