import { fotmobPlayerImageUrl } from '../constants/fotmob';
import type { FantasyListPosition, FantasyPitchPlayer } from '../types/fantasy.types';

type DemoRow = Omit<FantasyPitchPlayer, 'position' | 'photo'> & { fotmobId: number };

function row(r: DemoRow): Omit<FantasyPitchPlayer, 'position'> {
  return { ...r, photo: fotmobPlayerImageUrl(r.fotmobId) };
}

const ATT: ReturnType<typeof row>[] = [
  row({ id: '701154', fotmobId: 701154, name: 'Kylian Mbappé', shortName: 'Mbappé', country: 'France', countryCode: 'FRA', club: 'Real Madrid', number: 10, price: 16, pts: 9, goals: 12, rating: 9.2 }),
  row({ id: '292462', fotmobId: 292462, name: 'Mohamed Salah', shortName: 'Salah', country: 'Égypte', countryCode: 'EGY', club: 'Liverpool', number: 11, price: 15, pts: 7, goals: 10, rating: 8.8 }),
  row({ id: '155997', fotmobId: 155997, name: 'Lionel Messi', shortName: 'Messi', country: 'Argentine', countryCode: 'ARG', club: 'Inter Miami', number: 10, price: 17, pts: 11, goals: 14, rating: 9.5 }),
  row({ id: '737066', fotmobId: 737066, name: 'Harry Kane', shortName: 'Kane', country: 'Angleterre', countryCode: 'ENG', club: 'Bayern', number: 9, price: 14, pts: 8, goals: 11, rating: 8.5 }),
  row({ id: '93447', fotmobId: 93447, name: 'Antoine Griezmann', shortName: 'Griezmann', country: 'France', countryCode: 'FRA', club: 'Atlético', number: 7, price: 12, pts: 8, goals: 9, rating: 8.3 }),
  row({ id: '8198', fotmobId: 8198, name: 'Cristiano Ronaldo', shortName: 'Ronaldo', country: 'Portugal', countryCode: 'POR', club: 'Al Nassr', number: 7, price: 12, pts: 6, goals: 9, rating: 7.8 }),
  row({ id: '706297', fotmobId: 706297, name: 'Álvaro Morata', shortName: 'Morata', country: 'Espagne', countryCode: 'ESP', club: 'Galatasaray', number: 7, price: 11, pts: 5, goals: 7, rating: 7.2 }),
];

const MID: ReturnType<typeof row>[] = [
  row({ id: '914458', fotmobId: 914458, name: 'Aurélien Tchouaméni', shortName: 'Tchouam.', country: 'France', countryCode: 'FRA', club: 'Real Madrid', number: 8, price: 10, pts: 5, goals: 2, rating: 7.5 }),
  row({ id: '1016132', fotmobId: 1016132, name: 'Kouadio Koné', shortName: 'Koné', country: 'France', countryCode: 'FRA', club: 'PSG', number: 6, price: 11, pts: 5, goals: 3, rating: 7.8 }),
  row({ id: '169200', fotmobId: 169200, name: 'Kevin De Bruyne', shortName: 'De Bruyne', country: 'Belgique', countryCode: 'BEL', club: 'Man City', number: 17, price: 14, pts: 9, goals: 8, rating: 9.0 }),
  row({ id: '319300', fotmobId: 319300, name: "N'Golo Kanté", shortName: 'Kanté', country: 'France', countryCode: 'FRA', club: 'Al Ittihad', number: 7, price: 11, pts: 5, goals: 3, rating: 8.2 }),
  row({ id: '692984', fotmobId: 692984, name: 'Ousmane Dembélé', shortName: 'Dembélé', country: 'France', countryCode: 'FRA', club: 'PSG', number: 10, price: 13, pts: 7, goals: 6, rating: 8.6 }),
  row({ id: '846005', fotmobId: 846005, name: 'Pedri', shortName: 'Pedri', country: 'Espagne', countryCode: 'ESP', club: 'Barcelona', number: 8, price: 12, pts: 6, goals: 4, rating: 8.5 }),
];

const DEF: ReturnType<typeof row>[] = [
  row({ id: '955406', fotmobId: 955406, name: 'William Saliba', shortName: 'Saliba', country: 'France', countryCode: 'FRA', club: 'Arsenal', number: 2, price: 10, pts: 5, goals: 2, rating: 8.1 }),
  row({ id: '705450', fotmobId: 705450, name: 'Jules Koundé', shortName: 'Koundé', country: 'France', countryCode: 'FRA', club: 'Barcelona', number: 23, price: 10, pts: 6, goals: 3, rating: 8.2 }),
  row({ id: '1197250', fotmobId: 1197250, name: 'Malo Gusto', shortName: 'Gusto', country: 'France', countryCode: 'FRA', club: 'Chelsea', number: 27, price: 9, pts: 4, goals: 1, rating: 7.5 }),
  row({ id: '614446', fotmobId: 614446, name: 'Antonio Rüdiger', shortName: 'Rüdiger', country: 'Allemagne', countryCode: 'GER', club: 'Real Madrid', number: 2, price: 8, pts: 4, goals: 2, rating: 7.3 }),
  row({ id: '846483', fotmobId: 846483, name: 'Achraf Hakimi', shortName: 'Hakimi', country: 'Maroc', countryCode: 'MAR', club: 'PSG', number: 2, price: 10, pts: 6, goals: 3, rating: 8.2 }),
  row({ id: '933768', fotmobId: 933768, name: 'Trent Alexander-Arnold', shortName: 'Trent', country: 'Angleterre', countryCode: 'ENG', club: 'Liverpool', number: 66, price: 10, pts: 6, goals: 2, rating: 8.0 }),
];

const GK: ReturnType<typeof row>[] = [
  row({ id: '466439', fotmobId: 466439, name: 'Mike Maignan', shortName: 'Maignan', country: 'France', countryCode: 'FRA', club: 'AC Milan', number: 16, price: 8, pts: 3, goals: 0, rating: 7.8 }),
  row({ id: '319784', fotmobId: 319784, name: 'Alisson', shortName: 'Alisson', country: 'Brésil', countryCode: 'BRA', club: 'Liverpool', number: 1, price: 8, pts: 4, goals: 0, rating: 8.2 }),
  row({ id: '170403', fotmobId: 170403, name: 'Thibaut Courtois', shortName: 'Courtois', country: 'Belgique', countryCode: 'BEL', club: 'Real Madrid', number: 1, price: 9, pts: 5, goals: 0, rating: 8.5 }),
  row({ id: '279714', fotmobId: 279714, name: 'Brice Samba', shortName: 'Samba', country: 'France', countryCode: 'FRA', club: 'Lens', number: 1, price: 7, pts: 2, goals: 0, rating: 7.2 }),
];

function withPosition(rows: ReturnType<typeof row>[], position: FantasyListPosition): FantasyPitchPlayer[] {
  return rows.map((r) => ({ ...r, position }));
}

export const DEMO_FANTASY_POOL: Record<FantasyListPosition, FantasyPitchPlayer[]> = {
  ATT: withPosition(ATT, 'ATT'),
  MID: withPosition(MID, 'MID'),
  DEF: withPosition(DEF, 'DEF'),
  GK: withPosition(GK, 'GK'),
};

export function getDemoPlayersByPosition(position: FantasyListPosition): FantasyPitchPlayer[] {
  return DEMO_FANTASY_POOL[position];
}

export function getDemoPoolFlat(): FantasyPitchPlayer[] {
  return (['ATT', 'MID', 'DEF', 'GK'] as FantasyListPosition[]).flatMap((p) => DEMO_FANTASY_POOL[p]);
}
