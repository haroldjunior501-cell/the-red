import { FP_REWARDS } from './fantasyEconomy';
import type { UserMissionStats } from '../types/fantasyEconomy.types';

export type MissionDefinition = {
  id: string;
  label: string;
  reward: number;
  rewardKey: string;
  checkFn: (stats: UserMissionStats) => boolean;
};

export const FANTASY_MISSIONS: MissionDefinition[] = [
  {
    id: 'login_daily',
    label: "Se connecter aujourd'hui",
    reward: FP_REWARDS.login_daily,
    rewardKey: 'login_daily',
    checkFn: (s) => s.loggedInToday,
  },
  {
    id: 'win_arena_duel',
    label: 'Gagner 1 duel Arena',
    reward: FP_REWARDS.simulator_win,
    rewardKey: 'simulator_win',
    checkFn: (s) => s.arenaWinsToday >= 1,
  },
  {
    id: 'complete_team',
    label: 'Équipe Fantasy complète (11 joueurs)',
    reward: FP_REWARDS.complete_team,
    rewardKey: 'complete_team',
    checkFn: (s) => s.filledCount >= 11,
  },
  {
    id: 'score_50_fantasy',
    label: 'Marquer 50 pts Fantasy',
    reward: FP_REWARDS.fantasy_100pts_day,
    rewardKey: 'fantasy_100pts_day',
    checkFn: (s) => s.fantasyPointsToday >= 50,
  },
  {
    id: 'score_100_fantasy',
    label: 'Marquer 100 pts Fantasy',
    reward: FP_REWARDS.fantasy_200pts_day,
    rewardKey: 'fantasy_200pts_day',
    checkFn: (s) => s.fantasyPointsToday >= 100,
  },
  {
    id: 'captain_scores',
    label: 'Ton capitaine marque un but',
    reward: 40,
    rewardKey: 'captain_goal_daily',
    checkFn: (s) => s.captainGoalsToday >= 1,
  },
  {
    id: 'login_7_streak',
    label: '7 jours de connexion consécutifs',
    reward: FP_REWARDS.login_7days_streak,
    rewardKey: 'login_7days_streak',
    checkFn: (s) => s.loginStreak >= 7,
  },
];

/** Récompenses renouvelées chaque semaine ISO. */
export const WEEKLY_MISSIONS: MissionDefinition[] = [
  {
    id: 'fantasy_weekly_reward',
    label: 'Récompense hebdo Fantasy (XI + 50 pts)',
    reward: FP_REWARDS.fantasy_weekly_reward,
    rewardKey: 'fantasy_weekly_reward',
    checkFn: (s) => s.filledCount >= 11 && s.fantasyPointsToday >= 50,
  },
  {
    id: 'arena_top_week',
    label: 'Top 1 classement Arena (semaine)',
    reward: FP_REWARDS.simulator_top_week,
    rewardKey: 'simulator_top_week',
    checkFn: (s) => s.isWeeklyArenaTop1,
  },
];

export type MilestoneReward = {
  referenceId: string;
  label: string;
  reward: number;
  rewardKey: string;
};

export function getMilestoneRewards(stats: UserMissionStats): MilestoneReward[] {
  const out: MilestoneReward[] = [];
  if (stats.arenaStreakReferenceId) {
    out.push({
      referenceId: stats.arenaStreakReferenceId,
      label: "3 victoires Arena d'affilée",
      reward: FP_REWARDS.simulator_streak_3,
      rewardKey: 'simulator_streak_3',
    });
  }
  return out;
}
