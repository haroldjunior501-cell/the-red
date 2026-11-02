import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import {
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFICATION_PREF_KEYS,
  type NotificationPrefKey,
  type NotificationPreferences,
} from '../types/notificationPreferences';
import { getFirestoreDb } from './firebase';

function normalizePrefs(raw: unknown): NotificationPreferences {
  const base = { ...DEFAULT_NOTIFICATION_PREFS };
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Record<string, unknown>;
  for (const key of NOTIFICATION_PREF_KEYS) {
    if (typeof obj[key] === 'boolean') base[key] = obj[key];
  }
  return base;
}

export async function loadNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  if (!userId) return { ...DEFAULT_NOTIFICATION_PREFS };
  try {
    const snap = await getDoc(doc(getFirestoreDb(), 'users', userId));
    if (!snap.exists()) return { ...DEFAULT_NOTIFICATION_PREFS };
    const data = snap.data() as { notificationPrefs?: unknown };
    return normalizePrefs(data.notificationPrefs);
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

export function subscribeNotificationPreferences(
  userId: string,
  onChange: (prefs: NotificationPreferences) => void
): Unsubscribe {
  if (!userId) {
    onChange({ ...DEFAULT_NOTIFICATION_PREFS });
    return () => undefined;
  }
  return onSnapshot(
    doc(getFirestoreDb(), 'users', userId),
    (snap) => {
      const data = snap.exists() ? (snap.data() as { notificationPrefs?: unknown }) : {};
      onChange(normalizePrefs(data.notificationPrefs));
    },
    () => onChange({ ...DEFAULT_NOTIFICATION_PREFS })
  );
}

export async function updateNotificationPreference(
  userId: string,
  key: NotificationPrefKey,
  value: boolean,
  current: NotificationPreferences
): Promise<void> {
  if (!userId) return;
  const next = { ...current, [key]: value };
  await setDoc(
    doc(getFirestoreDb(), 'users', userId),
    { notificationPrefs: next },
    { merge: true }
  );
}
