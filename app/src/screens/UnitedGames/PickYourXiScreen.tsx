import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ScreenAmbience } from '../../components/ui/ScreenAmbience';
import { PRONO_COLORS as C } from '../../constants/pronosColors';
import type { TabsParamList } from '../../navigation/AppTabs';
import type { HomeStackParamList } from '../../navigation/HomeStack';

/**
 * Pick Your XI = onglet Fantasy (effectif United, sans budget).
 * Cette route redirige vers le terrain Fantasy.
 */
type Nav = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'PickYourXi'>,
  BottomTabNavigationProp<TabsParamList>
>;

export default function PickYourXiScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Fantasy');
    }
    const t = setTimeout(() => {
      if (navigation.canGoBack()) navigation.goBack();
    }, 80);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <ScreenAmbience>
      <View style={styles.wrap}>
        <ActivityIndicator color={C.blue} />
        <Text style={styles.txt}>Ouverture de Pick Your XI…</Text>
      </View>
    </ScreenAmbience>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  txt: { color: C.muted2, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
