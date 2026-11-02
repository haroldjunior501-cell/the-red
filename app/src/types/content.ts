export type StoryType = 'goal' | 'dribble' | 'moment' | 'highlight' | 'celebration' | 'live_fans';

export type VideoType =
  | 'highlight'
  | 'summary'
  | 'documentary'
  | 'goalya_tv'
  | 'match_complet'
  | 'immanquable';

export type ContentStory = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  type: StoryType;
  label: string;
  matchId: string;
  country: string;
  duration: number;
  publishedAt: number;
  views: number;
  isActive: boolean;
  chapter: string;
  postedBy: string;
};

export type ContentVideo = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  type: VideoType;
  title: string;
  matchId: string;
  duration: number;
  publishedAt: number;
  views: number;
  isActive: boolean;
  chapter: string;
  episodeNumber?: string;
  postedBy: string;
  /** Likes affichés (feed Immanquable). */
  likes?: number;
  /** Partages comptabilisés. */
  shares?: number;
  /** Pastille cyan sous la vidéo (ex. stat / accroche). */
  ctaLabel?: string;
};
