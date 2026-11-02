import { useCallback, useEffect, useState } from 'react';
import {
  subscribeNotificationPreferences,
  updateNotificationPreference,
} from '../services/notificationPreferencesService';
import type { NotificationPrefKey, NotificationPreferences } from '../types/notificationPreferences';
import { DEFAULT_NOTIFICATION_PREFS } from '../types/notificationPreferences';

export function useNotificationPreferences(userId: string | undefined) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPrefs(DEFAULT_NOTIFICATION_PREFS);
      setReady(true);
      return undefined;
    }
    setReady(false);
    const unsub = subscribeNotificationPreferences(userId, (next) => {
      setPrefs(next);
      setReady(true);
    });
    return unsub;
  }, [userId]);

  const setPref = useCallback(
    async (key: NotificationPrefKey, value: boolean) => {
      if (!userId) return;
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        void updateNotificationPreference(userId, key, value, prev).catch(() => {
          setPrefs(prev);
        });
        return next;
      });
    },
    [userId]
  );

  return { prefs, setPref, ready };
}
