import { useCallback, useState } from 'react';
import type { FpPackId } from '../constants/fantasyEconomy';
import type { QuickBoostId } from '../constants/quickBoosts';

export type StripePurchaseResult =
  | { ok: true; fantasyPoints: number }
  | { ok: false; cancelled?: boolean; error: string };

export type StripeBoostResult =
  | { ok: true; fantasyBudget: number }
  | { ok: false; cancelled?: boolean; error: string };

export type ConvertFpResult =
  | { ok: true; fantasyPoints: number; fantasyBudget: number }
  | { ok: false; error: string };

/** Stub sans import Stripe — Expo Go plante si `@stripe/stripe-react-native` est chargé. */
export function useStripeFpPurchase(_userId: string, _onBalanceRefresh: () => void) {
  const [purchasing] = useState(false);

  const purchasePack = useCallback(async (_packId: FpPackId): Promise<StripePurchaseResult> => {
    return { ok: false, error: 'Paiements indisponibles dans Expo Go.' };
  }, []);

  const purchaseBoost = useCallback(async (_boostId: QuickBoostId): Promise<StripeBoostResult> => {
    return { ok: false, error: 'Paiements indisponibles dans Expo Go.' };
  }, []);

  const convertPoints = useCallback(async (_points: number): Promise<ConvertFpResult> => {
    return { ok: false, error: 'Conversion indisponible dans Expo Go.' };
  }, []);

  return { purchasing, purchasePack, purchaseBoost, convertPoints };
}
