import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TABLEAU } from '../../../constants/tableauTheme';
import type { TableauTabKey } from '../../../utils/tableauBracket';

const TABS: { key: TableauTabKey; label: string }[] = [
  { key: 'apercu', label: 'APERÇU' },
  { key: 'groupes', label: 'PHASE DE GROUPES' },
  { key: 'elimination', label: 'MON PARCOURS' },
  { key: 'pronos', label: 'MES PRONOS' },
  { key: 'classement', label: 'CLASSEMENT' },
];

type Props = {
  active: TableauTabKey;
  onSelect: (tab: TableauTabKey) => void;
};

export const TableauTopTabs = memo(function TableauTopTabs({ active, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {TABS.map((tab) => {
          const on = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, on && styles.tabOn]}
              onPress={() => onSelect(tab.key)}
            >
              <Text style={[styles.label, on && styles.labelOn]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabOn: {
    backgroundColor: TABLEAU.tabActiveBg,
    borderColor: TABLEAU.border,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.4,
    color: TABLEAU.textMuted,
  },
  labelOn: { color: TABLEAU.text, fontFamily: 'Inter_700Bold' },
});
