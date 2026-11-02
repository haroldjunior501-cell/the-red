import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { UNITED_RED } from '../../constants/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { HomeLoopVideo } from '../home/components/HomeLoopVideo';
import { TheRedLogo } from '../../components/TheRedLogo';

const HOME_BG_VIDEO = require('../../../assets/the-red/home-bg.mp4');

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.7, 300);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <HomeLoopVideo source={HOME_BG_VIDEO} shouldPlay isLooping isMuted />

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(5,2,3,0.5)', 'rgba(5,2,3,0.15)', 'rgba(5,2,3,0.78)']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.fill}>
        <View style={styles.center}>
          <TheRedLogo width={logoWidth} />
        </View>

        <View style={styles.bottom}>
          <Pressable
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] })}
          >
            <Text style={styles.primaryText}>ENTRER</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
            onPress={() => navigation.navigate('AuthLogin')}
          >
            <Text style={styles.secondaryText}>Se connecter</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('AuthSignUp')} hitSlop={8}>
            <Text style={styles.link}>Créer un compte supporter</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050203' },
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 28, gap: 12 },
  primary: {
    backgroundColor: UNITED_RED,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '900', letterSpacing: 1.2 },
  secondary: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  secondaryText: { color: '#fff', fontWeight: '800' },
  link: { color: '#cbd5e1', textAlign: 'center', marginTop: 4, fontWeight: '600' },
  pressed: { opacity: 0.86 },
});
