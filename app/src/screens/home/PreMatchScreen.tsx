import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../navigation/HomeStack';

export default function PreMatchScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'PreMatch'>>();
  const fixtureId = route.params?.fixtureId;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>PRÉPARER LE MATCH</Text>
      {fixtureId != null ? <Text style={styles.meta}>Fixture #{fixtureId}</Text> : <Text style={styles.meta}>Aucun match sélectionné</Text>}
      <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnT}>Retour</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b111c', padding: 24, justifyContent: 'center' },
  title: { color: '#fff', fontWeight: '900', fontSize: 22, letterSpacing: 1 },
  meta: { color: '#8896ab', marginTop: 12, fontSize: 15 },
  btn: { marginTop: 28, alignSelf: 'flex-start', backgroundColor: '#2979ff', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  btnT: { color: '#0b111c', fontWeight: '900' },
});
