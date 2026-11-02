import { getApiBaseUrl } from '../services/apiClient';

/** Vérifie si le serveur Stripe peut créditer les FP (compte de service Firebase). */
export async function isStripeFirebaseReady(): Promise<boolean> {
  const base = getApiBaseUrl();
  if (!base) return false;
  try {
    const res = await fetch(`${base}/health`);
    if (!res.ok) return false;
    const data = (await res.json()) as { firebaseReady?: boolean };
    return data.firebaseReady === true;
  } catch {
    return false;
  }
}
