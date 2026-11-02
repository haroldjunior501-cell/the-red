import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from './firebaseAdmin.js';
import type { FpPackId } from './fpPacks.js';
import { getPack, totalFp } from './fpPacks.js';

export type FulfillResult =
  | { ok: true; fantasyPoints: number; alreadyFulfilled?: boolean }
  | { ok: false; error: string };

/**
 * Crédite les FP après paiement Stripe validé (idempotent via paymentIntentId).
 */
export async function fulfillFpPurchase(
  userId: string,
  paymentIntentId: string,
  packId: FpPackId,
  fpAmount: number
): Promise<FulfillResult> {
  const pack = getPack(packId);
  if (!pack || totalFp(pack) !== fpAmount) {
    return { ok: false, error: 'Pack invalide' };
  }

  const db = getFirestore();
  const userRef = db.doc(`users/${userId}`);
  const txRef = db.doc(`users/${userId}/fantasy_transactions/stripe_pi_${paymentIntentId}`);

  return db.runTransaction(async (transaction) => {
    const [existing, userSnap] = await Promise.all([
      transaction.get(txRef),
      transaction.get(userRef),
    ]);

    if (existing.exists) {
      const pts = userSnap.data()?.fantasyPoints ?? 0;
      return { ok: true, fantasyPoints: pts, alreadyFulfilled: true };
    }

    const current = userSnap.data()?.fantasyPoints ?? 0;
    const next = current + fpAmount;

    transaction.set(
      userRef,
      {
        fantasyPoints: next,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    transaction.set(txRef, {
      id: `stripe_pi_${paymentIntentId}`,
      type: 'purchase',
      amount: fpAmount,
      description: `Pack ${pack.label}`,
      source: 'stripe_pack',
      referenceId: `stripe_pi_${paymentIntentId}`,
      packId,
      paymentIntentId,
      timestamp: Date.now(),
    });

    return { ok: true, fantasyPoints: next };
  });
}
