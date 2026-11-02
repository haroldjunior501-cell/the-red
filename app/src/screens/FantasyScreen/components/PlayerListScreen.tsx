import React, { memo, useMemo, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlayerCard } from '../../../components/fantasy/PlayerCard';
import { LIST_POSITION_CONFIG } from '../../../constants/fantasyPitch';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';
import type { FantasyListPosition, FantasyPitchPlayer } from '../../../types/fantasy.types';
import { getPlayerPhoto } from '../../../utils/playerPhoto';

export type SortKey = 'price' | 'pts' | 'goals' | 'rating';

export type PlayerListScreenProps = {
  visible: boolean;
  slideAnim: Animated.Value;
  position: FantasyListPosition;
  players: FantasyPitchPlayer[];
  usedIds: Set<string>;
  loading?: boolean;
  /** Mode remplaçant : tous postes, titre adapté */
  benchMode?: boolean;
  onClose: () => void;
  onSelect: (player: FantasyPitchPlayer) => void;
};

function PlayerListRow({
  player,
  position,
  onSelect,
  disabled,
}: {
  player: FantasyPitchPlayer;
  position: FantasyListPosition;
  onSelect: () => void;
  disabled: boolean;
}) {
  const posLabel = position === 'MID' ? 'MIL' : position;

  return (
    <Pressable style={styles.row} onPress={onSelect} disabled={disabled}>
      <PlayerCard
        name={player.shortName}
        pts={player.pts}
        photo={getPlayerPhoto(player)}
        positionLabel={posLabel}
        size="list"
        active={!disabled}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {player.country}
          {player.club ? ` · ${player.club}` : ''}
        </Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.statCol}>
          <Text style={styles.statVal}>{player.goals}</Text>
          <Text style={styles.statLbl}>Buts</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statVal}>{player.rating.toFixed(1)}</Text>
          <Text style={styles.statLbl}>Note</Text>
        </View>
      </View>
      <View style={styles.priceCol}>
        <Text
          style={[
            styles.price,
            player.priceTrend === 'up' && styles.priceUp,
            player.priceTrend === 'down' && styles.priceDown,
          ]}
        >
          {player.price}M
        </Text>
        {player.priceTrend && player.priceTrend !== 'stable' ? (
          <Text
            style={[
              styles.trend,
              player.priceTrend === 'up' && styles.priceUp,
              player.priceTrend === 'down' && styles.priceDown,
            ]}
          >
            {player.priceTrend === 'up' ? '↑' : '↓'}
          </Text>
        ) : null}
      </View>
      <View style={[styles.addBtn, disabled && styles.addBtnOff]}>
        <Text style={styles.addIcon}>{disabled ? '✓' : '+'}</Text>
      </View>
    </Pressable>
  );
}

export const PlayerListScreen = memo(function PlayerListScreen({
  visible,
  slideAnim,
  position,
  players,
  usedIds,
  loading,
  benchMode,
  onClose,
  onSelect,
}: PlayerListScreenProps) {
  const insets = useSafeAreaInsets();
  const cfg = benchMode
    ? {
        title: 'REMPLAÇANTS',
        badge: 'SUB',
        badgeBg: 'rgba(41,121,255,0.15)',
        badgeBorder: 'rgba(41,121,255,0.3)',
        badgeColor: '#5b9aff',
      }
    : LIST_POSITION_CONFIG[position];
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('price');

  const filtered = useMemo(() => {
    let list = [...players];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.shortName.toLowerCase().includes(q) ||
          (p.club?.toLowerCase().includes(q) ?? false)
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case 'pts':
          return b.pts - a.pts;
        case 'goals':
          return b.goals - a.goals;
        case 'rating':
          return b.rating - a.rating;
        case 'price':
        default:
          return b.price - a.price;
      }
    });
    return list;
  }, [players, search, sort]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  if (!visible) return null;

  const sorts: { key: SortKey; label: string }[] = [
    { key: 'price', label: 'Prix ↓' },
    { key: 'pts', label: 'Points ↓' },
    { key: 'goals', label: 'Buts ↓' },
    { key: 'rating', label: 'Note ↓' },
  ];

  return (
    <Animated.View
      style={[styles.view, { paddingTop: insets.top, transform: [{ translateX }] }]}
      pointerEvents="auto"
    >
      <View style={styles.header}>
        <View style={styles.hRow}>
          <Pressable style={styles.back} onPress={onClose}>
            <Text style={styles.backTxt}>←</Text>
          </Pressable>
          <Text style={styles.title}>{cfg.title}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.badgeBg, borderColor: cfg.badgeBorder }]}>
            <Text style={[styles.badgeTxt, { color: cfg.badgeColor }]}>{cfg.badge}</Text>
          </View>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un joueur..."
            placeholderTextColor={T.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {sorts.map((s) => (
            <Pressable
              key={s.key}
              style={[styles.sortBtn, sort === s.key && styles.sortBtnOn]}
              onPress={() => setSort(s.key)}
            >
              <Text style={[styles.sortTxt, sort === s.key && styles.sortTxtOn]}>{s.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {loading && filtered.length === 0 ? (
          <Text style={styles.loading}>Chargement des joueurs…</Text>
        ) : null}
        {filtered.map((p) => (
          <PlayerListRow
            key={p.id}
            player={p}
            position={position}
            disabled={usedIds.has(p.id)}
            onSelect={() => onSelect(p)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  view: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.bg,
    zIndex: 20,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  hRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingTop: 8 },
  back: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTxt: { color: T.text2, fontSize: 14 },
  title: {
    flex: 1,
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    letterSpacing: 3,
    color: T.text,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeTxt: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: T.card2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 10,
  },
  searchIcon: { color: T.muted2, fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: T.text,
    fontFamily: 'Inter_500Medium',
    padding: 0,
  },
  sortRow: { gap: 6, paddingBottom: 10 },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
  },
  sortBtnOn: {
    backgroundColor: 'rgba(41,121,255,0.2)',
    borderColor: T.blue,
  },
  sortTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: T.muted2 },
  sortTxtOn: { color: T.text },
  list: { flex: 1 },
  loading: {
    textAlign: 'center',
    color: T.muted2,
    fontFamily: 'Inter_500Medium',
    paddingVertical: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 13, color: T.text, marginBottom: 2 },
  meta: { fontFamily: 'Inter_500Medium', fontSize: 11, color: T.muted2 },
  stats: { flexDirection: 'row', gap: 12 },
  statCol: { alignItems: 'center' },
  statVal: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: T.text2, fontVariant: ['tabular-nums'] },
  statLbl: { fontSize: 8, color: T.muted2, textTransform: 'uppercase' },
  priceCol: { alignItems: 'flex-end', minWidth: 36 },
  price: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: T.gold,
    textAlign: 'right',
  },
  priceUp: { color: T.green },
  priceDown: { color: '#e5382b' },
  trend: { fontFamily: 'Inter_800ExtraBold', fontSize: 11, marginTop: 1 },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(41,121,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(41,121,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnOff: { opacity: 0.45 },
  addIcon: { fontSize: 18, color: T.blue2, fontFamily: 'Inter_700Bold' },
});
