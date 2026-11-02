import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Avatar } from '../types/avatar';

export type UserAvatar = Avatar;

type UserState = {
  userId: string;
  name: string;
  email: string;
  photoURL: string | null;
  countryCode: string;
  avatar: UserAvatar;
  rank: string;
  kdo: number;
  streak: number;
  notificationsEnabled: boolean;
  setUserId: (userId: string) => void;
  setCountry: (code: string) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPhotoURL: (url: string | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAvatar: (avatar: UserAvatar) => void;
  /** Met à jour partiellement l’avatar (MetaPerson GLB ou mode placeholder) sans écraser le reste. */
  patchAvatar: (partial: Partial<UserAvatar>) => void;
  addKdo: (amount: number) => void;
  updateStreak: () => void;
  clearUser: () => void;
};

type PersistedSlice = Pick<
  UserState,
  'userId' | 'name' | 'email' | 'photoURL' | 'countryCode' | 'avatar' | 'rank' | 'kdo' | 'streak' | 'notificationsEnabled'
>;

const defaultAvatar: UserAvatar = {
  skin: '#FDBCB4',
  face: '1',
  hair: 'Court',
  body: 'Normal',
  beard: undefined,
  accessory: undefined,
  celebration: '🕺 Danse',
  country: '',
  representation: 'placeholder',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: '',
      name: '',
      email: '',
      photoURL: null,
      countryCode: '',
      avatar: defaultAvatar,
      rank: 'RECRUE',
      kdo: 0,
      streak: 0,
      notificationsEnabled: true,

      setUserId: (userId) => set({ userId }),

      setCountry: (code) => set({ countryCode: code }),

      setName: (name) => set({ name }),

      setEmail: (email) => set({ email }),

      setPhotoURL: (photoURL) => set({ photoURL }),

      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

      setAvatar: (avatar) => set({ avatar }),

      patchAvatar: (partial) =>
        set((s) => ({
          avatar: {
            ...s.avatar,
            ...partial,
            country: partial.country ?? s.avatar.country ?? s.countryCode,
          },
        })),

      addKdo: (amount) =>
        set((s) => ({
          kdo: s.kdo + amount,
        })),

      updateStreak: () =>
        set((s) => ({
          streak: s.streak + 1,
        })),

      clearUser: () =>
        set({
          userId: '',
          name: '',
          email: '',
          photoURL: null,
          countryCode: '',
          avatar: defaultAvatar,
          rank: 'RECRUE',
          kdo: 0,
          streak: 0,
          notificationsEnabled: true,
        }),
    }),
    {
      name: 'goalya-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): PersistedSlice => ({
        userId: state.userId,
        name: state.name,
        email: state.email,
        photoURL: state.photoURL,
        countryCode: state.countryCode,
        avatar: state.avatar,
        rank: state.rank,
        kdo: state.kdo,
        streak: state.streak,
        notificationsEnabled: state.notificationsEnabled,
      }),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<PersistedSlice> | undefined;
        if (!p || typeof p !== 'object') return currentState;
        const isPlainObject = (v: unknown): v is Record<string, unknown> =>
          typeof v === 'object' && v !== null && !Array.isArray(v);
        return {
          ...currentState,
          userId: typeof p.userId === 'string' ? p.userId : currentState.userId,
          name: typeof p.name === 'string' ? p.name : currentState.name,
          email: typeof p.email === 'string' ? p.email : currentState.email,
          photoURL: typeof p.photoURL === 'string' ? p.photoURL : currentState.photoURL,
          countryCode: typeof p.countryCode === 'string' ? p.countryCode : currentState.countryCode,
          notificationsEnabled:
            typeof p.notificationsEnabled === 'boolean'
              ? p.notificationsEnabled
              : currentState.notificationsEnabled,
          rank: typeof p.rank === 'string' ? p.rank : currentState.rank,
          kdo: typeof p.kdo === 'number' ? p.kdo : currentState.kdo,
          streak: typeof p.streak === 'number' ? p.streak : currentState.streak,
          avatar: (() => {
            const raw: Record<string, unknown> = isPlainObject(p.avatar) ? p.avatar : {};
            const { avatarModelUrl: _a, packId: _p, ...rest } = raw;
            return {
              ...defaultAvatar,
              ...currentState.avatar,
              ...rest,
            } as UserAvatar;
          })(),
        };
      },
    }
  )
);
