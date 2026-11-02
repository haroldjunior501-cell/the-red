import './src/i18n'; // initialise i18next + détection de la langue du téléphone
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoalyaStripeProvider } from './src/providers/GoalyaStripeProvider';
import { MissionLoginBootstrap } from './src/components/MissionLoginBootstrap';
import RootNavigator from './src/navigation/RootNavigator';
import { onAuthStateChanged } from 'firebase/auth';
import { initFootballDataSources } from './src/services/footballDataProvider';
import { getFirebaseAuth } from './src/services/firebase';
import { soundService } from './src/services/soundService';
import { Colors } from './src/constants/colors';
import { useUserStore } from './src/store/useUserStore';
import { useFonts as useBebasFonts } from '@expo-google-fonts/bebas-neue/useFonts';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue/400Regular';
import { useFonts as useInterFonts } from '@expo-google-fonts/inter/useFonts';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { useFonts as useJetBrainsFonts } from '@expo-google-fonts/jetbrains-mono/useFonts';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';

WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [hydrated, setHydrated] = useState(() => useUserStore.persist.hasHydrated());
  const [bebasLoaded] = useBebasFonts({ BebasNeue_400Regular });
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });
  const [jetbrainsLoaded] = useJetBrainsFonts({ JetBrainsMono_700Bold });
  const fontsLoaded = bebasLoaded && interLoaded && jetbrainsLoaded;

  useEffect(() => {
    const done = () => setHydrated(true);
    if (useUserStore.persist.hasHydrated()) {
      done();
      return;
    }
    const unsub = useUserStore.persist.onFinishHydration(done);
    queueMicrotask(() => {
      if (useUserStore.persist.hasHydrated()) done();
    });
    const t = setTimeout(() => {
      if (!useUserStore.persist.hasHydrated()) {
        console.warn('[GOALYA] Persistance lente ou bloquée — affichage de l’app quand même.');
      }
      done();
    }, 5000);
    return () => {
      clearTimeout(t);
      unsub();
    };
  }, []);

  useEffect(() => {
    void soundService.init();
    void initFootballDataSources();
  }, []);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      return onAuthStateChanged(auth, (user) => {
        if (!user?.uid) return;
        const store = useUserStore.getState();
        if (store.userId !== user.uid) store.setUserId(user.uid);
      });
    } catch {
      return undefined;
    }
  }, []);

  if (!hydrated || !fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GoalyaStripeProvider>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <MissionLoginBootstrap />
        <RootNavigator />
      </GoalyaStripeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
});
