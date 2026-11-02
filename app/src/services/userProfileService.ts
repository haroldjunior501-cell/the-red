import { getDownloadURL, ref } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';

const photoCache = new Map<string, string | null>();

function storageSafe() {
  try {
    return getFirebaseStorage();
  } catch {
    return null;
  }
}

/** Firebase Storage : users/{userId}/profilePhoto */
export async function fetchUserProfilePhotoUrl(userId: string): Promise<string | null> {
  if (!userId) return null;
  if (photoCache.has(userId)) return photoCache.get(userId) ?? null;

  const st = storageSafe();
  if (!st) {
    photoCache.set(userId, null);
    return null;
  }

  try {
    const url = await getDownloadURL(ref(st, `users/${userId}/profilePhoto`));
    photoCache.set(userId, url);
    return url;
  } catch {
    photoCache.set(userId, null);
    return null;
  }
}

export function clearProfilePhotoCache(userId?: string) {
  if (userId) photoCache.delete(userId);
  else photoCache.clear();
}
