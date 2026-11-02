import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from './firebaseAdmin.js';
import { getQuickBoost, type QuickBoostId } from './quickBoosts.js';

export type BoostFulfillResult =
  | { ok: true; fantasyBudget: number; alreadyFulfilled?: boolean }
  | { ok: false; error: string };

export async function fulfillQuickBoost(
  userId: string,
  paymentIntentId: string,
  boostId: QuickBoostId,
  budgetGain: number
): Promise<BoostFulfillResult> {
  const boost = getQuickBoost(boostId);
  if (!boost || boost.gain !== budgetGain) {
    return { ok: false, error: 'Boost invalide' };
  }

  const db = getFirestore();
  const userRef = db.doc(`users/${userId}`);
  const txRef = db.doc(`users/${userId}/fantasy_transactions/stripe_boost_${paymentIntentId}`);

  return db.runTransaction(async (transaction) => {
    const [existing, userSnap] = await Promise.all([transaction.get(txRef), transaction.get(userRef)]);

    if (existing.exists) {
      const budget = userSnap.data()?.fantasyBudget ?? 100;
      return { ok: true, fantasyBudget: budget, alreadyFulfilled: true };
    }

    const currentBudget = userSnap.data()?.fantasyBudget ?? 100;
    const nextBudget = currentBudget + budgetGain;

    transaction.set(
      userRef,
      {
        fantasyBudget: nextBudget,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    transaction.set(txRef, {
      id: `stripe_boost_${paymentIntentId}`,
      type: 'purchase',
      amount: budgetGain,
      description: boost.label,
      source: 'stripe_quick_boost',
      referenceId: `stripe_boost_${paymentIntentId}`,
      boostId,
      paymentIntentId,
      timestamp: Date.now(),
    });

    return { ok: true, fantasyBudget: nextBudget };
  });
}
