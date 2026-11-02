/**
 * Stickers Giphy pour le chat Mon Armée (Guerre Map).
 * Clé : `EXPO_PUBLIC_GIPHY_API_KEY` dans `.env` (developers.giphy.com).
 */

export type GiphySticker = {
  id: string;
  title: string;
  previewUrl: string;
  gifUrl: string;
};

function getApiKey(): string {
  return (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GIPHY_API_KEY) || '';
}

function mapSticker(raw: Record<string, unknown>): GiphySticker | null {
  const id = raw.id;
  if (typeof id !== 'string') return null;
  const title = typeof raw.title === 'string' ? raw.title : '';
  const images = raw.images as Record<string, { url?: string }> | undefined;
  const img = images ?? {};
  const previewUrl =
    img.fixed_width_small?.url ?? img.preview_gif?.url ?? img.fixed_width?.url ?? '';
  const gifUrl = img.fixed_width?.url ?? img.downsized_medium?.url ?? img.preview_gif?.url ?? previewUrl;
  if (!previewUrl && !gifUrl) return null;
  return { id, title, previewUrl, gifUrl };
}

async function fetchJson(url: string): Promise<GiphySticker[]> {
  const key = getApiKey();
  if (!key.trim()) {
    console.warn('[giphyService] EXPO_PUBLIC_GIPHY_API_KEY manquante — stickers désactivés.');
    return [];
  }
  const res = await fetch(url);
  if (!res.ok) {
    console.warn('[giphyService] HTTP', res.status, await res.text().catch(() => ''));
    return [];
  }
  const json = (await res.json()) as { data?: unknown[] };
  const rows = Array.isArray(json.data) ? json.data : [];
  const out: GiphySticker[] = [];
  for (const x of rows) {
    if (typeof x !== 'object' || x === null) continue;
    const m = mapSticker(x as Record<string, unknown>);
    if (m) out.push(m);
  }
  return out;
}

export async function getTrendingStickers(): Promise<GiphySticker[]> {
  const key = encodeURIComponent(getApiKey());
  return fetchJson(`https://api.giphy.com/v1/stickers/trending?api_key=${key}&limit=21&rating=g`);
}

export async function searchStickers(query: string): Promise<GiphySticker[]> {
  const key = encodeURIComponent(getApiKey());
  const q = encodeURIComponent(query.trim());
  if (!q) return getTrendingStickers();
  return fetchJson(`https://api.giphy.com/v1/stickers/search?api_key=${key}&q=${q}&limit=21&rating=g`);
}

export async function getFootballStickers(): Promise<GiphySticker[]> {
  return searchStickers('football celebration goal');
}
