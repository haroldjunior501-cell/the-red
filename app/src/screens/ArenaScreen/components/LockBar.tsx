import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ARENA_THEME as T } from '../../../constants/arenaTheme';
import type { SimulatorAccess } from '../../../types/arena.types';

type Props = {
  access: SimulatorAccess;
  onManageTeam: () => void;
};

export const LockBar = memo(function LockBar({ access, onManageTeam }: Props) {
  const { t } = useTranslation();
  if (!access.locked) return null;

  const message = access.reason === 'CUP_NOT_STARTED'
    ? t('arena.lockCup')
    : t('arena.lockTeam');
  const actionLabel = access.reason === 'EQUIPE_INCOMPLETE'
    ? t('arena.manageTeam')
    : null;

  return (
    <View style={styles.bar}>
      <MaterialCommunityIcons name="lock" size={22} color={T.gold} />
      <Text style={styles.msg}>{message}</Text>
      {actionLabel ? (
        <Pressable style={styles.btn} onPress={onManageTeam}>
          <Text style={styles.btnTxt}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 12,
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: T.purple2,
    borderWidth: 1,
    borderColor: 'rgba(139, 43, 226, 0.35)',
    gap: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  msg: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13, color: T.text, minWidth: 200 },
  btn: {
    backgroundColor: T.purple,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  btnTxt: { fontFamily: 'Inter_800ExtraBold', fontSize: 11, color: T.text, letterSpacing: 0.6 },
});
