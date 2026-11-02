import { getApiBaseUrl } from './apiClient';

/** Vérifie que le serveur Stripe répond (dev / prod). */
export async function checkStripeApiHealth(timeoutMs = 4000): Promise<boolean> {
  const base = getApiBaseUrl();
  if (!base) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${base}/health`, { signal: controller.signal });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
