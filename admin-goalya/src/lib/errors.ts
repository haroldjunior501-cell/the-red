const HINTS: Record<string, string> = {
  'not-found':
    'Cloud Firestore n’est pas créé sur ce projet. Console Firebase → Firestore → Créer une base de données (mode production), puis réessaie.',
  'permission-denied':
    'Règles Firestore/Storage : déploie app/firebase/*.rules et reconnecte-toi en admin.',
  'storage/unauthorized':
    'Upload Storage refusé : règles Storage non déployées ou session admin expirée (déconnexion + reconnexion).',
};

export function formatFirebaseError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { code?: string; message?: string };
    const code = e.code ?? '';
    const hint = HINTS[code];
    const base = [code, e.message].filter(Boolean).join(' — ');
    return hint ? `${base}\n\n${hint}` : base || 'Échec publication';
  }
  return err instanceof Error ? err.message : 'Échec publication';
}
