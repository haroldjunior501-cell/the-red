import Constants from 'expo-constants';

const STRIPE_API_PORT = 4242;

/**
 * En dev, déduit l’IP du PC depuis Metro (ex. 192.168.1.12:8081 → http://192.168.1.12:4242).
 * Permet au téléphone sur le même Wi‑Fi d’atteindre le serveur Stripe sans config manuelle.
 */
export function guessStripeApiUrlFromMetro(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  if (!hostUri) return '';

  const host = hostUri.replace(/^exp:\/\//, '').split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return `http://localhost:${STRIPE_API_PORT}`;
  }
  return `http://${host}:${STRIPE_API_PORT}`;
}
