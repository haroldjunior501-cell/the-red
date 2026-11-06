/** Manchester United sur OneFootball (`search_teams('Manchester United')` → id 21). */
export const ONEFOOTBALL_MU_TEAM_ID = 21;
export const ONEFOOTBALL_MU_NAME = 'Manchester United';

export type ClubNewsCategory =
  | 'all'
  | 'officiel'
  | 'matchs'
  | 'mercato'
  | 'club'
  | 'medias';

export const CLUB_NEWS_FILTERS: { key: ClubNewsCategory; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'officiel', label: 'Officiel' },
  { key: 'matchs', label: 'Matchs' },
  { key: 'mercato', label: 'Mercato' },
  { key: 'club', label: 'Vie du club' },
  { key: 'medias', label: 'Médias' },
];

export const CLUB_NEWS_CATEGORY_LABEL: Record<Exclude<ClubNewsCategory, 'all'>, string> = {
  officiel: 'Annonce officielle',
  matchs: 'Actualité sportive',
  mercato: 'Mercato',
  club: 'Vie du club',
  medias: 'Médias',
};
