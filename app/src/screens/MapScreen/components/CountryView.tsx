import React, { memo, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { hostById, stadiumsForCountry } from '../../../constants/mapHub';
import { countryViewStyles as s } from './CountryView.styles';

export type CountryTabId = 'villes' | 'stades' | 'fan_zones' | 'hotels' | 'evenements';

const TABS: { id: CountryTabId; label: string }[] = [
  { id: 'villes', label: 'VILLES' },
  { id: 'stades', label: 'STADES' },
  { id: 'fan_zones', label: 'FAN ZONES' },
  { id: 'hotels', label: 'HÔTELS' },
  { id: 'evenements', label: 'ÉVÉNEMENTS' },
];

type FeaturedItem = { id: string; title: string; subtitle: string; dates: string; image: string };

const FEATURED: Record<string, FeaturedItem[]> = {
  usa: [
    {
      id: 'nyc',
      title: 'New York',
      subtitle: 'MetLife Fan Zone',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80',
    },
    {
      id: 'la',
      title: 'Los Angeles',
      subtitle: 'SoFi Live',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1534190233410-7fe14d94911b?w=600&q=80',
    },
    {
      id: 'mia',
      title: 'Miami',
      subtitle: 'Hard Rock Beach',
      dates: '15 JUIN · 20:00',
      image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
    },
  ],
  canada: [
    {
      id: 'to',
      title: 'Toronto',
      subtitle: 'BMO Field',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1517935706615-2717233b862c?w=600&q=80',
    },
    {
      id: 'van',
      title: 'Vancouver',
      subtitle: 'BC Place',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=600&q=80',
    },
  ],
  mexico: [
    {
      id: 'cdmx',
      title: 'Mexico City',
      subtitle: 'Estadio Azteca',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1585464231875-d664ef27f235?w=600&q=80',
    },
    {
      id: 'mty',
      title: 'Monterrey',
      subtitle: 'BBVA',
      dates: '15 JUIN · 20:00',
      image: 'https://images.unsplash.com/photo-1518659526055-ea1c54d7f92a?w=600&q=80',
    },
  ],
  france: [
    {
      id: 'paris',
      title: 'Paris',
      subtitle: 'Fan Zone Champ de Mars',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    },
    {
      id: 'marseille',
      title: 'Marseille',
      subtitle: 'Vieux-Port',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1565099821747-68f0088cbd2b?w=600&q=80',
    },
    {
      id: 'lyon',
      title: 'Lyon',
      subtitle: 'Place Bellecour',
      dates: '15 JUIN · 20:00',
      image: 'https://images.unsplash.com/photo-1565967511844-1e2240c51b9e?w=600&q=80',
    },
  ],
  brazil: [
    {
      id: 'rio',
      title: 'Rio de Janeiro',
      subtitle: 'Copacabana Fan Fest',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80',
    },
    {
      id: 'sp',
      title: 'São Paulo',
      subtitle: 'Arena Corinthians',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    },
  ],
  japan: [
    {
      id: 'tokyo',
      title: 'Tokyo',
      subtitle: 'Fan Zone Shibuya',
      dates: '12 – 28 JUIN',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
    },
    {
      id: 'yokohama',
      title: 'Yokohama',
      subtitle: 'Waterfront',
      dates: '15 JUIN · 20:00',
      image: 'https://images.unsplash.com/photo-1524413840807-0c3cb492063b?w=600&q=80',
    },
  ],
};

export type CountryViewProps = {
  countryId: string;
  sheetHeight: number;
  onBack: () => void;
  onSelectStadium: (stadiumId: string) => void;
};

export const CountryView = memo(function CountryView({ countryId, sheetHeight, onBack, onSelectStadium }: CountryViewProps) {
  const [tab, setTab] = useState<CountryTabId>('villes');
  const host = hostById(countryId);
  const title = host?.name ?? countryId.toUpperCase();
  const stadiums = useMemo(() => stadiumsForCountry(countryId), [countryId]);
  const featured = FEATURED[countryId] ?? FEATURED.usa;

  return (
    <View style={[s.sheet, { height: sheetHeight }]} accessibilityViewIsModal>
      <View style={s.handle} />
      <View style={s.headerRow}>
        <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Retour">
          <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
        </Pressable>
        <Text style={s.title}>{title.toUpperCase()}</Text>
        <MaterialCommunityIcons name="heart-outline" size={22} color="#9ca3af" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsRow}>
        {TABS.map((t) => (
          <Pressable key={t.id} onPress={() => setTab(t.id)} style={[s.tab, tab === t.id && s.tabActive]}>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={s.sectionLabel}>À la une</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.featuredRow}>
        {featured.map((item) => (
          <View key={item.id} style={s.card}>
            <Image source={{ uri: item.image }} style={s.cardImg} />
            <View style={s.cardOverlay}>
              <View style={s.cardOverlayTint} />
              <View style={s.cardOverlayText}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardSub}>{item.subtitle}</Text>
                <Text style={s.cardDates}>{item.dates}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      {tab === 'stades' ? (
        <ScrollView style={s.list} contentContainerStyle={s.listContent}>
          {stadiums.map((st) => (
            <Pressable key={st.id} style={s.stRow} onPress={() => onSelectStadium(st.id)}>
              <View style={s.stDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.stName}>{st.name}</Text>
                <Text style={s.stCity}>
                  {st.city} · {st.capacity.toLocaleString('fr-FR')} places
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#6b7280" />
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={s.placeholder}>
          <Text style={s.placeholderText}>
            {tab === 'villes' && 'Sélectionnez un stade sur la carte ou dans l’onglet STADES.'}
            {tab === 'fan_zones' && 'Fan zones officielles — liens externes depuis la fiche stade.'}
            {tab === 'hotels' && 'Hôtels à proximité via Booking depuis la fiche stade.'}
            {tab === 'evenements' && 'Événements partenaires — bientôt synchronisés avec l’API.'}
          </Text>
        </View>
      )}
    </View>
  );
});
