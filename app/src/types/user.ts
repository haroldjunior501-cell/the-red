import type { Avatar } from './avatar';

export enum Rank {
  RECRUE = 'RECRUE',
  SUPPORTER = 'SUPPORTER',
  SOLDAT = 'SOLDAT',
  VETERAN = 'VETERAN',
  CAPITAINE = 'CAPITAINE',
  LEGENDE = 'LEGENDE',
}

export interface User {
  id: string;
  name: string;
  countryCode: string;
  avatar: Avatar;
  rank: Rank;
  kdo: number;
  streak: number;
  feelingRate: number;
}
