import Constants from 'expo-constants';
import { guessStripeApiUrlFromMetro } from '../utils/devApiUrl';
import { getFirebaseAuth } from './firebase';

function readConfiguredApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const fromExtra = (
    Constants.expoConfig?.extra as { stripeApiUrl?: string } | undefined
  )?.stripeApiUrl?.trim();
  if (fromExtra) return fromExtra.replace(/\/$/, '');

  if (__DEV__) {
    return guessStripeApiUrlFromMetro();
  }
  return '';
}

export function getApiBaseUrl(): string {
  return readConfiguredApiUrl();
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

export async function fetchWithFirebaseAuth(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'API GOALYA non configurée. Ajoute EXPO_PUBLIC_API_URL dans .env (URL du serveur Stripe).'
    );
  }

  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error('Connecte-toi pour effectuer cette action.');
  }

  const token = await user.getIdToken();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;

  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}

export async function parseApiJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof data === 'object' && data && 'error' in data && data.error
        ? String(data.error)
        : `Erreur serveur (${res.status})`
    );
  }
  return data;
}
