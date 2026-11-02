import {
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Timestamp,
  type Unsubscribe,
  updateDoc,
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import type { ContentStory, ContentVideo, StoryType, VideoType } from '../types/content';

const STORIES = 'content_stories';
const VIDEOS = 'content_videos';

function tsToMs(v: unknown): number {
  if (v && typeof v === 'object' && 'toMillis' in v && typeof (v as Timestamp).toMillis === 'function') {
    return (v as Timestamp).toMillis();
  }
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return Date.now();
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : v != null ? String(v) : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return fallback;
}

function asBool(v: unknown, fallback = true): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

const STORY_TYPES: readonly StoryType[] = [
  'goal',
  'dribble',
  'moment',
  'highlight',
  'celebration',
  'live_fans',
];

const VIDEO_TYPES: readonly VideoType[] = [
  'highlight',
  'summary',
  'documentary',
  'goalya_tv',
  'match_complet',
  'immanquable',
];

function asStoryType(v: unknown): StoryType {
  const s = asString(v);
  return STORY_TYPES.includes(s as StoryType) ? (s as StoryType) : 'moment';
}

function asVideoType(v: unknown): VideoType {
  const s = asString(v);
  return VIDEO_TYPES.includes(s as VideoType) ? (s as VideoType) : 'highlight';
}

export function mapStoryDoc(id: string, data: DocumentData): ContentStory {
  return {
    id,
    videoUrl: asString(data.videoUrl),
    thumbnailUrl: asString(data.thumbnailUrl),
    type: asStoryType(data.type),
    label: asString(data.label, 'Story'),
    matchId: asString(data.matchId),
    country: asString(data.country),
    duration: asNumber(data.duration, 15),
    publishedAt: tsToMs(data.publishedAt),
    views: asNumber(data.views),
    isActive: asBool(data.isActive, true),
    chapter: asString(data.chapter),
    postedBy: asString(data.postedBy),
  };
}

export function mapVideoDoc(id: string, data: DocumentData): ContentVideo {
  const ep = data.episodeNumber;
  return {
    id,
    videoUrl: asString(data.videoUrl),
    thumbnailUrl: asString(data.thumbnailUrl),
    type: asVideoType(data.type),
    title: asString(data.title, 'Vidéo'),
    matchId: asString(data.matchId),
    duration: asNumber(data.duration, 60),
    publishedAt: tsToMs(data.publishedAt),
    views: asNumber(data.views),
    isActive: asBool(data.isActive, true),
    chapter: asString(data.chapter),
    episodeNumber: typeof ep === 'string' && ep.length > 0 ? ep : undefined,
    postedBy: asString(data.postedBy),
    likes: asNumber(data.likes),
    shares: asNumber(data.shares),
    ctaLabel: asString(data.ctaLabel) || undefined,
  };
}

export function storiesCollection() {
  return collection(getFirestoreDb(), STORIES);
}

export function videosCollection() {
  return collection(getFirestoreDb(), VIDEOS);
}

export async function incrementStoryViews(id: string): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), STORIES, id), { views: increment(1) });
}

export async function incrementVideoViews(id: string): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), VIDEOS, id), { views: increment(1) });
}

/** @deprecated Préférer la sous-collection `content_videos/{id}/likes/{userId}`. */
export async function incrementVideoLikes(id: string, delta = 1): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), VIDEOS, id), { likes: increment(delta) });
}

export function videoLikesCollection(videoId: string) {
  return collection(getFirestoreDb(), VIDEOS, videoId, 'likes');
}

export function videoLikeDoc(videoId: string, userId: string) {
  return doc(getFirestoreDb(), VIDEOS, videoId, 'likes', userId);
}

export async function setVideoLike(videoId: string, userId: string, liked: boolean): Promise<void> {
  const ref = videoLikeDoc(videoId, userId);
  if (liked) {
    await setDoc(ref, { userId, createdAt: serverTimestamp() });
  } else {
    await deleteDoc(ref);
  }
}

/** Compte réel des likes + état « j’ai liké » pour l’utilisateur connecté. */
export function subscribeVideoLikes(
  videoId: string,
  userId: string | null,
  handlers: {
    onCount: (count: number) => void;
    onUserLiked: (liked: boolean) => void;
  }
): Unsubscribe {
  const col = videoLikesCollection(videoId);
  const unsubCol = onSnapshot(
    col,
    (snap) => handlers.onCount(snap.size),
    () => handlers.onCount(0)
  );

  if (!userId) {
    handlers.onUserLiked(false);
    return unsubCol;
  }

  const unsubUser = onSnapshot(
    videoLikeDoc(videoId, userId),
    (snap) => handlers.onUserLiked(snap.exists()),
    () => handlers.onUserLiked(false)
  );

  return () => {
    unsubCol();
    unsubUser();
  };
}

export async function incrementVideoShares(id: string): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), VIDEOS, id), { shares: increment(1) });
}

export function formatVideoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function isVideoNew(publishedAt: number, windowMs = 1000 * 60 * 60 * 48): boolean {
  return Date.now() - publishedAt < windowMs;
}
