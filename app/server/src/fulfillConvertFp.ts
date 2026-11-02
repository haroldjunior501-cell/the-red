import { FieldValue } from 'firebase-admin/firestore';
import { findConversion } from './budgetConversions.js';
import { getFirestore } from './firebaseAdmin.js';

export type ConvertFulfillResult =
  | { ok: true; fantasyPoints: number; fantasyBudget: number }
  | { ok: false; error: string };

export async function fulfillConvertFp(
  userId: string,
  fpCost: number,
  budgetGain: number,
  referenceId: string
): Promise<ConvertFulfillResult> {
  const conversion = findConversion(fpCost, budgetGain);
  if (!conversion) {
    return { ok: false, error: 'Conversion invalide' };
  }

  const db = getFirestore();
  const userRef = db.doc(`users/${userId}`);
  const txRef = db.doc(`users/${userId}/fantasy_transactions/${referenceId}`);

  try {
    return await db.runTransaction(async (transaction) => {
      const [txSnap, userSnap] = await Promise.all([transaction.get(txRef), transaction.get(userRef)]);

      if (txSnap.exists) {
        const data = userSnap.data();
        return {
          ok: true,
          fantasyPoints: data?.fantasyPoints ?? 0,
          fantasyBudget: data?.fantasyBudget ?? 100,
        };
      }

      const currentFp = userSnap.data()?.fantasyPoints ?? 0;
      const currentBudget = userSnap.data()?.fantasyBudget ?? 100;

      if (currentFp < fpCost) {
        return { ok: false, error: 'FP insuffisants' };
      }

      const nextFp = currentFp - fpCost;
      const nextBudget = currentBudget + budgetGain;

      transaction.set(
        userRef,
        {
          fantasyPoints: nextFp,
          fantasyBudget: nextBudget,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      transaction.set(txRef, {
        id: referenceId,
        type: 'spend',
        amount: -fpCost,
        description: `+${budgetGain}M€ budget`,
        source: 'budget_conversion',
        referenceId,
        fpCost,
        budgetGain,
        timestamp: Date.now(),
      });

      return { ok: true, fantasyPoints: nextFp, fantasyBudget: nextBudget };
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur conversion';
    return { ok: false, error: msg };
  }
}
