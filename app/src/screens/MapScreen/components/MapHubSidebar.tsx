import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NextMatchCard } from '../../../store/mapStore';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';
import { mapHubSidebarStyles as s } from './MapHubSidebar.styles';

type NavKey = 'carte' | 'matches' | 'favoris' | 'billets' | 'voyage' | 'fanzone' | 'plus';

const ITEMS: { key: NavKey; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { key: 'carte', icon: 'map-outline', label: 'Carte' },
  { key: 'matches', icon: 'soccer', label: 'Matches' },
  { key: 'favoris', icon: 'heart-outline', label: 'Favoris' },
  { key: 'billets', icon: 'ticket-outline', label: 'Billets' },
  { key: 'voyage', icon: 'airplane', label: 'Voyage' },
  { key: 'fanzone', icon: 'party-popper', label: 'Fan Zone' },
  { key: 'plus', icon: 'dots-horizontal', label: 'Plus' },
];

export type MapHubSidebarProps = {
  activeKey: NavKey;
  onSelect: (key: NavKey) => void;
  nextMatch: NextMatchCard | null;
};

export const MapHubSidebar = memo(function MapHubSidebar({ activeKey, onSelect, nextMatch }: MapHubSidebarProps) {
  return (
    <View style={s.col}>
      <View style={s.nav}>
        {ITEMS.map((it) => {
          const active = it.key === activeKey;
          return (
            <Pressable key={it.key} style={[s.navItem, active && s.navItemActive]} onPress={() => onSelect(it.key)}>
              <MaterialCommunityIcons name={it.icon} size={22} color={active ? MAP_HUB_COLORS.primary : MAP_HUB_COLORS.textMuted} />
              <Text style={[s.navLabel, active && s.navLabelActive]} numberOfLines={1}>
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {nextMatch ? (
        <View style={s.nextCard}>
          <Text style={s.nextTitle}>Prochain match</Text>
          <Text style={s.nextTeams} numberOfLines={2}>
            {nextMatch.home} · {nextMatch.away}
          </Text>
          <Text style={s.nextMeta}>{nextMatch.dateLabel}</Text>
          <Text style={s.nextVenue} numberOfLines={2}>
            {nextMatch.venue}
          </Text>
        </View>
      ) : null}
    </View>
  );
});
