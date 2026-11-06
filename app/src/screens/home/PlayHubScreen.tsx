import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { TabsParamList } from '../../navigation/AppTabs';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { COLORS } from '../../constants/colors';
import { GAME_MODES } from '../../constants/gameModes';

type Nav = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'PlayHub'>,
  BottomTabNavigationProp<TabsParamList>
>;

const ROUTE_BY_KEY = {
  pronos: 'Pronos' as const,
  pickxi: 'PickYourXi' as const,
  quiz: 'UnitedQuiz' as const,
  rating: 'UnitedRating' as const,
};

export default function PlayHubScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.root}>
      <Text style={styles.title}>VENEZ JOUER</Text>
      <Text style={styles.sub}>
        Pronos United, Pick XI (Fantasy), quiz et notes — points Hommes + Femmes pour les
        classements et bons boutique.
      </Text>
      <ScrollView contentContainerStyle={styles.list}>
        {GAME_MODES.map((mode) => (
          <Pressable
            key={mode.key}
            style={styles.row}
            onPress={() => {
              if (mode.key === 'pickxi') {
                navigation.getParent()?.navigate('Fantasy');
                return;
              }
              navigation.navigate(ROUTE_BY_KEY[mode.key]);
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowT}>{mode.title}</Text>
              <Text style={styles.rowS}>{mode.description}</Text>
            </View>
            <Text style={styles.rowGo}>→</Text>
          </Pressable>
        ))}
        <Pressable style={styles.row} onPress={() => navigation.navigate('UnitedStandings')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowT}>Classement fans</Text>
            <Text style={styles.rowS}>Mensuel & saison · H+F combinés</Text>
          </View>
          <Text style={styles.rowGo}>→</Text>
        </Pressable>
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
    gap: 12,
  },
  rowT: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  rowS: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
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
