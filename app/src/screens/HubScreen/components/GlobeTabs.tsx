import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { flagEmoji } from '../../../constants/mapHub';

export type HubGlobeTab = 'monde' | 'nation';

export type GlobeTabsProps = {
  tab: HubGlobeTab;
  userCountry: string;
  onChange: (tab: HubGlobeTab) => void;
};

export const GlobeTabs = memo(function GlobeTabs({ tab, userCountry, onChange }: GlobeTabsProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.pill}>
        <TouchableOpacity style={[styles.tab, tab === 'monde' && styles.tabActive]} onPress={() => onChange('monde')}>
          <Text style={[styles.label, tab === 'monde' && styles.labelActive]}>MONDE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'nation' && styles.tabActive]} onPress={() => onChange('nation')}>
          <Text style={[styles.label, tab === 'nation' && styles.labelActive]}>{flagEmoji(userCountry)} MA NATION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  // elevation: 10 force Android à router les touches vers cette View
  // plutôt que vers le WebView natif derrière (problème connu Android WebView)
  wrap: { position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center', zIndex: 15, elevation: 10 },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13,18,32,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 4,
    gap: 4,
  },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  tabActive: { backgroundColor: '#2979ff' },
  label: { fontFamily: 'Inter_800ExtraBold', fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 },
  labelActive: { color: '#000000' },
});
