/** Chaîne officielle Manchester United sur YouTube. */
export const MANUTD_YT_HANDLE = '@manutd';
export const MANUTD_YT_CHANNEL_ID = 'UC6yW44UGJJBvYTlfC7CRg2Q';
export const MANUTD_YT_CHANNEL_URL = 'https://www.youtube.com/@manutd';
export const MANUTD_YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${MANUTD_YT_CHANNEL_ID}`;

/**
 * Playlist officielle — Men's First Team Highlights 2026/27
 * (résumés des matchs déjà joués)
 * https://youtube.com/playlist?list=PLQ5VvmbadZas
 */
export const MANUTD_YT_HIGHLIGHTS_PLAYLIST_ID = 'PLQ5VvmbadZas';
export const MANUTD_YT_HIGHLIGHTS_PLAYLIST_URL =
  `https://www.youtube.com/playlist?list=${MANUTD_YT_HIGHLIGHTS_PLAYLIST_ID}`;
/** RSS playlist — accessible depuis le téléphone sans serveur Python. */
export const MANUTD_YT_HIGHLIGHTS_RSS =
  `https://www.youtube.com/feeds/videos.xml?playlist_id=${MANUTD_YT_HIGHLIGHTS_PLAYLIST_ID}`;

/** Playlist Highlights 2025/26 (complément). */
export const MANUTD_YT_HIGHLIGHTS_2526_PLAYLIST_ID = 'PL5-QUghxmluLRUTCh-umhonToE-X_Dnu-';
export const MANUTD_YT_HIGHLIGHTS_2526_RSS =
  `https://www.youtube.com/feeds/videos.xml?playlist_id=${MANUTD_YT_HIGHLIGHTS_2526_PLAYLIST_ID}`;

export type VideoCategory =
  | 'latest'
  | 'highlights'
  | 'inside'
  | 'training'
  | 'press'
  | 'academy'
  | 'collection'
  | 'live';

export const VIDEO_SECTION_LABELS: Record<VideoCategory, string> = {
  latest: 'Pour toi',
  highlights: 'Résumés des matchs',
  inside: 'Inside Carrington',
  training: 'Entraînement',
  press: 'Conférences de presse',
  academy: 'Académie',
  collection: 'Collections',
  live: 'Live cette semaine',
};
