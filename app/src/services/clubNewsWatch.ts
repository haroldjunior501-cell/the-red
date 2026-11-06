/**
 * Surveille les actus Man United et pousse une notification locale
 * pour chaque nouvel article (après le premier seed).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUnitedClubNews, type ClubNewsItem } from './oneFootballNews';
import { notificationService } from './notificationService';

const SEEN_KEY = '@thered/club_news_seen_ids_v1';
const MAX_SEEN = 120;
const MAX_NOTIFS_PER_TICK = 3;

async function loadSeen(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

async function saveSeen(ids: Set<string>): Promise<void> {
  const list = [...ids].slice(-MAX_SEEN);
  await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(list)).catch(() => {});
}

export async function syncClubNewsNotifications(opts?: {
  forceFetch?: boolean;
}): Promise<{ newItems: ClubNewsItem[]; total: number }> {
  const items = await fetchUnitedClubNews(opts?.forceFetch ?? false);
  const seen = await loadSeen();

  // Premier passage : on marque tout comme déjà vu (pas de spam).
  if (seen.size === 0) {
    for (const item of items) seen.add(item.id);
    await saveSeen(seen);
    return { newItems: [], total: items.length };
  }

  const fresh = items.filter((item) => !seen.has(item.id));
  if (!fresh.length) return { newItems: [], total: items.length };

  await notificationService.requestPermissions();

  const toNotify = fresh.slice(0, MAX_NOTIFS_PER_TICK);
  for (const item of toNotify) {
    await notificationService.sendClubNewsNotif({
      articleId: item.id,
      title: item.title,
      category: item.category,
      summary: item.summary,
    });
    seen.add(item.id);
  }
  // Marquer le reste comme vu sans notif (évite une file de 20 notifs au prochain tick)
  for (const item of fresh.slice(MAX_NOTIFS_PER_TICK)) seen.add(item.id);
  await saveSeen(seen);

  return { newItems: toNotify, total: items.length };
}
