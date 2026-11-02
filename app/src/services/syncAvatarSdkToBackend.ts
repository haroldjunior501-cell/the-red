/**
 * Envoie l’URL du modèle 3D MetaPerson vers ton API GOALYA.
 * Définis `EXPO_PUBLIC_API_URL` et un `userId` non vide pour activer l’appel.
 */
export async function syncAvatarSdkToBackend(params: {
  userId: string;
  countryCode: string;
  metaPersonModelUrl: string;
}): Promise<void> {
  const base =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL
      ? String(process.env.EXPO_PUBLIC_API_URL).trim().replace(/\/$/, '')
      : '';
  const modelUrl = params.metaPersonModelUrl.trim();
  if (!base || !params.userId || !modelUrl) return;

  await fetch(`${base}/users/${encodeURIComponent(params.userId)}/avatar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countryCode: params.countryCode,
      metaPersonModelUrl: modelUrl,
      modelUrl,
    }),
  });
}
