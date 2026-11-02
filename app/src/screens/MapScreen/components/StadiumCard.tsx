import React, { memo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { stadiumById } from '../../../constants/mapHub';
import { links } from '../../../services/externalLinks';
import { ActionButtonsGrid } from './ActionButtonsGrid';
import { stadiumCardStyles as s } from './StadiumCard.styles';

type StadiumTab = 'apercu' | 'stats' | 'compo' | 'events';

const STADIUM_TABS: { id: StadiumTab; label: string }[] = [
  { id: 'apercu', label: 'APERÇU' },
  { id: 'stats', label: 'STATS' },
  { id: 'compo', label: 'COMPO' },
  { id: 'events', label: 'ÉVÉNEMENTS' },
];

export type StadiumCardProps = {
  stadiumId: string;
  sheetHeight: number;
  onBack: () => void;
};

export const StadiumCard = memo(function StadiumCard({ stadiumId, sheetHeight, onBack }: StadiumCardProps) {
  const [tab, setTab] = useState<StadiumTab>('apercu');
  const stadium = stadiumById(stadiumId);
  const phase = 'before' as const;

  if (!stadium) {
    return (
      <View style={[s.sheet, { height: sheetHeight }]}>
        <Text style={s.muted}>Stade introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={[s.sheet, { height: sheetHeight }]} accessibilityViewIsModal>
      <View style={s.handle} />
      <View style={s.heroWrap}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80' }}
          style={s.hero}
        />
        <View style={s.heroTopRow}>
          <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Retour">
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </Pressable>
          <Text style={s.heroTitle} numberOfLines={1}>
            {stadium.name.toUpperCase()}
          </Text>
          <View style={s.heroIcons}>
            <MaterialCommunityIcons name="heart-outline" size={22} color="#fff" />
            <Pressable onPress={() => void links.youtube(`${stadium.name} ${stadium.city}`)} hitSlop={8}>
              <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsRow}>
        {STADIUM_TABS.map((t) => (
          <Pressable key={t.id} onPress={() => setTab(t.id)} style={[s.tab, tab === t.id && s.tabActive]}>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {tab === 'apercu' ? (
        <>
          <View style={s.infoGrid}>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>Compétition</Text>
              <Text style={s.infoVal}>Coupe du Monde 2026</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>Ville</Text>
              <Text style={s.infoVal}>{stadium.city}</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>Capacité</Text>
              <Text style={s.infoVal}>{stadium.capacity.toLocaleString('fr-FR')}</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>Phase</Text>
              <Text style={s.infoVal}>Avant compétition</Text>
            </View>
          </View>
          <Text style={s.sectionTitle}>ACTIONS RAPIDES</Text>
          <ActionButtonsGrid stadium={stadium} phase={phase} />
          <Text style={s.sectionTitle}>VIDÉOS EN DIRECT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.videoRow}>
            <Pressable style={s.videoChip} onPress={() => void links.youtube(`${stadium.name} live`)}>
              <MaterialCommunityIcons name="youtube" size={22} color="#FF0000" />
              <Text style={s.videoChipText}>YouTube</Text>
            </Pressable>
            <Pressable style={s.videoChip} onPress={() => void links.tiktok(`${stadium.name} world cup`)}>
              <MaterialCommunityIcons name="music-note-eighth" size={22} color="#fff" />
              <Text style={s.videoChipText}>TikTok</Text>
            </Pressable>
            <Pressable style={s.videoChip} onPress={() => void links.twitch()}>
              <MaterialCommunityIcons name="twitch" size={22} color="#A855F7" />
              <Text style={s.videoChipText}>Twitch</Text>
            </Pressable>
          </ScrollView>
        </>
      ) : (
        <View style={s.tabBody}>
          <Text style={s.muted}>
            {tab === 'stats' && 'Statistiques temps réel : branchez un match_id depuis livescore-api pour afficher les données.'}
            {tab === 'compo' && 'Compositions : disponibles via getMatchLineups(match_id).'}
            {tab === 'events' && 'Événements de match : via getMatchEvents(match_id).'}
          </Text>
        </View>
      )}
    </View>
  );
});
