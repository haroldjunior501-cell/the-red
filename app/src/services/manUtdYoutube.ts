/**
 * Vidéos Man United — résumés = playlist officielle
 * https://youtube.com/playlist?list=PLQ5VvmbadZas
 *
 * Seed local (playlist complète) + enrichissement live (API yt-dlp / RSS chaîne).
 */
import { Platform } from 'react-native';
import {
  MANUTD_YT_CHANNEL_ID,
  MANUTD_YT_HIGHLIGHTS_PLAYLIST_URL,
  MANUTD_YT_RSS,
  type VideoCategory,
  VIDEO_SECTION_LABELS,
} from '../constants/manUtdYoutube';
import type { ContentVideo, VideoType } from '../types/content';
import highlightsSeed from '../data/manutdHighlightsSeed.json';

export type ManUtdVideo = {
  id: string;
  title: string;
  duration: number | null;
  views?: number | null;
  thumbnail: string | null;
  url: string;
  category: VideoCategory | string;
  published_at?: string | number | null;
  description?: string;
};

export type ManUtdPlaylist = {
  id: string;
  title: string;
  count?: number | null;
  thumbnail?: string | null;
  url: string;
  badge?: string | null;
};

export type ManUtdVideoBundle = {
  featured: ManUtdVideo | null;
  items: ManUtdVideo[];
  matchSummaries: ManUtdVideo[];
  sections: Partial<Record<VideoCategory, ManUtdVideo[]>>;
  playlists: ManUtdPlaylist[];
};

const mem = new Map<string, { at: number; data: ManUtdVideoBundle }>();
const TTL = 3 * 60 * 1000;

function pythonBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_YOUTUBE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const api = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (api) {
    try {
      const u = new URL(api);
      return `${u.protocol}//${u.hostname}:8011`;
    } catch {
      /* fall through */
    }
  }
  return Platform.select({
    android: 'http://192.168.1.132:8011',
    ios: 'http://localhost:8011',
    default: 'http://localhost:8011',
  })!;
}

export function formatDuration(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec) || sec <= 0) return '';
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m ${String(r).padStart(2, '0')}s`;
}

export function isMatchSummaryTitle(title: string): boolean {
  const t = title.toLowerCase();
  if (t.includes('press conference') || t.includes('inside carrington') || t.includes('training')) {
    return false;
  }
  if (/\bu1[89]\b|\bu21\b|academy|youth/.test(t)) return false;
  return (
    t.includes('highlight') ||
    t.includes('extended') ||
    t.includes('all the goals') ||
    t.includes('90 in 20') ||
    /\b\d+\s*[-–]\s*\d+\b/.test(t) ||
    /\b(man utd|manchester united).+\b(vs\.?|v)\b/i.test(title) ||
    /\b(vs\.?|v)\b.+(man utd|manchester united)/i.test(title)
  );
}

export function categorizeTitle(title: string): VideoCategory {
  const t = title.toLowerCase();
  if (
    t.includes('inside carrington') ||
    t.includes('podcast') ||
    t.includes('sir alex') ||
    t.includes('40 years') ||
    /['’]?94|['’]?99|['’]?08/.test(t)
  ) {
    return 'inside';
  }
  if (isMatchSummaryTitle(title)) return 'highlights';
  if (t.includes('training') || t.includes('train at') || t.includes('getting ready')) return 'training';
  if (t.includes('press conference') || t.includes('post-match') || t.includes('post match')) return 'press';
  if (/\bu1[89]\b|\bu21\b|academy|youth/.test(t)) return 'academy';
  if (t.includes('collection') || t.includes('premier league collection')) return 'collection';
  if (t.includes('live:')) return 'live';
  return 'latest';
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function thumbFor(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function parsePublishedAt(raw: string | number | null | undefined): number {
  if (raw == null) return Date.now();
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw < 1e12 ? raw * 1000 : raw;
  }
  const s = String(raw).trim();
  if (/^\d{8}$/.test(s)) {
    const y = Number(s.slice(0, 4));
    const m = Number(s.slice(4, 6)) - 1;
    const d = Number(s.slice(6, 8));
    return new Date(y, m, d).getTime();
  }
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : Date.now();
}

function normalizeVideo(raw: ManUtdVideo): ManUtdVideo | null {
  const id = String(raw.id || '')
    .replace(/^.*watch\?v=/, '')
    .replace(/^.*\/shorts\//, '')
    .split('&')[0]
    .trim();
  if (!/^[\w-]{11}$/.test(id)) return null;
  const title = cleanTitle(raw.title || '');
  if (!title || title === '[Private video]') return null;
  if (/^every\b/i.test(title)) return null;
  return {
    ...raw,
    id,
    title,
    category: categorizeTitle(title),
    thumbnail: thumbFor(id),
    url: `https://www.youtube.com/watch?v=${id}`,
    published_at: parsePublishedAt(raw.published_at),
  };
}

