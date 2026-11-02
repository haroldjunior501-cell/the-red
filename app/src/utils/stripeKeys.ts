/** Clé publique Stripe valide (pk_test_ ou pk_live_). */
export function isValidStripePublishableKey(key: string | undefined | null): boolean {
  const k = key?.trim() ?? '';
  return k.startsWith('pk_test_') || k.startsWith('pk_live_');
}
