/**
 * News Man United — aligné sur onefootball-wrapper.
 * Priorité FR ; catégorie « Officiel » = annonces / confirmations club.
 */
import { Platform } from 'react-native';
import {
  CLUB_NEWS_CATEGORY_LABEL,
  ONEFOOTBALL_MU_TEAM_ID,
  type ClubNewsCategory,
} from '../constants/oneFootball';

export type ClubNewsItem = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: Exclude<ClubNewsCategory, 'all'>;
  source: string;
  published_at: string;
  url?: string | null;
  image_url?: string | null;
  verified?: boolean;
  language?: string;
};

const OF_HEADERS: Record<string, string> = {
  Accept: 'application/json, text/plain, */*',
  Origin: 'https://onefootball.com',
  Referer: 'https://onefootball.com/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

const mem = new Map<string, { at: number; items: ClubNewsItem[] }>();
const TTL = 90_000;

const OFFICIAL_PROVIDER_HINTS = [
  'manchester united',
  'manutd',
  'mufc',
  'united official',
  'official manchester',
];

function pythonBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_ONEFOOTBALL_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const api = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (api) {
    try {
      const u = new URL(api);
      return `${u.protocol}//${u.hostname}:8010`;
    } catch {
      /* fall through */
    }
  }
  return Platform.select({
    android: 'http://192.168.1.132:8010',
    ios: 'http://localhost:8010',
    default: 'http://localhost:8010',
  })!;
}

function isOfficialText(title: string, body = ''): boolean {
  const t = `${title} ${body.slice(0, 220)}`.toLowerCase();
  return (
    /officialise|officialisé|officialisation|annonce officielle|communiqué|confirme que|ont confirmé|a confirmé|united confirm|man utd confirm|manchester united confirm|club announce|statement|communiqué officiel|\bofficiel\b|nomination|nommé entraîneur|appointed|unveils|unveil|press release|retour à l['']entraînement|team news|blessure :|retour de blessure|a annoncé|ont annoncé/.test(
      t
    )
  );
}

function categorize(
  title: string,
  body = '',
  opts?: { verified?: boolean; officialProvider?: boolean }
): Exclude<ClubNewsCategory, 'all'> {
  if (opts?.verified || opts?.officialProvider || isOfficialText(title, body)) {
    return 'officiel';
  }
  const head = title.toLowerCase();
  const t = `${title} ${body.slice(0, 280)}`.toLowerCase();
  if (
    /transfer|signing|signed|\bloan\b|bid for|set to join|close to|pursuit|recrue|mercato|takeover|new signing|contract extension|prêt|signature|renouvelle|arrivée|départ|cible|piste|officialise|veut piller|suit une star/.test(
      head
    ) || /transfer window|loan deal|mercato|fenêtre des transferts/.test(t)
  ) {
    return 'mercato';
  }
  if (
    /how to watch|team news|line-?up|preview|match report|\bvs\b|\bv\b|comeback|win over|defeat|composition|avant-match|après-match|compte-rendu|comment suivre|victoire|défaite|nul face|succès contre|face à/.test(
      head
    ) || /final whistle|full-time|kick-off|champions league clash|coup d'envoi|coup de sifflet/.test(t)
  ) {
    return 'matchs';
  }
  if (
    /press conference|interview|gallery|video:|exclusive|conférence de presse|galerie|vidéo|exclusif|répond aux critiques/.test(
      head
    )
  ) {
    return 'medias';
  }
  if (
    /tribute|ownership|glazer|ratcliffe|supporter|community|academy|hommage|propriété|communauté|académie|admission|carrière/.test(
      head + t
    )
  ) {
    return 'club';
  }
  return 'club';
}

function upgradeImageUrl(url: string): string {
  try {
    if (!url.includes('image-service.onefootball.com')) return url;
    return url
      .replace(/([?&])w=\d+/g, '$1w=1200')
      .replace(/([?&])h=\d+/g, '$1h=800')
      .replace(/([?&])q=\d+/g, '$1q=55');
  } catch {
    return url;
  }
}

function pickImage(raw: Record<string, unknown>): string | null {
  const images = raw.images as Record<string, unknown> | undefined;
  if (images) {
    for (const key of ['large', 'thumb', 'share'] as const) {
      const u = images[key];
      if (typeof u === 'string' && u.startsWith('http')) return upgradeImageUrl(u);
    }
  }
  const media = raw.media;
  if (Array.isArray(media) && media[0] && typeof media[0] === 'object') {
    const imgs = (media[0] as { images?: Record<string, { link?: string }> }).images;
    const large = imgs?.large?.link;
    if (large) return upgradeImageUrl(large);
    const thumb = imgs?.thumb?.link;
    if (thumb) return upgradeImageUrl(thumb);
  }
  for (const key of ['image_url', 'imageUrl', 'thumbnail'] as const) {
    const u = raw[key];
    if (typeof u === 'string' && u.startsWith('http')) return upgradeImageUrl(u);
  }
  return null;
}

