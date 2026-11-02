import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_EMAIL = 'goalya-auth-remember-email';
const KEY_ENABLED = 'goalya-auth-remember-enabled';
const KEY_DEVICE_KNOWN = 'goalya-device-known';

export async function loadRememberedEmail(): Promise<{ enabled: boolean; email: string }> {
  try {
    const [enabled, email] = await Promise.all([
      AsyncStorage.getItem(KEY_ENABLED),
      AsyncStorage.getItem(KEY_EMAIL),
    ]);
    return {
      enabled: enabled === '1',
      email: email ?? '',
    };
  } catch {
    return { enabled: false, email: '' };
  }
}

export async function saveRememberedEmail(enabled: boolean, email: string): Promise<void> {
  try {
    if (enabled && email.trim()) {
      await AsyncStorage.multiSet([
        [KEY_ENABLED, '1'],
        [KEY_EMAIL, email.trim().toLowerCase()],
      ]);
    } else {
      await AsyncStorage.multiRemove([KEY_ENABLED, KEY_EMAIL]);
    }
  } catch {
    /* ignore */
  }
}

/** Appareil déjà utilisé avec un compte → ouvrir la connexion en premier. */
export async function shouldOpenLoginFirst(): Promise<boolean> {
  try {
    const [known, remembered] = await Promise.all([
      AsyncStorage.getItem(KEY_DEVICE_KNOWN),
      loadRememberedEmail(),
    ]);
    return known === '1' || remembered.enabled;
  } catch {
    return false;
  }
}

export async function markDeviceKnown(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_DEVICE_KNOWN, '1');
  } catch {
    /* ignore */
  }
}
