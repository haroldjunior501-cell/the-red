import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';
import { formatPower } from '../../../services/gamesService';

export type NationBarProps = {
  flag: string;
  countryName: string;
  power: number;
  rank: number;
};

export const NationBar = memo(function NationBar({ flag, countryName, power, rank }: NationBarProps) {
  const { t } = useTranslation();
  return (
    <LinearGradient
      colors={[C.nationGradStart, C.nationGradEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <View style={styles.inner}>
        <View style={styles.left}>
          <Text style={styles.flag}>{flag}</Text>
          <View>
            <Text style={styles.name}>{countryName}</Text>
            <Text style={styles.sub}>{t('pronos.myNation')}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.power}>{formatPower(power)}</Text>
          <Text style={styles.rank}>{t('pronos.worldRank', { rank })}</Text>
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginTop: 12, marginBottom: 10, borderRadius: 14, borderWidth: 1, borderColor: C.nationBorder, overflow: 'hidden' },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  flag: { fontSize: 24 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 15, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  sub: { fontFamily: 'Inter_500Medium', fontSize: 11, color: C.muted2, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  power: { fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: C.blue2, fontVariant: ['tabular-nums'] },
  rank: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: C.gold, marginTop: 3 },
});
