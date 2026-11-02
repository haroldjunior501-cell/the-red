import React, { memo } from 'react';
import { Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MAP_HUB_COLORS } from '../../../constants/mapHub';
import { mapHubHeaderStyles as s } from './MapHubHeader.styles';

export type MapHubHeaderProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
};

export const MapHubHeader = memo(function MapHubHeader({ searchQuery, onSearchChange }: MapHubHeaderProps) {
  return (
    <View style={s.row}>
      <View style={s.logoBlock}>
        <Text style={s.logoSmall}>WORLD CUP</Text>
        <Text style={s.logoYear}>2026</Text>
      </View>
      <View style={s.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={18} color={MAP_HUB_COLORS.textMuted} style={s.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Rechercher un pays, une ville, un stade…"
          placeholderTextColor={MAP_HUB_COLORS.textMuted}
          style={s.searchInput}
          returnKeyType="search"
        />
      </View>
    </View>
  );
});
