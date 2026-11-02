import Constants from 'expo-constants';

/**
 * Lit le jeton Mapbox public : `process.env` (Metro) puis repli `expo.extra` (app.config).
 * Normalise guillemets / espaces / BOM souvent présents dans `.env`.
 */
export function readExpoMapboxToken(): string {
  let raw = (process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '').trim();
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const fromExtra = extra?.mapboxPublicToken;
  if (!raw && typeof fromExtra === 'string') {
    raw = fromExtra.trim();
  }
  raw = raw.replace(/^\uFEFF/, '');
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim();
  }
  return raw;
}

export function isMapboxPublicTokenConfigured(token: string): boolean {
  return token.length > 0 && !token.toUpperCase().includes('PLACEHOLDER') && token.startsWith('pk.');
}
