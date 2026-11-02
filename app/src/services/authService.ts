import * as AuthSession from 'expo-auth-session';
import { AuthRequest, exchangeCodeAsync, makeRedirectUri, ResponseType } from 'expo-auth-session';
import { discovery as googleDiscovery } from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase';

function friendlyAuthError(err: unknown): string {
  const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message?: string }).message) : '';
  const code =
    typeof err === 'object' && err && 'code' in err ? String((err as { code?: string }).code) : '';

  if (code.includes('auth/invalid-credential')) {
    return 'Identifiants refusés par Firebase. Vérifie que Google est activé dans Firebase Auth et que EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID est le client Web du même projet que tes clés Firebase.';
  }
  if (code.includes('auth/operation-not-allowed')) {
    return 'Ce fournisseur (Google ou Apple) n’est pas activé dans la console Firebase (Authentication > Sign-in method).';
  }
  if (code.includes('auth/configuration-not-found')) {
    return 'Configuration Firebase Auth manquante ou incorrecte (clés .env / projet Firebase).';
  }
  if (code.includes('auth/invalid-email')) return 'Email invalide.';
  if (code.includes('auth/email-already-in-use')) return 'Cet email est déjà utilisé.';
  if (code.includes('auth/weak-password')) return 'Mot de passe trop faible (6 caractères minimum).';
  if (code.includes('auth/wrong-password')) return 'Mot de passe incorrect.';
  if (code.includes('auth/user-not-found')) return 'Aucun compte trouvé avec cet email.';
  if (code.includes('auth/network-request-failed')) return 'Problème de connexion. Réessaie.';
  if (code.includes('auth/popup-closed-by-user')) return 'Connexion annulée.';
  if (code.includes('auth/cancelled-popup-request')) return 'Connexion annulée.';

  if (msg.toLowerCase().includes('cancel')) return 'Connexion annulée.';
  if (msg.includes('Variable d’environnement')) return msg;
  if (msg.includes('Configuration Google')) return msg;
  if (msg.includes('Token Google')) return msg;
  if (msg.includes('Firebase incomplet')) return msg;

  if (__DEV__ && code) return `${msg || 'Erreur'} [${code}]`;
  return 'Une erreur est survenue. Réessaie.';
}

type GoogleOAuthConfig = {
  clientId: string;
  redirectUri: string;
  platformLabel: string;
};

