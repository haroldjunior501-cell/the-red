import { isApiConfigured } from '../services/apiClient';
import { isExpoGo } from './expoRuntime';
import { getStripeSetupStatus } from './stripeSetupStatus';
import { isValidStripePublishableKey } from './stripeKeys';

export { isExpoGo } from './expoRuntime';

export function hasStripePublishableKey(): boolean {
  return isValidStripePublishableKey(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

/** Serveur Stripe + compte (conversions FP, API). */
export function canUseStripeApi(loggedIn: boolean): boolean {
  return isApiConfigured() && loggedIn;
}

/** Paiement carte / Payment Sheet : build natif obligatoire (pas Expo Go). */
export function canUseStripePayments(loggedIn: boolean): boolean {
  if (isExpoGo()) return false;
  return canUseStripeApi(loggedIn) && hasStripePublishableKey();
}

export function stripeStatusMessage(loggedIn: boolean): string {
  const status = getStripeSetupStatus(loggedIn);
  if (status.hints.length) return status.hints.join('\n');
  if (canUseStripePayments(loggedIn)) return '';
  if (canUseStripeApi(loggedIn)) {
    return 'Conversion FP disponible. Paiement carte : build natif requis (npx expo run:ios), pas Expo Go.';
  }
  return 'Configure Stripe (clés .env + npm run server:stripe).';
}

export function stripeUnavailableReason(loggedIn = true): string {
  const status = getStripeSetupStatus(loggedIn);
  if (status.hints.length) return status.hints.join('\n');
  return 'Paiements Stripe indisponibles.';
}
