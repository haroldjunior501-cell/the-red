import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { getFirebaseAuth } from '../services/firebase';

/** UID Firebase Auth (requis pour les écritures Firestore sécurisées). */
export function useFirebaseAuthUid(): string | null {
  const [uid, setUid] = useState<string | null>(() => {
    try {
      return getFirebaseAuth().currentUser?.uid ?? null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      return onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null));
    } catch {
      return undefined;
    }
  }, []);

  return uid;
}
