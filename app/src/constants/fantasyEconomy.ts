import { COLORS } from './colors';
import type { FpRewardKey, PrestigeLevel } from '../types/fantasyEconomy.types';

export const DEFAULT_FANTASY_BUDGET_M = 100;
/** Solde initial : 0 — les FP se gagnent (pronos, missions, arène, etc.). */
export const DEFAULT_FANTASY_POINTS = 0;

export const FP_REWARDS: Record<FpRewardKey, number> = {
  simulator_win: 50,
  simulator_streak_3: 100,
  simulator_top_week: 200,
  fantasy_100pts_day: 30,
  fantasy_200pts_day: 80,
  fantasy_weekly_reward: 50,
  login_daily: 10,
  login_7days_streak: 70,
  invite_friend: 100,
  complete_team: 50,
  captain_goal_daily: 40,
};

export const BUDGET_CONVERSIONS = [
  { fp: 100, budgetGain: 1, bonus: 0 },
  { fp: 500, budgetGain: 6, bonus: 10 },
  { fp: 1000, budgetGain: 15, bonus: 15 },
  { fp: 2500, budgetGain: 40, bonus: 20 },
  { fp: 5000, budgetGain: 90, bonus: 25 },
] as const;

export type BudgetConversion = (typeof BUDGET_CONVERSIONS)[number];

export function bonusBadgeStyle(bonus: number) {
  if (bonus >= 25) return { bg: 'rgba(157,92,255,0.15)', color: '#9d5cff' };
  if (bonus >= 20) return { bg: 'rgba(255,184,0,0.12)', color: '#ffb800' };
  if (bonus >= 15) return { bg: 'rgba(0,232,122,0.12)', color: '#00e87a' };
  if (bonus >= 10) return { bg: COLORS.primaryMuted, color: COLORS.primaryLight };
  return { bg: 'rgba(255,255,255,0.06)', color: '#8aa0be' };
}

export const PRESTIGE_LEVELS: readonly PrestigeLevel[] = [
  { minBudget: 100, name: 'Amateur Manager', color: '#8aa0cc' },
  { minBudget: 150, name: 'Elite Manager', color: '#00e87a' },
  { minBudget: 250, name: 'Legendary Manager', color: '#ffb800' },
  { minBudget: 500, name: 'GOAT Manager', color: '#9d5cff' },
] as const;

export type FpPackId = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';

export type FpPackDef = {
  id: FpPackId;
  name: string;
  fp: number;
  bonus: number;
  price: number;
  gradient: readonly [string, string];
  borderColor: string;
  nameColor: string;
  topBarColor: string;
  gem: string;
};

export const FP_PACKS: readonly FpPackDef[] = [
  {
    id: 'bronze',
    name: 'BRONZE',
    fp: 100,
    bonus: 0,
    price: 0.49,
    gradient: ['#1c1208', '#120c04'],
    borderColor: 'rgba(140,86,40,0.35)',
    nameColor: '#8c5628',
    topBarColor: '#8c5628',
    gem: '💎',
  },
  {
    id: 'silver',
    name: 'SILVER',
    fp: 250,
    bonus: 0,
    price: 0.99,
    gradient: ['#141620', '#0e1018'],
    borderColor: 'rgba(180,180,200,0.25)',
    nameColor: '#b4b4c8',
    topBarColor: '#b4b4c8',
    gem: '💎💎',
  },
  {
    id: 'gold',
    name: 'GOLD',
    fp: 600,
    bonus: 20,
    price: 1.99,
    gradient: ['#1e1808', '#140e04'],
    borderColor: 'rgba(255,184,0,0.35)',
    nameColor: '#ffb800',
    topBarColor: '#ffb800',
    gem: '💎💎💎',
  },
  {
    id: 'platinum',
    name: 'PLATINUM',
    fp: 1400,
    bonus: 100,
    price: 3.99,
    gradient: ['#180e2e', '#100818'],
    borderColor: 'rgba(124,58,237,0.35)',
    nameColor: '#9d5cff',
    topBarColor: '#9d5cff',
    gem: '💎💎💎💎',
  },
  {
    id: 'diamond',
    name: 'DIAMOND',
    fp: 3000,
    bonus: 300,
    price: 7.99,
    gradient: ['#081428', '#040a18'],
    borderColor: 'rgba(41, 121, 255,0.4)',
    nameColor: COLORS.primaryLight,
    topBarColor: COLORS.primary,
    gem: '💎💎💎💎💎',
  },
  {
    id: 'legend',
    name: 'LEGEND',
    fp: 7000,
    bonus: 1000,
    price: 14.99,
    gradient: ['#1e1408', '#140a04'],
    borderColor: 'rgba(255,140,0,0.4)',
    nameColor: '#ff8c00',
    topBarColor: '#ff8c00',
    gem: '👑',
  },
];

export function getFpPack(id: FpPackId): FpPackDef | undefined {
  return FP_PACKS.find((p) => p.id === id);
}

export function totalPackFp(pack: FpPackDef): number {
  return pack.fp + pack.bonus;
}
