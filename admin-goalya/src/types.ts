export type StoryType = 'goal' | 'dribble' | 'moment' | 'highlight' | 'celebration' | 'live_fans';

export type VideoType =
  | 'highlight'
  | 'summary'
  | 'documentary'
  | 'goalya_tv'
  | 'match_complet'
  | 'immanquable';

export type StoryDoc = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  type: StoryType;
  label: string;
  matchId: string;
  country: string;
  duration: number;
  views: number;
  isActive: boolean;
  chapter: string;
  postedBy: string;
};

export type VideoDoc = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  type: VideoType;
  title: string;
  matchId: string;
  duration: number;
  views: number;
  isActive: boolean;
  chapter: string;
  episodeNumber?: string;
  postedBy: string;
  likes?: number;
  shares?: number;
  ctaLabel?: string;
};