function providerInfo(raw: Record<string, unknown>): {
  name: string;
  verified: boolean;
  official: boolean;
} {
  const related = (raw.related_entities as Record<string, unknown> | undefined) ?? {};
  const provider = (related.provider as Record<string, unknown> | undefined) ?? {};
  const name = String(provider.display_name ?? provider.name ?? raw.source ?? '').trim();
  const verified = Boolean(provider.is_verified ?? raw.verified);
  const low = name.toLowerCase();
  const official = OFFICIAL_PROVIDER_HINTS.some((h) => low.includes(h));
  return { name: name || 'OneFootball', verified, official };
}

function normalize(raw: Record<string, unknown>): ClubNewsItem | null {
  const title = String(raw.title ?? raw.headline ?? '').trim();
  if (!title) return null;
  let body = String(raw.content ?? raw.teaser ?? raw.summary ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const id = String(raw.id ?? raw.object_id ?? title.slice(0, 40));
  const published = String(
    raw.publish_time ?? raw.date ?? raw.published_at ?? new Date().toISOString()
  );
  const url =
    (raw.content_url as string) ||
    (raw.share_link as string) ||
    (raw.url as string) ||
    (raw.link as string) ||
    (raw.item_link as string) ||
    null;
  const prov = providerInfo(raw);
  const language = String(raw.language ?? '').toLowerCase() || undefined;
  const category = categorize(title, body, {
    verified: prov.verified,
    officialProvider: prov.official,
  });
  return {
    id,
    title,
    summary: body.length > 320 ? `${body.slice(0, 320)}…` : body,
    body,
    category,
    source: prov.name,
    published_at: published,
    url,
    image_url: pickImage(raw),
    verified: prov.verified || prov.official || category === 'officiel',
    language,
  };
}

async function ofGet(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: OF_HEADERS });
  if (!res.ok) throw new Error(`OneFootball ${res.status}`);
  return res.json();
}

function ingestFeed(
  merged: Map<string, ClubNewsItem>,
  payload: unknown,
  opts?: { forceOfficial?: boolean }
) {
  if (!Array.isArray(payload)) return;
  for (const row of payload) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const ct = String(r.content_type ?? '');
    if (ct === 'ad' || ct === 'sticky_ad' || ct === 'banner') continue;
    const art = normalize(r);
    if (!art) continue;
    if (opts?.forceOfficial) {
      art.category = 'officiel';
      art.verified = true;
    }
    const prev = merged.get(art.id);
    if (!prev) {
      merged.set(art.id, art);
      continue;
    }
    // Préférer la version française si les deux existent sous le même id
    const preferNew =
      (art.language === 'fr' && prev.language !== 'fr') ||
      (!prev.body && !!art.body) ||
      (!prev.image_url && !!art.image_url);
    merged.set(art.id, preferNew ? { ...prev, ...art } : { ...art, ...prev });
  }
}

function isMuRelated(item: ClubNewsItem): boolean {
  const hay = `${item.title} ${item.summary}`.toLowerCase();
  return (
    item.verified ||
    /manchester united|man united|man utd|old trafford|red devils|mufc|amorim|carrick|rashford|bruno fernandes/.test(
      hay
    )
  );
}

