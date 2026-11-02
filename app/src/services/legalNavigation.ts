import { Linking } from 'react-native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import {
  getLegalDocumentTitle,
  getLegalDocumentUrl,
  type LegalDocumentKey,
} from '../constants/legalUrls';

type LegalNav = NavigationProp<ParamListBase> & {
  navigate: (name: string, params?: { url: string; title: string }) => void;
};

/** Ouvre le document dans l’app (WebView) — requis stores Apple / Google. */
export function openLegalDocument(navigation: LegalNav, key: LegalDocumentKey): void {
  navigation.navigate('LegalDocument', {
    url: getLegalDocumentUrl(key),
    title: getLegalDocumentTitle(key),
    legalKey: key,
  });
}

/** Fallback navigateur système si WebView indisponible. */
export async function openLegalDocumentExternal(key: LegalDocumentKey): Promise<boolean> {
  const url = getLegalDocumentUrl(key);
  try {
    const ok = await Linking.canOpenURL(url);
    if (!ok) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
