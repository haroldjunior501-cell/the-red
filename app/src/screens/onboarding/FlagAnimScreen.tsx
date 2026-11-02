import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { Colors } from '../../constants/colors';
import { shouldOpenLoginFirst } from '../../services/authRemember';

export default function FlagAnimScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FlagAnim'>>();
  const { country } = route.params;
  const scale = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    timeoutRef.current = setTimeout(() => {
      void shouldOpenLoginFirst().then((loginFirst) => {
        navigation.replace(loginFirst ? 'AuthLogin' : 'AuthSignUp');
      });
    }, 3000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [navigation, scale]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Animated.Text style={[styles.flag, { transform: [{ scale }] }]}>{country.flag}</Animated.Text>
        <Text style={styles.countryName}>{country.name}</Text>
        <Text style={styles.tagline}>Ta nation. Ton aventure.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  flag: {
    fontSize: 100,
  },
  countryName: {
    marginTop: 24,
    fontSize: 42,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: 3,
    textAlign: 'center',
  },
});
