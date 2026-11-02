import { create } from 'zustand';
import type { WorldChatMessage } from '../services/hubRtdbService';

type MapPost = (payload: Record<string, unknown>) => void;
type SimMessageHandler = (message: WorldChatMessage) => void;

type HubStore = {
  postToMap: MapPost | null;
  onSimMessage: SimMessageHandler | null;
  setPostToMap: (handler: MapPost | null) => void;
  setOnSimMessage: (handler: SimMessageHandler | null) => void;
  sendToMap: (payload: Record<string, unknown>) => void;
};

export const useHubStore = create<HubStore>((set, get) => ({
  postToMap: null,
  onSimMessage: null,
  setPostToMap: (postToMap) => set({ postToMap }),
  setOnSimMessage: (onSimMessage) => set({ onSimMessage }),
  sendToMap: (payload) => {
    get().postToMap?.(payload);
  },
}));
