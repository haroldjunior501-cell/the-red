import axios from 'axios';
import { Platform } from 'react-native';
import {
  FALLBACK_MATCHES,
  FALLBACK_NEWS,
  FALLBACK_POSTS,
  type RedMatch,
  type RedNews,
  type RedPost,
} from './theRedContent';

const localPosts: RedPost[] = [];

const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api/v1',
  ios: 'http://localhost:8000/api/v1',
  default: 'http://localhost:8000/api/v1',
});

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const TheRedApi = {
  // Auth
  register: async (email: string, password: string, displayName: string) => {
    const res = await api.post('/auth/register', { email, password, display_name: displayName });
    if (res.data.access_token) setAuthToken(res.data.access_token);
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) setAuthToken(res.data.access_token);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  updateProfile: async (data: { display_name?: string; bio?: string; avatar_url?: string }) => {
    const res = await api.patch('/users/me', data);
    return res.data;
  },

  // Match Center (Pilier 1) — FotMob MU en priorité
  getMatches: async (): Promise<RedMatch[]> => {
    try {
      const { fetchManchesterUnitedTeam } = await import('./fotmobClubApi');
      const { FOTMOB_MU_TEAM_ID } = await import('../constants/fotmobTheRed');
      const payload = (await fetchManchesterUnitedTeam()) as {
        overview?: {
          overviewFixtures?: {
            id: number;
            home?: { id?: number; name?: string; score?: number };
            away?: { id?: number; name?: string; score?: number };
            notStarted?: boolean;
            tournament?: { name?: string };
            status?: { utcTime?: string; started?: boolean; finished?: boolean };
          }[];
        };
      };
      const list = payload.overview?.overviewFixtures ?? [];
      if (list.length) {
        const mu = FOTMOB_MU_TEAM_ID;
        return list.map((fx) => {
          const homeId = fx.home?.id;
          const isHome = homeId === mu ? 'HOME' : 'AWAY';
          const opponent =
            homeId === mu ? fx.away?.name ?? 'Adversaire' : fx.home?.name ?? 'Adversaire';
          let status = 'SCHEDULED';
          if (fx.status?.finished) status = 'FINISHED';
          else if (fx.status?.started) status = 'LIVE';
          else if (fx.notStarted) status = 'SCHEDULED';
          return {
            id: fx.id,
            opponent,
            competition: fx.tournament?.name ?? 'Premier League',
            kickoff_at: fx.status?.utcTime ?? new Date().toISOString(),
            status,
            home_score: fx.home?.score ?? null,
            away_score: fx.away?.score ?? null,
            is_home: isHome,
          } satisfies RedMatch;
        });
      }
    } catch {
      /* fallback API / local */
    }
    try {
      const res = await api.get('/matches');
      if (Array.isArray(res.data) && res.data.length > 0) return res.data as RedMatch[];
    } catch {
      /* calendrier local United */
    }
    return FALLBACK_MATCHES;
  },
  getMatchDetail: async (id: number): Promise<RedMatch | null> => {
    try {
      const matches = await TheRedApi.getMatches();
      const hit = matches.find((match) => match.id === id);
      if (hit) return hit;
    } catch {
      /* détail local */
    }
    try {
      const res = await api.get(`/matches/${id}`);
      if (res.data) return res.data as RedMatch;
    } catch {
      /* ignore */
    }
    return FALLBACK_MATCHES.find((match) => match.id === id) ?? null;
  },

  // United News (Pilier 2) — OneFootball (wrapper Python / API directe)
  getNews: async (): Promise<RedNews[]> => {
    try {
      const { fetchUnitedClubNews } = await import('./oneFootballNews');
      const items = await fetchUnitedClubNews();
      if (items.length) {
        return items.map((item, idx) => ({
          id: Number(item.id) || idx + 1,
          title: item.title,
          summary: item.summary,
          source: item.source,
          published_at: item.published_at,
          url: item.url ?? undefined,
          image_url: item.image_url ?? undefined,
        }));
      }
    } catch {
      /* fallback API / local */
    }
    try {
      const res = await api.get('/news');
      if (Array.isArray(res.data) && res.data.length > 0) return res.data as RedNews[];
    } catch {
      /* fil local United */
    }
    return FALLBACK_NEWS;
  },
  getNewsDetail: async (id: number): Promise<RedNews | null> => {
    try {
      const { fetchUnitedClubNews } = await import('./oneFootballNews');
      const items = await fetchUnitedClubNews();
      const hit = items.find((item) => Number(item.id) === id || item.id === String(id));
      if (hit) {
        return {
          id: Number(hit.id) || id,
          title: hit.title,
          summary: hit.body || hit.summary,
          source: hit.source,
          published_at: hit.published_at,
          url: hit.url ?? undefined,
          image_url: hit.image_url ?? undefined,
        };
      }
    } catch {
      /* article local */
    }
    try {
      const res = await api.get(`/news/${id}`);
      if (res.data) return res.data as RedNews;
    } catch {
      /* ignore */
    }
    return FALLBACK_NEWS.find((item) => item.id === id) ?? null;
  },

  // Fan Community (Pilier 3)
  getPosts: async (): Promise<RedPost[]> => {
    try {
      const res = await api.get('/community/posts');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return [...localPosts, ...(res.data as RedPost[])];
      }
    } catch {
      /* mur local */
    }
    return [...localPosts, ...FALLBACK_POSTS];
  },
  createPost: async (content: string, matchId?: number): Promise<RedPost> => {
    try {
      const res = await api.post('/community/posts', { content, match_id: matchId });
      return res.data as RedPost;
    } catch {
      const post: RedPost = {
        id: Date.now(),
        author_name: 'Toi',
        content,
        reactions_count: 0,
        comments_count: 0,
        match_id: matchId ?? null,
        created_at: new Date().toISOString(),
      };
      localPosts.unshift(post);
      return post;
    }
  },
  addComment: async (postId: number, content: string) => {
    const res = await api.post(`/community/posts/${postId}/comments`, { content });
    return res.data;
  },
  reactToPost: async (postId: number, type: string = 'red') => {
    const res = await api.post(`/community/posts/${postId}/reactions`, { type });
    return res.data;
  },
};
