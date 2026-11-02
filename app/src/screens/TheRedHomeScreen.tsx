import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UNITED_GOLD } from '../constants/colors';
import { TheRedLogo } from '../components/TheRedLogo';
import { HomeLoopVideo } from './home/components/HomeLoopVideo';

const HOME_BG_VIDEO = require('../../assets/the-red/home-bg.mp4');

export default function TheRedHomeScreen({ navigation }: { navigation?: any }) {
  const { width, height } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.64, 280);

  return (
    <View style={styles.root}>
      <HomeLoopVideo source={HOME_BG_VIDEO} shouldPlay isLooping isMuted />

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(5,2,3,0.55)', 'rgba(5,2,3,0.18)', 'rgba(5,2,3,0.72)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <Text style={styles.topBrand}>THE RED</Text>
          <Pressable
            hitSlop={12}
            onPress={() => navigation?.navigate?.('Profil')}
            style={({ pressed }) => [styles.profileBtn, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="account-circle" size={28} color={UNITED_GOLD} />
          </Pressable>
        </View>

        <View style={[styles.center, { minHeight: height * 0.55 }]}>
          <TheRedLogo width={logoWidth} />
        </View>

        <View style={styles.bottom}>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              onPress={() => navigation?.navigate?.('Matches')}
            >
              <MaterialCommunityIcons name="soccer" size={16} color="#fff" />
              <Text style={styles.chipText}>Match Center</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              onPress={() => navigation?.navigate?.('News')}
            >
              <MaterialCommunityIcons name="newspaper-variant-outline" size={16} color="#fff" />
              <Text style={styles.chipText}>Actus</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              onPress={() => navigation?.navigate?.('Communaute')}
            >
              <MaterialCommunityIcons name="account-group-outline" size={16} color="#fff" />
              <Text style={styles.chipText}>Communauté</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050203',
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  topBrand: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
  },
  profileBtn: {
    padding: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bottom: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(218,41,28,0.88)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.85,
  },
});