/** Schéma URL imposé par Google pour les clients OAuth natifs iOS / Android. */
function googleNativeRedirectUri(oauthClientId: string): string {
  const id = oauthClientId.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${id}:/oauthredirect`;
}

function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * URI de redirection OAuth (schéma goalya sur web — clients natifs = schéma Google).
 */
export function getGoogleOAuthRedirectUri(): string {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? '';
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ?? '';

  if (Platform.OS === 'ios' && iosClientId) {
    return googleNativeRedirectUri(iosClientId);
  }
  if (Platform.OS === 'android' && androidClientId) {
    return googleNativeRedirectUri(androidClientId);
  }

  return makeRedirectUri({
    scheme: 'goalya',
    path: 'oauthredirect',
    preferLocalhost: Platform.OS === 'web',
  });
}

function resolveGoogleOAuthConfig(): GoogleOAuthConfig {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? '';
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ?? '';

  if (Platform.OS === 'ios') {
    if (isRunningInExpoGo()) {
      throw new Error(
        'Connexion Google indisponible dans Expo Go sur iOS (erreur 400 invalid_request).\n\n' +
          'Utilise un build de développement GOALYA :\n' +
          '  npx expo run:ios\n\n' +
          'Le client iOS est lié au bundle com.goalya.app, pas à Expo Go.'
      );
    }
    if (!iosClientId) {
      throw new Error(
        'Connexion Google sur iPhone/iPad : remplis EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID dans le fichier .env à la racine du projet.\n\n' +
          'Où le trouver :\n' +
          '1. Firebase Console → ton projet GOALYA → Paramètres du projet (engrenage)\n' +
          '2. Ajoute une app iOS si besoin (bundle : com.goalya.app)\n' +
          '3. Authentication → Méthode de connexion → Google → active\n' +
          '4. Ou Google Cloud → Identifiants → Créer ID client OAuth → iOS → bundle com.goalya.app\n' +
          '5. Copie l’ID (…apps.googleusercontent.com) dans .env\n' +
          '6. Relance : npx expo start -c\n\n' +
          'Tu as déjà le client Web ; le client iOS est un second ID, différent.'
      );
    }
    return {
      clientId: iosClientId,
      redirectUri: googleNativeRedirectUri(iosClientId),
      platformLabel: 'iOS',
    };
  }

  if (Platform.OS === 'android') {
    if (isRunningInExpoGo()) {
      throw new Error(
        'Connexion Google indisponible dans Expo Go sur Android.\n\n' +
          'Lance : npx expo run:android'
      );
    }
    if (!androidClientId) {
      throw new Error(
        'Connexion Google sur Android : ajoute EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID dans .env (Firebase > Authentication > Google > SDK Android). ' +
          'Puis relance : npx expo start -c.'
      );
    }
    return {
      clientId: androidClientId,
      redirectUri: googleNativeRedirectUri(androidClientId),
      platformLabel: 'Android',
    };
  }

  if (!webClientId) {
    throw new Error(
      'Ajoute EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID dans .env (client OAuth type Application Web du même projet Firebase), puis relance : npx expo start -c.'
    );
  }

  return {
    clientId: webClientId,
    redirectUri: makeRedirectUri({ scheme: 'goalya', path: 'oauthredirect', preferLocalhost: true }),
    platformLabel: 'Web',
  };
}

/**
 * Écrit le profil dans Firestore. Appeler avec `void mergeUserProfile(...)` après une connexion
 * réussie pour ne pas bloquer l’UI : Auth peut être OK pendant que setDoc reste en attente
 * (règles Firestore, réseau, projet).
 */
async function mergeUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
  try {
    await setDoc(doc(getFirestoreDb(), 'users', uid), data, { merge: true });
  } catch (e) {
    console.warn('[GOALYA] Firestore users/', uid, e);
  }
}

export async function resolveEmailForSignIn(identifier: string): Promise<string> {
  const trimmed = identifier.trim();
  if (!trimmed) throw new Error('Saisis ton email ou ton pseudo.');
  if (trimmed.includes('@')) return trimmed.toLowerCase();

  const snap = await getDocs(
    query(collection(getFirestoreDb(), 'users'), where('name', '==', trimmed), limit(1))
  );
  if (snap.empty) throw new Error('Aucun compte trouvé avec ce pseudo.');
  const email = snap.docs[0].data().email;
  if (typeof email !== 'string' || !email.trim()) {
    throw new Error('Ce compte n’a pas d’email associé. Utilise la connexion Google ou Apple.');
  }
  return email.trim().toLowerCase();
}

export async function sendPasswordReset(identifier: string): Promise<void> {
  try {
    const email = await resolveEmailForSignIn(identifier);
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  } catch (e) {
    throw new Error(friendlyAuthError(e));
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  countryCode?: string
): Promise<{ userId: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    const uid = cred.user.uid;
    void mergeUserProfile(uid, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      createdAt: serverTimestamp(),
      provider: 'email',
      ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}),
    });
    return { userId: uid };
  } catch (e) {
    throw new Error(friendlyAuthError(e));
  }
}

export async function signInWithEmailOrUsername(
  identifier: string,
  password: string,
  countryCode?: string
): Promise<{ userId: string }> {
  const email = await resolveEmailForSignIn(identifier);
  return signInWithEmail(email, password, countryCode);
}

export async function signInWithEmail(
  email: string,
  password: string,
  countryCode?: string
): Promise<{ userId: string }> {
  try {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    const uid = cred.user.uid;
    void mergeUserProfile(uid, {
      updatedAt: serverTimestamp(),
      provider: 'email',
      ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}),
    });
    return { userId: uid };
  } catch (e) {
    const code =
      typeof e === 'object' && e && 'code' in e ? String((e as { code?: string }).code) : '';
    if (
      code.includes('auth/invalid-credential') ||
      code.includes('auth/wrong-password') ||
      code.includes('auth/user-not-found')
    ) {
      throw new Error('Email ou mot de passe incorrect.');
    }
    throw new Error(friendlyAuthError(e));
  }
}

export async function signInWithGoogle(countryCode?: string): Promise<{ userId: string }> {
  const { clientId, redirectUri, platformLabel } = resolveGoogleOAuthConfig();

  if (__DEV__) {
    console.log(`[GOALYA] Google OAuth (${platformLabel}) redirectUri =`, redirectUri);
  }

  const request = new AuthRequest({
    clientId,
    redirectUri,
    scopes: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    responseType: ResponseType.Code,
    usePKCE: true,
    extraParams: {
      access_type: 'offline',
      prompt: 'select_account',
    },
  });

  const result = await request.promptAsync(googleDiscovery, {
    showInRecents: true,
  });

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Connexion annulée.');
  }
  if (result.type === 'locked') {
    throw new Error('Une autre fenêtre de connexion est déjà ouverte.');
  }
  if (result.type === 'error') {
    const hint =
      result.error?.message ??
      String(result.params?.error_description ?? result.params?.error ?? 'Erreur OAuth');
    throw new Error(
      `${hint}\n\nVérifie Firebase > Authentication > Google (activé) et les client ID dans .env (${platformLabel}).`
    );
  }
  if (result.type !== 'success' || !result.params?.code) {
    throw new Error(
      `Connexion Google incomplète (${platformLabel}). Si tu es sur Expo Go, utilise un development build (EAS) avec les client ID iOS/Android. Redirect : ${redirectUri}`
    );
  }

  const token = await exchangeCodeAsync(
    {
      clientId,
      code: String(result.params.code),
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier ?? '',
      },
    },
    googleDiscovery
  );

  const idToken = token.idToken;
  if (!idToken) {
    throw new Error(
      `Google n’a pas renvoyé d’id_token. Vérifie que le client OAuth ${platformLabel} correspond au projet Firebase. Redirect : ${redirectUri}`
    );
  }

  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCred = await signInWithCredential(getFirebaseAuth(), credential);
    const uid = userCred.user.uid;

    void mergeUserProfile(uid, {
      name: userCred.user.displayName ?? '',
      email: userCred.user.email ?? '',
      updatedAt: serverTimestamp(),
      provider: 'google',
      ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}),
    });

    return { userId: uid };
  } catch (e) {
    throw new Error(friendlyAuthError(e));
  }
}

export async function signInWithApple(countryCode?: string): Promise<{ userId: string }> {
  try {
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) throw new Error("Apple n'est pas disponible sur cet appareil.");

    const appleCred = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!appleCred.identityToken) throw new Error('Token Apple manquant.');

    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: appleCred.identityToken,
    });

    const userCred = await signInWithCredential(getFirebaseAuth(), credential);
    const uid = userCred.user.uid;

    const fullName =
      [appleCred.fullName?.givenName, appleCred.fullName?.familyName].filter(Boolean).join(' ').trim() ||
      userCred.user.displayName ||
      '';

    void mergeUserProfile(uid, {
      name: fullName,
      email: userCred.user.email ?? appleCred.email ?? '',
      updatedAt: serverTimestamp(),
      provider: 'apple',
      ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}),
    });

    return { userId: uid };
  } catch (e) {
    throw new Error(friendlyAuthError(e));
  }
}
