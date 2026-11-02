import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { TabsParamList } from '../../navigation/AppTabs';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { COLORS } from '../../constants/colors';

type Nav = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'PlayHub'>,
  BottomTabNavigationProp<TabsParamList>
>;

const LINKS = [
  { label: 'Tableau', route: 'Tableau' as const },
  { label: 'Pronos', route: 'Pronos' as const },
  { label: 'Arena', route: 'Arena' as const },
  { label: 'Fantasy', tab: 'Fantasy' as const },
];

export default function PlayHubScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.root}>
      <Text style={styles.title}>VENEZ JOUER</Text>
      <Text style={styles.sub}>Choisis ton mode — chaque victoire renforce ta nation.</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {LINKS.map((item) => (
          <Pressable
            key={item.label}
            style={styles.row}
            onPress={() => {
              if ('tab' in item) {
                navigation.getParent()?.navigate('Fantasy');
              } else {
                navigation.navigate(item.route);
              }
            }}
          >
            <Text style={styles.rowT}>{item.label}</Text>
            <Text style={styles.rowGo}>→</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnT}>Retour</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 24 },
  title: { color: COLORS.primary, fontWeight: '900', fontSize: 26, letterSpacing: 2 },
  sub: { color: COLORS.textMuted, marginTop: 10, fontSize: 15, lineHeight: 22 },
  list: { paddingVertical: 20, gap: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  rowT: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  rowGo: { color: COLORS.primary, fontWeight: '900', fontSize: 18 },
  btn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  btnT: { color: COLORS.primary, fontWeight: '900' },
});
