import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { COUNTRIES, type Country } from '../../constants/countries';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useUserStore } from '../../store/useUserStore';

const POPULAR_CODES = new Set(['FR', 'MA', 'BR', 'AR', 'US']);

type ConfirmState = {
  country: Country;
} | null;

function CountryRow({
  item,
  isPopular,
  onPress,
  popularLabel,
  groupLabel,
}: {
  item: Country;
  isPopular: boolean;
  onPress: () => void;
  popularLabel: string;
  groupLabel: string;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.flagWrap}>
        <Text style={styles.flag}>{item.flag}</Text>
      </View>

      <View style={styles.rowMain}>
        <View style={styles.rowTopLine}>
          <Text style={styles.countryName} numberOfLines={1}>
            {item.name}
          </Text>
          {isPopular ? (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>{popularLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.groupText}>{groupLabel} {item.group}</Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function CountrySelectScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const setCountry = useUserStore((s) => s.setCountry);
  const [query, setQuery] = useState('');
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const popularCount = useMemo(() => {
    let count = 0;
    for (const c of COUNTRIES) {
      if (POPULAR_CODES.has(c.code)) count += 1;
    }
    return count;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("onboarding.country.title")}</Text>
        <Text style={styles.subtitle}>{t("onboarding.country.subtitle")}</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("onboarding.country.search")}
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
          selectionColor={Colors.green}
          style={styles.search}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <CountryRow
            item={item}
            isPopular={
              POPULAR_CODES.has(item.code) && (query.trim().length > 0 ? true : index < popularCount)
            }
            onPress={() => setConfirm({ country: item })}
            popularLabel={t("onboarding.country.popular")}
            groupLabel={t("onboarding.country.group")}
          />
        )}
      />

      <Modal transparent animationType="fade" visible={confirm !== null} onRequestClose={() => setConfirm(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('onboarding.country.confirmTitle', { name: confirm?.country.name })}</Text>
            <Text style={styles.modalMessage}>
              {t("onboarding.country.confirmMsg")}
            </Text>

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setConfirm(null)} style={({ pressed }) => [styles.modalBtnGhost, pressed && styles.btnPressed]}>
                <Text style={styles.modalBtnGhostText}>{t("common.back")}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const selected = confirm?.country;
                  if (!selected) return;
                  setCountry(selected.code);
                  setConfirm(null);
                  navigation.navigate('FlagAnim', { country: selected });
                }}
                style={({ pressed }) => [styles.modalBtnPrimary, pressed && styles.btnPressed]}
              >
                <Text style={styles.modalBtnPrimaryText}>{t("common.confirm")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 6,
    color: Colors.textMuted,
    fontSize: 13,
  },

  searchWrap: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  search: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: Colors.text,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  separator: {
    height: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  flagWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(41, 121, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.18)',
  },
  flag: {
    fontSize: 22,
  },
  rowMain: {
    flex: 1,
    marginLeft: 12,
  },
  rowTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  countryName: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  groupText: {
    marginTop: 6,
    color: Colors.textMuted,
    fontSize: 12,
  },
  chevron: {
    marginLeft: 10,
    color: Colors.green,
    fontSize: 26,
    lineHeight: 26,
    opacity: 0.9,
  },

  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(41, 121, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.28)',
  },
  popularBadgeText: {
    color: Colors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalMessage: {
    marginTop: 10,
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  modalButtons: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnGhost: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.26)',
  },
  modalBtnGhostText: {
    color: Colors.green,
    fontWeight: '800',
  },
  modalBtnPrimary: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.green,
  },
  modalBtnPrimaryText: {
    color: Colors.bg,
    fontWeight: '900',
  },
  btnPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});

