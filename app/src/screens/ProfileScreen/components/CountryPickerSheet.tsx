import React, { memo, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COUNTRIES, type Country } from '../../../constants/countries';
import { PROFILE_V2 } from '../../../constants/profileV2Theme';
import { PROFILE_FONTS as F } from '../profileTypography';

type Props = {
  visible: boolean;
  selectedCode: string;
  onSelect: (country: Country) => void;
  onClose: () => void;
};

export const CountryPickerSheet = memo(function CountryPickerSheet({
  visible,
  selectedCode,
  onSelect,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>CHOISIR TA NATION</Text>
          <View style={styles.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={20} color={PROFILE_V2.text3} />
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un pays…"
              placeholderTextColor={PROFILE_V2.text3}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {filtered.map((c) => {
              const selected = c.code === selectedCode;
              return (
                <Pressable
                  key={c.code}
                  style={({ pressed }) => [
                    styles.row,
                    selected && styles.rowSelected,
                    pressed && styles.rowPressed,
                  ]}
                  onPress={() => {
                    onSelect(c);
                    onClose();
                    setQuery('');
                  }}
                >
                  <Text style={styles.flag}>{c.flag}</Text>
                  <Text style={styles.name}>{c.name}</Text>
                  {selected ? (
                    <MaterialCommunityIcons name="check-circle" size={22} color={PROFILE_V2.blue} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: PROFILE_V2.card2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: PROFILE_V2.border2,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: F.bebas,
    fontSize: 20,
    letterSpacing: 3,
    color: PROFILE_V2.text1,
    textAlign: 'center',
    marginBottom: 14,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PROFILE_V2.border1,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  search: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 15,
    color: PROFILE_V2.text1,
    paddingVertical: 12,
  },
  list: { maxHeight: 420 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rowSelected: { backgroundColor: 'rgba(41,121,255,0.08)' },
  rowPressed: { opacity: 0.9 },
  flag: { fontSize: 22 },
  name: { flex: 1, fontFamily: F.semi, fontSize: 15, color: PROFILE_V2.text1 },
});
