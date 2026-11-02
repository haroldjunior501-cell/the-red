export type LegalDocumentKey = 'privacy' | 'terms' | 'privacyPolicy';

type LegalDocument = {
  key: LegalDocumentKey;
  title: string;
  path: string;
};

const LEGAL_BASE =
  process.env.EXPO_PUBLIC_LEGAL_BASE_URL?.trim().replace(/\/$/, '') || 'https://goalya.app';

const DOCUMENTS: readonly LegalDocument[] = [
  { key: 'privacy', title: 'Vie privée', path: '/legal/privacy' },
  { key: 'terms', title: "Conditions d'utilisation", path: '/legal/terms' },
  {
    key: 'privacyPolicy',
    title: 'Politique de confidentialité',
    path: '/legal/privacy-policy',
  },
] as const;

const OVERRIDES: Partial<Record<LegalDocumentKey, string | undefined>> = {
  privacy: process.env.EXPO_PUBLIC_LEGAL_PRIVACY_URL?.trim(),
  terms: process.env.EXPO_PUBLIC_LEGAL_TERMS_URL?.trim(),
  privacyPolicy: process.env.EXPO_PUBLIC_LEGAL_PRIVACY_POLICY_URL?.trim(),
};

export function getLegalDocumentUrl(key: LegalDocumentKey): string {
  const override = OVERRIDES[key];
  if (override) return override;
  const doc = DOCUMENTS.find((d) => d.key === key);
  return doc ? `${LEGAL_BASE}${doc.path}` : LEGAL_BASE;
}

export function getLegalDocumentTitle(key: LegalDocumentKey): string {
  return DOCUMENTS.find((d) => d.key === key)?.title ?? 'Document légal';
}

export const SUPPORT_EMAIL =
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || 'support@goalya.app';