export function toContentVideo(
  v: ManUtdVideo,
  type: VideoType,
  chapterFallback = 'Manchester United'
): ContentVideo {
  const publishedAt = parsePublishedAt(v.published_at);
  return {
    id: v.id,
    videoUrl: v.url || `https://www.youtube.com/watch?v=${v.id}`,
    thumbnailUrl: v.thumbnail || thumbFor(v.id),
    type,
    title: v.title,
    matchId: v.id,
    duration: v.duration && v.duration > 0 ? v.duration : 90,
    publishedAt,
    views: v.views ?? 0,
    isActive: true,
    chapter: chapterFallback,
    episodeNumber: type === 'highlight' || type === 'summary' ? 'Résumé' : undefined,
    postedBy: '@manutd',
    ctaLabel: type === 'immanquable' ? 'Immanquable' : 'Résumé',
  };
}

function dedupe(items: ManUtdVideo[]): ManUtdVideo[] {
  const seen = new Set<string>();
  const out: ManUtdVideo[] = [];
  for (const v of items) {
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    out.push(v);
  }
  return out;
}

function buildSections(items: ManUtdVideo[]): Partial<Record<VideoCategory, ManUtdVideo[]>> {
  const sections: Partial<Record<VideoCategory, ManUtdVideo[]>> = {
    latest: items.slice(0, 20),
  };
  for (const v of items) {
    const cat = (v.category as VideoCategory) || categorizeTitle(v.title);
    if (!sections[cat]) sections[cat] = [];
    if ((sections[cat]!.length ?? 0) < 20) sections[cat]!.push(v);
  }
  return sections;
}

/** Seed = contenu exact de la playlist PLQ5VvmbadZas fournie. */
function seedMatchSummaries(): ManUtdVideo[] {
  const raw = (highlightsSeed as { items?: ManUtdVideo[] }).items ?? [];
  return dedupe(
    raw
      .map((v) =>
        normalizeVideo({
          ...v,
          category: 'highlights',
          duration: v.duration ?? null,
        })
      )
      .filter(Boolean) as ManUtdVideo[]
  ).map((v) => ({ ...v, category: 'highlights' as const }));
}

async function fetchRssVideos(rssUrl: string, limit = 40): Promise<ManUtdVideo[]> {
  const res = await fetch(rssUrl, {
    headers: {
      Accept: 'application/atom+xml,application/xml,text/xml,*/*',
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    },
  });
  if (!res.ok) throw new Error(`YouTube RSS ${res.status}`);
  const xml = await res.text();
  if (xml.includes('Error 404') || !xml.includes('<entry>')) {
    throw new Error('YouTube RSS empty/404');
  }
  const entries = xml.split('<entry>').slice(1);
  const items: ManUtdVideo[] = [];
  for (const block of entries.slice(0, limit)) {
    const id = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = block.match(/<title>([^<]+)<\/title>/)?.[1];
    const published = block.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!id || !title) continue;
    const mapped = normalizeVideo({
      id,
      title: cleanTitle(title),
      duration: null,
      thumbnail: thumbFor(id),
      url: `https://www.youtube.com/watch?v=${id}`,
      category: categorizeTitle(cleanTitle(title)),
      published_at: published ?? null,
    });
    if (mapped) items.push(mapped);
  }
  return items;
}

