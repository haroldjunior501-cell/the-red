import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';

type Props = {
  text: string;
};

export const PronosJourneeHint = memo(function PronosJourneeHint({ text }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.txt}>{text}</Text>
      <Text style={styles.sub}>
        Le calendrier et les affiches sont déjà connus : pronostique tous les matchs à venir via les onglets
        (ouverture, puis chaque jour). Chaque prono se ferme uniquement au coup d&apos;envoi.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(51,133,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(51,133,255,0.2)',
  },
  txt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: C.blue2,
    marginBottom: 6,
  },
  sub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: C.muted2,
    lineHeight: 15,
  },
});
