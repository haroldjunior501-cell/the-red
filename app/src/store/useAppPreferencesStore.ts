import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { hapticService } from '../services/hapticService';
import { soundService } from '../services/soundService';

type AppPreferencesState = {
  feedbackEnabled: boolean;
  setFeedbackEnabled: (enabled: boolean) => void;
};

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      feedbackEnabled: true,
      setFeedbackEnabled: (enabled) => {
        soundService.setEnabled(enabled);
        hapticService.setEnabled(enabled);
        set({ feedbackEnabled: enabled });
      },
    }),
    {
      name: 'goalya-app-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        const enabled = state?.feedbackEnabled ?? true;
        soundService.setEnabled(enabled);
        hapticService.setEnabled(enabled);
      },
    }
  )
);
