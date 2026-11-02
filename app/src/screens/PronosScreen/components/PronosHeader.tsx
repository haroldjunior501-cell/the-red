import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { PRONO_COLORS as C } from '../../../constants/pronosColors';

export type PronosHeaderProps = {
  onBack: () => void;
};

export const PronosHeader = memo(function PronosHeader({ onBack }: PronosHeaderProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={[C.headerTop, C.bg]} style={styles.grad} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
        <View style={styles.row}>
          <Pressable style={styles.back} onPress={onBack} accessibilityRole="button">
            <MaterialCommunityIcons name="chevron-left" size={28} color={C.text2} />
          </Pressable>
          <Text style={styles.title}>{t('pronos.title')}</Text>
        </View>
      </LinearGradient>
      <View style={styles.line} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  grad: { paddingBottom: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  back: { padding: 4, marginRight: 4 },
  title: {
    flex: 1,
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 3,
    color: C.text,
  },
  line: {
    height: 1,
    marginHorizontal: 20,
    backgroundColor: 'rgba(51,133,255,0.45)',
    opacity: 0.9,
  },
});