function buildBundle(
  items: ManUtdVideo[],
  matchSummaries: ManUtdVideo[],
  playlists: ManUtdPlaylist[] = []
): ManUtdVideoBundle {
  const sections = buildSections(items);
  sections.highlights = matchSummaries.slice(0, 50);
  return {
    featured: matchSummaries[0] ?? items[0] ?? null,
    items,
    matchSummaries,
    sections,
    playlists:
      playlists.length > 0
        ? playlists
        : [
            {
              id: 'PLQ5VvmbadZas',
              title: 'Résumés des matchs',
              count: matchSummaries.length,
              thumbnail: matchSummaries[0]?.thumbnail ?? null,
              url: MANUTD_YT_HIGHLIGHTS_PLAYLIST_URL,
              badge: 'Nouveaux épisodes',
            },
          ],
  };
}

async function fetchFromPython(): Promise<ManUtdVideoBundle | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const [videosRes, highlightsRes] = await Promise.all([
      fetch(`${pythonBase()}/videos/united?limit=50`, {
        headers: { Accept: 'application/json' },
        signal: ctrl.signal,
      }),
      fetch(`${pythonBase()}/videos/united/highlights?limit=50`, {
        headers: { Accept: 'application/json' },
        signal: ctrl.signal,
      }),
    ]);
    clearTimeout(t);
    if (!videosRes.ok) return null;
    const videosJson = (await videosRes.json()) as {
      items?: ManUtdVideo[];
      match_summaries?: ManUtdVideo[];
    };
    const items = dedupe((videosJson.items ?? []).map(normalizeVideo).filter(Boolean) as ManUtdVideo[]);
    if (!items.length) return null;

    let matchSummaries: ManUtdVideo[] = [];
    if (highlightsRes.ok) {
      const h = (await highlightsRes.json()) as { items?: ManUtdVideo[] };
      matchSummaries = dedupe(
        (h.items ?? []).map(normalizeVideo).filter(Boolean) as ManUtdVideo[]
      ).map((v) => ({ ...v, category: 'highlights' as const }));
    }
    if (!matchSummaries.length) {
      matchSummaries = (videosJson.match_summaries ?? [])
        .map(normalizeVideo)
        .filter(Boolean) as ManUtdVideo[];
    }
    return buildBundle(items, matchSummaries);
  } catch {
    return null;
  }
}

/**
 * Résumés = playlist PLQ5VvmbadZas (seed + live yt-dlp).
 * Immanquable / latest = RSS chaîne + API si dispo.
 */
export async function fetchManUtdVideos(force = false): Promise<ManUtdVideoBundle> {
  const key = 'manutd-yt-plq5-v1';
  const hit = mem.get(key);
  if (!force && hit && Date.now() - hit.at < TTL) return hit.data;

  const seed = seedMatchSummaries();

  const [channelSettled, pySettled] = await Promise.allSettled([
    fetchRssVideos(MANUTD_YT_RSS, 40),
    fetchFromPython(),
  ]);

  const fromChannel = channelSettled.status === 'fulfilled' ? channelSettled.value : [];
  const fromPy = pySettled.status === 'fulfilled' ? pySettled.value : null;

  // Live playlist (yt-dlp) en tête, puis seed — nouvelles vidéos apparaissent automatiquement
  let matchSummaries = seed;
  if (fromPy?.matchSummaries?.length) {
    matchSummaries = dedupe([...fromPy.matchSummaries, ...seed]);
  }

  const items = dedupe([...(fromPy?.items ?? []), ...fromChannel, ...matchSummaries]);
  const data = buildBundle(items, matchSummaries, fromPy?.playlists);
  mem.set(key, { at: Date.now(), data });
  return data;
}

export function sectionTitle(cat: VideoCategory): string {
  return VIDEO_SECTION_LABELS[cat] ?? cat;
}

export function withoutFeatured(items: ManUtdVideo[], featuredId?: string | null): ManUtdVideo[] {
  if (!featuredId) return items;
  return items.filter((v) => v.id !== featuredId);
}
