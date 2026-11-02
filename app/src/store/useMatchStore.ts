import { create } from 'zustand';

export type MatchCockpitState = {
  matchId: string;
  homeName: string;
  awayName: string;
  homeCode: string;
  awayCode: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  isLive: boolean;
  possessionHome: number;
  xgHome: number;
  shotsOnTargetHome: number;
  supportersHome: number;
  supportersAway: number;
};

type MatchStore = {
  cockpit: MatchCockpitState;
  setCockpit: (patch: Partial<MatchCockpitState>) => void;
};

const defaultCockpit: MatchCockpitState = {
  matchId: 'wc2026-fr-br',
  homeName: 'France',
  awayName: 'Brésil',
  homeCode: 'FR',
  awayCode: 'BR',
  homeFlag: '🇫🇷',
  awayFlag: '🇧🇷',
  homeScore: 2,
  awayScore: 1,
  minute: "78'",
  isLive: true,
  possessionHome: 58,
  xgHome: 1.84,
  shotsOnTargetHome: 6,
  supportersHome: 128,
  supportersAway: 96,
};

export const useMatchStore = create<MatchStore>((set) => ({
  cockpit: defaultCockpit,
  setCockpit: (patch) => set((s) => ({ cockpit: { ...s.cockpit, ...patch } })),
}));
