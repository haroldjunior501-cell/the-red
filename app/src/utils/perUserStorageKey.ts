/** Clé AsyncStorage isolée par compte (évite le partage entre utilisateurs sur le même appareil). */
export function perUserStorageKey(namespace: string, userId: string): string {
  const uid = userId.trim() || '_guest';
  return `@goalya/${namespace}:${uid}`;
}
