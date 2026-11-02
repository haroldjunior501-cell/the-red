import Constants from 'expo-constants';
import { getApiBaseUrl, isApiConfigured } from '../services/apiClient';
import { isExpoGo } from './expoRuntime';
import { isValidStripePublishableKey } from './stripeKeys';

export type StripeSetupStatus = {
  expoGo: boolean;
  publishableKey: boolean;
  apiUrl: string;
  apiConfigured: boolean;
  ready: boolean;
  hints: string[];
};

export function getStripeSetupStatus(loggedIn: boolean): StripeSetupStatus {
  const expoGo = isExpoGo();
  const publishableKey = isValidStripePublishableKey(
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
  const apiUrl = getApiBaseUrl();
  const apiConfigured = isApiConfigured();
  const hints: string[] = [];

  if (expoGo) {
    hints.push('Build natif requis : npx expo run:ios ou run:android (pas Expo Go).');
  }
  if (!publishableKey) {
    hints.push('Ajoute EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_… dans app/.env');
    hints.push('Ou lance : npm run stripe:configure');
  }
  if (!apiConfigured) {
    hints.push('Lance npm run server:stripe et vérifie http://localhost:4242/health');
    hints.push('Sur téléphone : même Wi‑Fi ou EXPO_PUBLIC_API_URL=http://IP_DU_PC:4242');
  } else if (publishableKey && !expoGo) {
    hints.push('Serveur : ' + apiUrl + '/health (ok + firebaseReady:true)');
    hints.push('Fichier server/firebase-service-account.json requis pour créditer les FP');
  }
  if (!loggedIn) {
    hints.push('Connecte-toi à GOALYA (Firebase Auth).');
  }

  const ready = !expoGo && publishableKey && apiConfigured && loggedIn;

  return {
    expoGo,
    publishableKey,
    apiUrl,
    apiConfigured,
    ready,
    hints,
  };
}

export function stripeSetupSummary(): string {
  return getStripeSetupStatus(true).hints.join('\n');
}
