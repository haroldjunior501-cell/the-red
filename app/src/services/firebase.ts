import AsyncStorage from '@react-native-async-storage/async-storage';
import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth, initializeAuth, type Persistence } from 'firebase/auth';
import * as firebaseAuth from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type Database, getDatabase } from 'firebase/database';
import { type FirebaseStorage, getStorage } from 'firebase/storage';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let rtdb: Database | null = null;
let storage: FirebaseStorage | null = null;

function readFirebaseConfig() {
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? '',
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL?.trim() ?? '',
  };
}

/**
 * Initialisation **paresseuse** : évite de crasher au démarrage si le `.env` n’est pas encore chargé.
 * Les variables `EXPO_PUBLIC_*` sont intégrées au bundle au démarrage Metro — pense à `npx expo start -c`.
 */
export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  const cfg = readFirebaseConfig();
  const missing: string[] = [];
  if (!cfg.apiKey) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY');
  if (!cfg.authDomain) missing.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!cfg.projectId) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  if (!cfg.storageBucket) missing.push('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!cfg.messagingSenderId) missing.push('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!cfg.appId) missing.push('EXPO_PUBLIC_FIREBASE_APP_ID');
  if (!cfg.databaseURL) missing.push('EXPO_PUBLIC_FIREBASE_DATABASE_URL');
  if (missing.length) {
    throw new Error(
      `Firebase incomplet : ${missing.join(', ')}. Ajoute-les dans le fichier .env à la racine de GOALYA/app puis relance Metro avec : npx expo start -c`
    );
  }
  app = getApps().length ? getApp() : initializeApp(cfg);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();
  const persistenceFactory = (firebaseAuth as typeof firebaseAuth & {
    getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
  }).getReactNativePersistence;
  const persistence = persistenceFactory?.(AsyncStorage);
  try {
    auth = persistence
      ? initializeAuth(firebaseApp, { persistence })
      : getAuth(firebaseApp);
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'auth/already-initialized') {
      auth = getAuth(firebaseApp);
    } else {
      throw e;
    }
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!firestore) firestore = getFirestore(getFirebaseApp(), 'default');
  return firestore;
}

export function getFirebaseRtdb(): Database {
  if (!rtdb) rtdb = getDatabase(getFirebaseApp());
  return rtdb;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getFirebaseApp());
  return storage;
}
