import { create } from 'zustand';

export type MapFilterId = 'tous' | 'live' | 'fan_zones' | 'stades' | 'tendances';
export type MapNavLevel = 1 | 2 | 3;

export type NextMatchCard = {
  home: string;
  away: string;
  venue: string;
  dateLabel: string;
};

export type LiveMatchUpdate = {
  homeCode: string;
  awayCode: string;
  stadiumId: string;
  isLive: boolean;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
};

type MapState = {
  level: MapNavLevel;
  filter: MapFilterId;
  selectedCountryId: string | null;
  selectedStadiumId: string | null;
  searchQuery: string;
  nextMatchCard: NextMatchCard | null;
  liveMatches: LiveMatchUpdate[];
  setLevel: (level: MapNavLevel) => void;
  setFilter: (filter: MapFilterId) => void;
  setSelectedCountryId: (id: string | null) => void;
  setSelectedStadiumId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setNextMatchCard: (card: NextMatchCard | null) => void;
  setLiveMatches: (matches: LiveMatchUpdate[]) => void;
  goBack: () => void;
  resetToMapHub: () => void;
};

export const useMapStore = create<MapState>((set, get) => ({
  level: 1,
  filter: 'tous',
  selectedCountryId: null,
  selectedStadiumId: null,
  searchQuery: '',
  liveMatches: [
    { homeCode: 'FR', awayCode: 'BR', stadiumId: 'metlife', isLive: true, homeScore: 2, awayScore: 1, minute: "78'" },
  ],
  nextMatchCard: {
    home: 'France',
    away: 'Brésil',
    venue: 'MetLife Stadium',
    dateLabel: '12 JUIN · 21:00',
  },
  setLevel: (level) => set({ level }),
  setFilter: (filter) => set({ filter }),
  setSelectedCountryId: (selectedCountryId) => set({ selectedCountryId }),
  setSelectedStadiumId: (selectedStadiumId) => set({ selectedStadiumId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setNextMatchCard: (nextMatchCard) => set({ nextMatchCard }),
  setLiveMatches: (liveMatches) => set({ liveMatches }),
  goBack: () => {
    const s = get();
    if (s.level === 3) set({ level: 2, selectedStadiumId: null });
    else if (s.level === 2) set({ level: 1, selectedCountryId: null, selectedStadiumId: null });
  },
  resetToMapHub: () => set({ level: 1, selectedCountryId: null, selectedStadiumId: null }),
}));