async function fetchFromOneFootballDirect(): Promise<ClubNewsItem[]> {
  const tid = ONEFOOTBALL_MU_TEAM_ID;
  const frMerged = new Map<string, ClubNewsItem>();
  const enMerged = new Map<string, ClubNewsItem>();

  const frFeeds = await Promise.allSettled([
    ofGet(
      `https://api.onefootball.com/news/v2/fr/relevance/teams/${tid}/items?personalised=not_set&mediation=iPhone-premiumgeos-team_news`
    ),
    ofGet(`https://news.onefootball.com/v6/fr/teams/${tid}/items?only_verified=true`),
    ofGet(`https://news.onefootball.com/v6/fr/teams/${tid}/items`),
    ofGet(`https://search-api.onefootball.com/v2/fr/search?q=${encodeURIComponent('Manchester United')}`),
    ofGet(`https://search-api.onefootball.com/v2/fr/search?q=${encodeURIComponent('Man United')}`),
    ofGet(
      `https://search-api.onefootball.com/v2/fr/search?q=${encodeURIComponent('Manchester United officialise')}`
    ),
    ofGet(
      `https://search-api.onefootball.com/v2/fr/search?q=${encodeURIComponent('Manchester United confirme')}`
    ),
    ofGet(
      `https://search-api.onefootball.com/v2/fr/search?q=${encodeURIComponent('Manchester United annonce')}`
    ),
    ofGet(`https://search-api.onefootball.com/v2/fr/search?q=${encodeURIComponent('Old Trafford')}`),
    ofGet(`https://news.onefootball.com/v6/fr/competitions/9/items`),
  ]);

  frFeeds.forEach((res, i) => {
    if (res.status !== 'fulfilled') return;
    const data = res.value;
    const rows =
      data && typeof data === 'object' && !Array.isArray(data) && Array.isArray((data as { news?: unknown[] }).news)
        ? (data as { news: unknown[] }).news
        : data;
    // index 1 = only_verified
    ingestFeed(frMerged, rows, { forceOfficial: i === 1 });
  });

  let list = [...frMerged.values()].filter(isMuRelated);

  // Compléter en anglais seulement s'il manque d'actus FR
  if (list.length < 18) {
    const enFeeds = await Promise.allSettled([
      ofGet(
        `https://api.onefootball.com/news/v2/en/relevance/teams/${tid}/items?personalised=not_set&mediation=iPhone-premiumgeos-team_news`
      ),
      ofGet(`https://news.onefootball.com/v6/en/teams/${tid}/items`),
      ofGet(
        `https://search-api.onefootball.com/v2/en/search?q=${encodeURIComponent('Manchester United announce')}`
      ),
      ofGet(
        `https://search-api.onefootball.com/v2/en/search?q=${encodeURIComponent('Manchester United confirm')}`
      ),
    ]);
    enFeeds.forEach((res) => {
      if (res.status !== 'fulfilled') return;
      const data = res.value;
      const rows =
        data && typeof data === 'object' && !Array.isArray(data) && Array.isArray((data as { news?: unknown[] }).news)
          ? (data as { news: unknown[] }).news
          : data;
      ingestFeed(enMerged, rows);
    });
    const frIds = new Set(list.map((i) => i.id));
    const extras = [...enMerged.values()]
      .filter(isMuRelated)
      .filter((i) => !frIds.has(i.id));
    list = [...list, ...extras];
  }

  // FR d'abord, puis date
  list.sort((a, b) => {
    const fa = a.language === 'fr' ? 0 : 1;
    const fb = b.language === 'fr' ? 0 : 1;
    if (fa !== fb) return fa - fb;
    return String(b.published_at).localeCompare(String(a.published_at));
  });

  return list.slice(0, 80);
}

async function fetchFromPython(): Promise<ClubNewsItem[] | null> {
  try {
    const res = await fetch(`${pythonBase()}/news/united?limit=80`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { items?: ClubNewsItem[] };
    if (!Array.isArray(json.items) || !json.items.length) return null;
    return json.items.map((i) => {
      const category =
        i.category === 'officiel' || i.verified || isOfficialText(i.title, i.body || i.summary)
          ? 'officiel'
          : (i.category as ClubNewsItem['category']) || 'club';
      return {
        ...i,
        category,
        summary: i.summary || '',
        body: i.body || i.summary || '',
        verified: i.verified || category === 'officiel',
      };
    });
  } catch {
    return null;
  }
}

export async function fetchUnitedClubNews(force = false): Promise<ClubNewsItem[]> {
  const key = 'mu-fr';
  const hit = mem.get(key);
  if (!force && hit && Date.now() - hit.at < TTL) return hit.items;

  // Toujours privilégier le fetch FR direct ; Python en secours seulement
  let items = await fetchFromOneFootballDirect();
  if (!items.length) {
    const fromPy = await fetchFromPython();
    if (fromPy?.length) items = fromPy;
  }
  mem.set(key, { at: Date.now(), items });
  return items;
}

export function filterClubNews(
  items: ClubNewsItem[],
  category: ClubNewsCategory,
  query = ''
): ClubNewsItem[] {
  let out = items;
  if (category === 'officiel') {
    out = out.filter(
      (i) => i.category === 'officiel' || i.verified || isOfficialText(i.title, i.body || i.summary)
    );
  } else if (category !== 'all') {
    out = out.filter((i) => i.category === category);
  }
  const q = query.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (i) => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q)
    );
  }
  return out;
}

export function categoryLabel(cat: ClubNewsItem['category']): string {
  return CLUB_NEWS_CATEGORY_LABEL[cat] ?? cat;
}

export function relativeTimeFr(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const diff = Date.now() - t;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
