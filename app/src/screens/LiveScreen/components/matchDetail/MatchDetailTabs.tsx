import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DS } from '../../LiveScreen.styles';

export type MatchDetailTabKey = 'match' | 'stats' | 'h2h' | 'standings' | 'lineups';

const TABS: { key: MatchDetailTabKey; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'match', label: 'Match', icon: 'soccer-field' },
  { key: 'stats', label: 'Stats', icon: 'chart-bar' },
  { key: 'lineups', label: 'Compos', icon: 'tshirt-crew' },
  { key: 'h2h', label: 'H2H', icon: 'account-group' },
  { key: 'standings', label: 'PL', icon: 'format-list-numbered' },
];

type Props = {
  active: MatchDetailTabKey;
  onChange: (tab: MatchDetailTabKey) => void;
};

export const MatchDetailTabs = memo(function MatchDetailTabs({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TABS.map((tab) => {
          const on = tab.key === active;
          return (
            <Pressable key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)}>
              <MaterialCommunityIcons name={tab.icon} size={20} color={on ? '#DA291C' : DS.muted} />
              <Text style={[styles.label, on && styles.labelOn]}>{tab.label}</Text>
              {on ? <View style={styles.underline} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: DS.border,
    backgroundColor: '#0c0507',
  },
  row: { paddingHorizontal: 8, gap: 4 },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 72,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: DS.muted,
    marginTop: 4,
  },
  labelOn: { color: '#DA291C' },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#DA291C',
    borderRadius: 1,
  },
});
