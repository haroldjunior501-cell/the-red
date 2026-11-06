/** Origin / Referer app (bundle id THE RED). */
export const YOUTUBE_EMBED_ORIGIN = 'https://com.thered.app';

export type YoutubePlaybackMode = 'embed' | 'watch';

/** Extrait l’ID YouTube depuis une URL ou un ID brut. */
export function youtubeIdFromUri(uri: string | null | undefined): string | null {
  if (!uri) return null;
  const m = uri.match(
    /(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  if (m?.[1]) return m[1];
  if (/^[\w-]{11}$/.test(uri.trim())) return uri.trim();
  return null;
}

/**
 * Les résumés / highlights @manutd bloquent souvent l’embed iframe.
 * → mode "watch" (page mobile YouTube in-app).
 * Le reste (Inside Carrington, training…) accepte l’embed.
 */
export function preferredYoutubeMode(title?: string | null): YoutubePlaybackMode {
  if (!title) return 'embed';
  const t = title.toLowerCase();
  if (
    t.includes('highlight') ||
    t.includes('extended') ||
    t.includes('90 in 20') ||
    t.includes('all the goals') ||
    /\b\d+\s*[-–]\s*\d+\b/.test(t)
  ) {
    return 'watch';
  }
  return 'embed';
}

/** Page mobile YouTube — pour les vidéos qui refusent l’embed. */
export function youtubeWatchUrl(videoId: string): string {
  return `https://m.youtube.com/watch?v=${videoId}&app=m`;
}

export function youtubeEmbedUrl(
  videoId: string,
  opts?: { autoplay?: boolean; mute?: boolean; loop?: boolean; controls?: boolean }
): string {
  const autoplay = opts?.autoplay === false ? 0 : 1;
  const mute = opts?.mute ? 1 : 0;
  const controls = opts?.controls === false ? 0 : 1;
  const loop = opts?.loop ? `&loop=1&playlist=${videoId}` : '';
  return (
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=${autoplay}&mute=${mute}&playsinline=1&rel=0&modestbranding=1` +
    `&controls=${controls}&fs=1&enablejsapi=1&origin=${encodeURIComponent(YOUTUBE_EMBED_ORIGIN)}${loop}`
  );
}

export function youtubeEmbedHtml(
  videoId: string,
  opts?: { autoplay?: boolean; mute?: boolean; loop?: boolean; controls?: boolean }
): string {
  const src = youtubeEmbedUrl(videoId, opts);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <style>
    html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}
    iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  </style>
</head>
<body>
  <iframe
    src="${src}"
    title="YouTube"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</body>
</html>`;
}
