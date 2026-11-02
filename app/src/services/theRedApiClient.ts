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

  // Match Center (Pilier 1)
  getMatches: async (): Promise<RedMatch[]> => {
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
      const res = await api.get(`/matches/${id}`);
      if (res.data) return res.data as RedMatch;
    } catch {
      /* détail local */
    }
    return FALLBACK_MATCHES.find((match) => match.id === id) ?? null;
  },

  // United News (Pilier 2)
  getNews: async (): Promise<RedNews[]> => {
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
      const res = await api.get(`/news/${id}`);
      if (res.data) return res.data as RedNews;
    } catch {
      /* article local */
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
