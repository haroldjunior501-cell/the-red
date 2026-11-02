import React, { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MatchPhase, Stadium } from '../../../constants/mapHub';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';
import { links } from '../../../services/externalLinks';
import { actionButtonsStyles as s } from './ActionButtonsGrid.styles';

type ActionDef = {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  onPress: () => void;
  priority: number;
};

export type ActionButtonsGridProps = {
  stadium: Stadium;
  phase: MatchPhase;
};

export const ActionButtonsGrid = memo(function ActionButtonsGrid({ stadium, phase }: ActionButtonsGridProps) {
  const lat = stadium.coordinates[1];
  const lng = stadium.coordinates[0];
  const q = `${stadium.name} ${stadium.city}`;

  const allActions = useMemo<ActionDef[]>(
    () => [
      {
        id: 'tickets',
        label: 'Billets',
        icon: 'ticket',
        color: '#7C3AED',
        priority: phase === 'before' || phase === 'none' ? 0 : 4,
        onPress: () => void links.tickets(),
      },
      {
        id: 'hotels',
        label: 'Hôtels',
        icon: 'bed',
        color: '#2979ff',
        priority: phase === 'before' ? 1 : 3,
        onPress: () => void links.hotels(stadium.name, lat, lng),
      },
      {
        id: 'maps',
        label: 'Itinéraire',
        icon: 'map-marker-path',
        color: MAP_HUB_COLORS.primary,
        priority: phase === 'before' ? 2 : 5,
        onPress: () => void links.googleMaps(lat, lng),
      },
      {
        id: 'uber',
        label: 'Uber',
        icon: 'car',
        color: '#111827',
        priority: phase === 'before' ? 3 : 6,
        onPress: () => void links.uber(lat, lng, stadium.name),
      },
      {
        id: 'fan',
        label: 'Fan Zone',
        icon: 'party-popper',
        color: '#EC4899',
        priority: phase === 'live' ? 1 : phase === 'none' ? 2 : 4,
        onPress: () => void links.fanZone(stadium.city),
      },
      {
        id: 'resto',
        label: 'Restaurants',
        icon: 'silverware-fork-knife',
        color: '#F97316',
        priority: phase === 'after' ? 0 : 5,
        onPress: () => void links.restaurants(lat, lng),
      },
      {
        id: 'media',
        label: 'Médias',
        icon: 'youtube',
        color: '#EF4444',
        priority: phase === 'live' ? 0 : 6,
        onPress: () => void links.youtube(q),
      },
      {
        id: 'shop',
        label: 'Boutique',
        icon: 'shopping',
        color: '#EAB308',
        priority: 7,
        onPress: () => void links.shop(),
      },
    ],
    [lat, lng, phase, q, stadium.city, stadium.name]
  );

  const ordered = useMemo(() => [...allActions].sort((a, b) => a.priority - b.priority), [allActions]);

  return (
    <View style={s.grid}>
      {ordered.map((a) => (
        <Pressable key={a.id} style={s.cell} onPress={a.onPress}>
          <View style={[s.iconWrap, { backgroundColor: `${a.color}22`, borderColor: `${a.color}55` }]}>
            <MaterialCommunityIcons name={a.icon} size={22} color={a.color} />
          </View>
          <Text style={s.label}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
});
