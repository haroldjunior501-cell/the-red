export type NotificationPrefKey =
  | 'goalsLive'
  | 'matchResults'
  | 'cardsEvents'
  | 'fantasyFootball'
  | 'bracketTable'
  | 'pronos'
  | 'arenaSimulator'
  | 'globalHub'
  | 'goalyaNews';

export type NotificationPreferences = Record<NotificationPrefKey, boolean>;

export const NOTIFICATION_PREF_KEYS: readonly NotificationPrefKey[] = [
  'goalsLive',
  'matchResults',
  'cardsEvents',
  'fantasyFootball',
  'bracketTable',
  'pronos',
  'arenaSimulator',
  'globalHub',
  'goalyaNews',
] as const;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  goalsLive: true,
  matchResults: true,
  cardsEvents: false,
  fantasyFootball: true,
  bracketTable: true,
  pronos: true,
  arenaSimulator: false,
  globalHub: true,
  goalyaNews: false,
};
