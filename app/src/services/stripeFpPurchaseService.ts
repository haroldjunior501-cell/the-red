import type { FpPackId } from '../constants/fantasyEconomy';
import type { QuickBoostId } from '../constants/quickBoosts';
import { fetchWithFirebaseAuth, isApiConfigured, parseApiJson } from './apiClient';

export type FpPaymentIntentResponse = {
  paymentIntentId: string;
  clientSecret: string;
  packId: FpPackId;
  fpAmount: number;
  amountEur: number;
};

export type BoostPaymentIntentResponse = {
  paymentIntentId: string;
  clientSecret: string;
  boostId: QuickBoostId;
  budgetGain: number;
  amountEur: number;
};

export type FpFulfillResponse = {
  ok: true;
  fantasyPoints: number;
  alreadyFulfilled?: boolean;
};

export type BoostFulfillResponse = {
  ok: true;
  fantasyBudget: number;
  alreadyFulfilled?: boolean;
};

export type ConvertFpResponse = {
  success: true;
  fantasyPoints: number;
  fantasyBudget: number;
};

export function assertStripeConvertApiReady(): void {
  if (!isApiConfigured()) {
    throw new Error(
      'Conversion indisponible : lance npm run server:stripe et vérifie EXPO_PUBLIC_API_URL dans .env.'
    );
  }
}

export function assertStripeApiReady(): void {
  assertStripeConvertApiReady();
  const pk = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (!pk?.startsWith('pk_test_') && !pk?.startsWith('pk_live_')) {
    throw new Error(
      'Stripe non configuré : ajoute EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY (clé publique pk_test_…) dans .env.'
    );
  }
}

export async function convertFpToBudgetViaApi(
  fpCost: number,
  budgetGain: number
): Promise<ConvertFpResponse> {
  assertStripeConvertApiReady();
  const res = await fetchWithFirebaseAuth('/stripe/convert-fp-to-budget', {
    method: 'POST',
    body: JSON.stringify({ fpCost, budgetGain }),
  });
  return parseApiJson<ConvertFpResponse>(res);
}

export async function createFpPaymentIntent(packId: FpPackId): Promise<FpPaymentIntentResponse> {
  assertStripeApiReady();
  const res = await fetchWithFirebaseAuth('/stripe/fp-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ packId }),
  });
  return parseApiJson<FpPaymentIntentResponse>(res);
}

export async function createBoostPaymentIntent(
  boostId: QuickBoostId
): Promise<BoostPaymentIntentResponse> {
  assertStripeApiReady();
  const res = await fetchWithFirebaseAuth('/stripe/boost-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ boostId }),
  });
  return parseApiJson<BoostPaymentIntentResponse>(res);
}

export async function fulfillFpPurchaseAfterPayment(
  paymentIntentId: string
): Promise<FpFulfillResponse> {
  assertStripeApiReady();
  const res = await fetchWithFirebaseAuth('/stripe/fp-fulfill', {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId }),
  });
  return parseApiJson<FpFulfillResponse>(res);
}

export async function fulfillQuickBoostAfterPayment(
  paymentIntentId: string
): Promise<BoostFulfillResponse> {
  assertStripeApiReady();
  const res = await fetchWithFirebaseAuth('/stripe/boost-fulfill', {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId }),
  });
  return parseApiJson<BoostFulfillResponse>(res);
}
