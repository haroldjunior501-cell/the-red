export type PlayerStatKind = 'goals' | 'assists' | 'shots' | 'dribbles' | 'passAccuracy';

export type TeamStatKind = 'goals' | 'possession' | 'passAccuracy' | 'shots';

export const PLAYER_TAB_TO_KIND: Record<string, PlayerStatKind> = {
  Buts: 'goals',
  'Passes déc.': 'assists',
  Tirs: 'shots',
  Dribbles: 'dribbles',
  Précision: 'passAccuracy',
};

export const TEAM_TAB_TO_KIND: Record<string, TeamStatKind> = {
  Buts: 'goals',
  Possession: 'possession',
  'Précision passes': 'passAccuracy',
  Tirs: 'shots',
};

export function playerStatTitle(kind: PlayerStatKind): string {
  switch (kind) {
    case 'goals':
      return 'Buts';
    case 'assists':
      return 'Passes décisives';
    case 'shots':
      return 'Tirs';
    case 'dribbles':
      return 'Dribbles';
    case 'passAccuracy':
      return 'Précision';
    default:
      return 'Stats';
  }
}

export function teamStatTitle(kind: TeamStatKind): string {
  switch (kind) {
    case 'goals':
      return 'Buts';
    case 'possession':
      return 'Possession';
    case 'passAccuracy':
      return 'Précision passes';
    case 'shots':
      return 'Tirs';
    default:
      return 'Stats équipes';
  }
}

export function playerStatColumnLabel(kind: PlayerStatKind): string {
  switch (kind) {
    case 'goals':
      return 'BUTS';
    case 'assists':
      return 'PASSES';
    case 'shots':
      return 'TIRS';
    case 'dribbles':
      return 'DRIBBLES';
    case 'passAccuracy':
      return 'PRÉC.';
    default:
      return 'VAL.';
  }
}
