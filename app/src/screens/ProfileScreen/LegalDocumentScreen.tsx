import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { openLegalDocumentExternal } from '../../services/legalNavigation';
import type { LegalDocumentKey } from '../../constants/legalUrls';
import { PROFILE_V2 } from '../../constants/profileV2Theme';
import { PROFILE_FONTS as F } from './profileTypography';

type LegalDocumentParams = {
  url: string;
  title: string;
  legalKey?: LegalDocumentKey;
};

type Route = RouteProp<{ LegalDocument: LegalDocumentParams }, 'LegalDocument'>;
type Nav = StackNavigationProp<{ LegalDocument: LegalDocumentParams }, 'LegalDocument'>;

export default function LegalDocumentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { url, title, legalKey } = route.params;

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const openBrowser = useCallback(() => {
    if (legalKey) void openLegalDocumentExternal(legalKey);
    else void import('react-native').then(({ Linking }) => Linking.openURL(url));
  }, [legalKey, url]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Retour">
          <MaterialCommunityIcons name="chevron-left" size={22} color={PROFILE_V2.text2} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
        <Pressable style={styles.ext} onPress={openBrowser} accessibilityLabel="Ouvrir dans le navigateur">
          <MaterialCommunityIcons name="open-in-new" size={20} color={PROFILE_V2.blue2} />
        </Pressable>
      </View>

      {failed ? (
        <View style={styles.fallback}>
          <MaterialCommunityIcons name="web-off" size={48} color={PROFILE_V2.text3} />
          <Text style={styles.fallbackTitle}>Page indisponible hors ligne</Text>
          <Text style={styles.fallbackSub}>Ouvre le document dans ton navigateur.</Text>
          <Pressable style={styles.fallbackBtn} onPress={openBrowser}>
            <Text style={styles.fallbackBtnTxt}>Ouvrir dans le navigateur</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.webWrap}>
          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" color={PROFILE_V2.blue} />
          ) : null}
          <WebView
            source={{ uri: url }}
            style={styles.web}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setFailed(true);
            }}
            onHttpError={() => {
              setLoading(false);
              setFailed(true);
            }}
            startInLoadingState
            allowsBackForwardNavigationGestures
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PROFILE_V2.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_V2.border1,
    gap: 8,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: PROFILE_V2.border2,
  },
  title: {
    flex: 1,
    fontFamily: F.bebas,
    fontSize: 18,
    letterSpacing: 2,
    color: PROFILE_V2.text1,
    textAlign: 'center',
  },
  ext: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webWrap: { flex: 1 },
  web: { flex: 1, backgroundColor: '#fff' },
  loader: { position: 'absolute', top: '40%', alignSelf: 'center', zIndex: 2 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  fallbackTitle: { fontFamily: F.bold, fontSize: 17, color: PROFILE_V2.text1, textAlign: 'center' },
  fallbackSub: {
    fontFamily: F.medium,
    fontSize: 14,
    color: PROFILE_V2.text2,
    textAlign: 'center',
    lineHeight: 20,
  },
  fallbackBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(41,121,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(41,121,255,0.35)',
  },
  fallbackBtnTxt: { fontFamily: F.bold, fontSize: 14, color: PROFILE_V2.blue2 },
});
