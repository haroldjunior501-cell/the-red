import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getFirebaseAuth, getFirestoreDb, getFirebaseStorage } from './firebase';
import { clearProfilePhotoCache } from './userProfileService';

export type UserAccountDoc = {
  email?: string;
  name?: string;
  photoURL?: string;
  countryCode?: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

export async function fetchUserAccountDoc(userId: string): Promise<UserAccountDoc | null> {
  if (!userId) return null;
  try {
    const snap = await getDoc(doc(getFirestoreDb(), 'users', userId));
    if (!snap.exists()) return null;
    return snap.data() as UserAccountDoc;
  } catch {
    return null;
  }
}

export async function updateUserDisplayName(userId: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!userId || !trimmed) return;
  await setDoc(
    doc(getFirestoreDb(), 'users', userId),
    { name: trimmed, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function updateUserCountryCode(userId: string, countryCode: string): Promise<void> {
  const code = countryCode.trim().toUpperCase();
  if (!userId || !code) return;
  await setDoc(
    doc(getFirestoreDb(), 'users', userId),
    { countryCode: code, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function pickAndUploadProfilePhoto(userId: string): Promise<string | null> {
  if (!userId) return null;

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;

  const blob = await (await fetch(result.assets[0].uri)).blob();
  const st = getFirebaseStorage();
  const photoRef = ref(st, `users/${userId}/profilePhoto`);
  await uploadBytes(photoRef, blob);
  const url = await getDownloadURL(photoRef);

  await setDoc(
    doc(getFirestoreDb(), 'users', userId),
    { photoURL: url, updatedAt: serverTimestamp() },
    { merge: true }
  );

  clearProfilePhotoCache(userId);
  return url;
}

async function removeExpoPushToken(userId: string): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
    const tokenApi = Notifications as unknown as {
      getDevicePushTokenAsync?: () => Promise<{ data: unknown }>;
    };
    const tokenResult = await tokenApi.getDevicePushTokenAsync?.();
    const token = typeof tokenResult?.data === 'string' ? tokenResult.data : null;
    if (!token) return;
    await deleteDoc(doc(getFirestoreDb(), `users/${userId}/fcmTokens/${token}`));
  } catch {
    /* token absent ou règles Firestore */
  }
}

/** Déconnexion sécurisée : FCM token → signOut → retour void pour clear store côté UI */
export async function performSecureLogout(userId: string): Promise<void> {
  if (userId) {
    await removeExpoPushToken(userId);
  }
  await signOut(getFirebaseAuth());
}
