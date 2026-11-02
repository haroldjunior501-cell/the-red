import React, { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { hostById, stadiumsForCountry } from '../../../constants/mapHub';
import { useNationData } from '../../../hooks/useNationData';
import { nationViewStyles as s } from './NationView.styles';

type TabId = 'evenements' | 'stades' | 'top';

const GIFTS = [
  { emoji: '🏆', label: 'Trophée' },
  { emoji: '🔥', label: 'Feu' },
  { emoji: '⚽', label: 'Ballon' },
  { emoji: '💚', label: 'Cœur' },
];

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽', gift: '🎁', control: '🗺️', join: '👋', reaction: '🔥',
};

export type NationViewProps = {
  countryId: string;
  sheetHeight: number;
  onBack: () => void;
  onSelectStadium: (stadiumId: string) => void;
};

export const NationView = memo(function NationView({
  countryId, sheetHeight, onBack, onSelectStadium,
}: NationViewProps) {
  const [tab, setTab] = useState<TabId>('evenements');
  const data     = useNationData(countryId);
  const host     = hostById(countryId);
  const stadiums = useMemo(() => stadiumsForCountry(countryId), [countryId]);

  const displayName = host?.name ?? countryId.toUpperCase();
  const flag        = data?.flag ?? '🌐';
  const power       = data?.power ?? 0;
  const supporters  = data?.supporterCount ?? 0;

  return (
    <View style={[s.sheet, { height: sheetHeight }]} accessibilityViewIsModal>
      <View style={s.handle} />

      {/* Header */}
      <View style={s.headerRow}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={12} accessibilityRole="button">
          <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
        </Pressable>
        <Text style={s.flag}>{flag}</Text>
        <View style={s.headerInfo}>
          <Text style={s.nationName}>{displayName.toUpperCase()}</Text>
          <Text style={s.supportersCount}>
            {supporters > 0 ? `${supporters.toLocaleString('fr-FR')} supporters actifs` : 'Nation active'}
          </Text>
        </View>
        <MaterialCommunityIcons name="heart-outline" size={22} color="#6b7280" />
      </View>

      {/* Jauge de force */}
      <View style={s.forceWrap}>
        <Text style={s.forceLabel}>FORCE DE LA NATION</Text>
        <View style={s.forceTrack}>
          <View style={[s.forceFill, { width: `${Math.min(100, power)}%` }]} />
        </View>
        <View style={s.forceValueRow}>
          <Text style={s.forceValue}>{power}%</Text>
          <Text style={s.forceLabel2}>vs autres nations</Text>
        </View>
      </View>

      {/* Envoi de cadeaux rapide */}
      <View style={s.giftsRow}>
        {GIFTS.map((g) => (
          <Pressable
            key={g.emoji}
            style={s.giftBtn}
            onPress={() => void data?.sendGift(g.label)}
          >
            <Text style={s.giftEmoji}>{g.emoji}</Text>
            <Text style={s.giftLabel}>{g.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsRow}>
        {([
          { id: 'evenements', label: 'ÉVÉNEMENTS' },
          { id: 'stades',     label: 'STADES' },
          { id: 'top',        label: 'TOP FANS' },
        ] as { id: TabId; label: string }[]).map((t) => (
          <Pressable key={t.id} onPress={() => setTab(t.id)} style={[s.tab, tab === t.id && s.tabActive]}>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tab content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {tab === 'evenements' && (
          data?.recentEvents && data.recentEvents.length > 0 ? (
            data.recentEvents.map((evt) => (
              <View key={evt.id} style={s.eventRow}>
                <Text style={s.eventIcon}>{EVENT_ICONS[evt.type] ?? '📌'}</Text>
                <View style={s.eventContent}>
                  <Text style={s.eventTitle}>{evt.title}</Text>
                  {evt.description ? <Text style={s.eventDesc}>{evt.description}</Text> : null}
                </View>
              </View>
            ))
          ) : (
            <View style={s.placeholder}>
              <Text style={s.placeholderText}>Aucun événement récent</Text>
            </View>
          )
        )}

        {tab === 'stades' && stadiums.map((st) => (
          <Pressable key={st.id} style={s.stRow} onPress={() => onSelectStadium(st.id)}>
            <View style={s.stDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.stName}>{st.name}</Text>
              <Text style={s.stCity}>{st.city} · {st.capacity.toLocaleString('fr-FR')} places</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </Pressable>
        ))}

        {tab === 'top' && (
          data?.topSupporters && data.topSupporters.length > 0 ? (
            data.topSupporters.map((sup, i) => (
              <View key={sup.id} style={s.eventRow}>
                <Text style={s.eventIcon}>{'🥇🥈🥉🏅🏅'[i] ?? '🏅'}</Text>
                <View style={s.eventContent}>
                  <Text style={s.eventTitle}>{sup.name}</Text>
                  <Text style={s.eventDesc}>{sup.kdo.toLocaleString('fr-FR')} KDO</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={s.placeholder}>
              <Text style={s.placeholderText}>Aucun top supporter pour l'instant</Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
});
