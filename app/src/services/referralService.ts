import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import { sanitizeForFirestore } from './fantasyService';

function firestoreSafe() {
  try {
    return getFirestoreDb();
  } catch {
    return null;
  }
}

/** Liste les filleuls enregistrés pour un parrain. */
export async function listReferralIds(referrerUserId: string): Promise<string[]> {
  const fs = firestoreSafe();
  if (!fs || !referrerUserId) return [];
  try {
    const snap = await getDocs(collection(fs, `users/${referrerUserId}/referrals`));
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

/**
 * Enregistre un parrainage réussi (à appeler après inscription d’un ami).
 * Idempotent : un filleul ne peut être compté qu’une fois.
 */
/** Lit `referredBy` sur le profil et crédite le parrain (idempotent). */
export async function applyReferralFromUserProfile(newUserId: string): Promise<void> {
  const fs = firestoreSafe();
  if (!fs || !newUserId) return;
  try {
    const snap = await getDoc(doc(fs, `users/${newUserId}`));
    const referredBy = snap.data()?.referredBy;
    if (typeof referredBy === 'string' && referredBy.trim()) {
      await recordSuccessfulReferral(referredBy.trim(), newUserId);
    }
  } catch {
    /* ignore */
  }
}

export async function recordSuccessfulReferral(
  referrerUserId: string,
  invitedUserId: string
): Promise<boolean> {
  const fs = firestoreSafe();
  if (!fs || !referrerUserId || !invitedUserId || referrerUserId === invitedUserId) {
    return false;
  }
  try {
    await setDoc(
      doc(fs, `users/${referrerUserId}/referrals/${invitedUserId}`),
      sanitizeForFirestore({
        invitedUserId,
        createdAt: Date.now(),
      })
    );
    return true;
  } catch {
    return false;
  }
}
