import type { FantasyPitchPlayer } from '../types/fantasy.types';
import { fotmobPlayerImageUrl } from './fotmob';
import { FOTMOB_MU_FULL_NAME } from './fotmobTheRed';

/** Fallback local si FotMob indisponible. */
export const UNITED_SQUAD_SEED: FantasyPitchPlayer[] = [
  { id: '1178602', fotmobId: 1178602, name: 'Senne Lammens', shortName: 'Lammens', photo: fotmobPlayerImageUrl(1178602), country: 'Belgium', countryCode: 'BEL', club: FOTMOB_MU_FULL_NAME, number: 31, price: 0, pts: 14, goals: 0, rating: 7.0, position: 'GK' },
  { id: '163604', fotmobId: 163604, name: 'Karl Darlow', shortName: 'Darlow', photo: fotmobPlayerImageUrl(163604), country: 'England', countryCode: 'ENG', club: FOTMOB_MU_FULL_NAME, number: 1, price: 0, pts: 12, goals: 0, rating: 6.5, position: 'GK' },
  { id: '24155', fotmobId: 24155, name: 'Tom Heaton', shortName: 'Heaton', photo: fotmobPlayerImageUrl(24155), country: 'England', countryCode: 'ENG', club: FOTMOB_MU_FULL_NAME, number: 22, price: 0, pts: 10, goals: 0, rating: 6.2, position: 'GK' },
  { id: '751550', fotmobId: 751550, name: 'Diogo Dalot', shortName: 'Dalot', photo: fotmobPlayerImageUrl(751550), country: 'Portugal', countryCode: 'POR', club: FOTMOB_MU_FULL_NAME, number: 2, price: 0, pts: 14, goals: 1, rating: 7.0, position: 'DEF' },
  { id: '1096688', fotmobId: 1096688, name: 'Leny Yoro', shortName: 'Yoro', photo: fotmobPlayerImageUrl(1096688), country: 'France', countryCode: 'FRA', club: FOTMOB_MU_FULL_NAME, number: 15, price: 0, pts: 13, goals: 0, rating: 6.8, position: 'DEF' },
  { id: '391051', fotmobId: 391051, name: 'Harry Maguire', shortName: 'Maguire', photo: fotmobPlayerImageUrl(391051), country: 'England', countryCode: 'ENG', club: FOTMOB_MU_FULL_NAME, number: 5, price: 0, pts: 13, goals: 1, rating: 6.9, position: 'DEF' },
  { id: '737066', fotmobId: 737066, name: 'Lisandro Martínez', shortName: 'Martínez', photo: fotmobPlayerImageUrl(737066), country: 'Argentina', countryCode: 'ARG', club: FOTMOB_MU_FULL_NAME, number: 6, price: 0, pts: 14, goals: 0, rating: 7.1, position: 'DEF' },
  { id: '1099707', fotmobId: 1099707, name: 'Patrick Dorgu', shortName: 'Dorgu', photo: fotmobPlayerImageUrl(1099707), country: 'Denmark', countryCode: 'DEN', club: FOTMOB_MU_FULL_NAME, number: 13, price: 0, pts: 12, goals: 0, rating: 6.6, position: 'DEF' },
  { id: '1096463', fotmobId: 1096463, name: 'Noussair Mazraoui', shortName: 'Mazraoui', photo: fotmobPlayerImageUrl(1096463), country: 'Morocco', countryCode: 'MAR', club: FOTMOB_MU_FULL_NAME, number: 3, price: 0, pts: 13, goals: 0, rating: 6.8, position: 'DEF' },
  { id: '750032', fotmobId: 750032, name: 'Mason Mount', shortName: 'Mount', photo: fotmobPlayerImageUrl(750032), country: 'England', countryCode: 'ENG', club: FOTMOB_MU_FULL_NAME, number: 7, price: 0, pts: 13, goals: 1, rating: 6.7, position: 'MID' },
  { id: '292462', fotmobId: 292462, name: 'Bruno Fernandes', shortName: 'Fernandes', photo: fotmobPlayerImageUrl(292462), country: 'Portugal', countryCode: 'POR', club: FOTMOB_MU_FULL_NAME, number: 8, price: 0, pts: 16, goals: 4, rating: 7.4, position: 'MID' },
  { id: '1096689', fotmobId: 1096689, name: 'Kobbie Mainoo', shortName: 'Mainoo', photo: fotmobPlayerImageUrl(1096689), country: 'England', countryCode: 'ENG', club: FOTMOB_MU_FULL_NAME, number: 37, price: 0, pts: 14, goals: 1, rating: 7.0, position: 'MID' },
  { id: '961995', fotmobId: 961995, name: 'Manuel Ugarte', shortName: 'Ugarte', photo: fotmobPlayerImageUrl(961995), country: 'Uruguay', countryCode: 'URU', club: FOTMOB_MU_FULL_NAME, number: 25, price: 0, pts: 12, goals: 0, rating: 6.6, position: 'MID' },
  { id: '297390', fotmobId: 297390, name: 'Casemiro', shortName: 'Casemiro', photo: fotmobPlayerImageUrl(297390), country: 'Brazil', countryCode: 'BRA', club: FOTMOB_MU_FULL_NAME, number: 18, price: 0, pts: 12, goals: 1, rating: 6.5, position: 'MID' },
  { id: '1099710', fotmobId: 1099710, name: 'Bryan Mbeumo', shortName: 'Mbeumo', photo: fotmobPlayerImageUrl(1099710), country: 'Cameroon', countryCode: 'CMR', club: FOTMOB_MU_FULL_NAME, number: 19, price: 0, pts: 15, goals: 5, rating: 7.3, position: 'ATT' },
  { id: '1099711', fotmobId: 1099711, name: 'Matheus Cunha', shortName: 'Cunha', photo: fotmobPlayerImageUrl(1099711), country: 'Brazil', countryCode: 'BRA', club: FOTMOB_MU_FULL_NAME, number: 10, price: 0, pts: 15, goals: 4, rating: 7.2, position: 'ATT' },
  { id: '808611', fotmobId: 808611, name: 'Amad Diallo', shortName: 'Amad', photo: fotmobPlayerImageUrl(808611), country: 'Ivory Coast', countryCode: 'CIV', club: FOTMOB_MU_FULL_NAME, number: 16, price: 0, pts: 14, goals: 3, rating: 7.1, position: 'ATT' },
  { id: '1096687', fotmobId: 1096687, name: 'Rasmus Højlund', shortName: 'Højlund', photo: fotmobPlayerImageUrl(1096687), country: 'Denmark', countryCode: 'DEN', club: FOTMOB_MU_FULL_NAME, number: 9, price: 0, pts: 14, goals: 4, rating: 6.9, position: 'ATT' },
  { id: '696365', fotmobId: 696365, name: 'Marcus Rashford', shortName: 'Rashford', photo: fotmobPlayerImageUrl(696365), country: 'England', countryCode: 'ENG', club: FOTMOB_MU_FULL_NAME, number: 10, price: 0, pts: 14, goals: 3, rating: 6.8, position: 'ATT' },
];
