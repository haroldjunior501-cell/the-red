import React, { memo, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
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
  /** Conservé pour compat — la liste est en Modal plein écran. */
  slideAnim?: unknown;
  position: FantasyListPosition;
  players: FantasyPitchPlayer[];
  usedIds: Set<string>;
  loading?: boolean;
  benchMode?: boolean;
  hidePrice?: boolean;
  onClose: () => void;
  onSelect: (player: FantasyPitchPlayer) => void;
};

function PlayerListRow({
  player,
  position,
  onSelect,
  disabled,
  hidePrice,
}: {
  player: FantasyPitchPlayer;
  position: FantasyListPosition;
  onSelect: () => void;
  disabled: boolean;
  hidePrice?: boolean;
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
          {player.club || player.country}
          {player.number ? ` · #${player.number}` : ''}
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
      {!hidePrice ? (
        <View style={styles.priceCol}>
          <Text style={styles.price}>{player.price}M</Text>
        </View>
      ) : null}
      <View style={[styles.addBtn, disabled && styles.addBtnOff]}>
        <Text style={styles.addIcon}>{disabled ? '✓' : '+'}</Text>
      </View>
    </Pressable>
  );
}

export const PlayerListScreen = memo(function PlayerListScreen({
  visible,
  position,
  players,
  usedIds,
  loading,
  benchMode,
  hidePrice,
  onClose,
  onSelect,
}: PlayerListScreenProps) {
  const insets = useSafeAreaInsets();
  const cfg = benchMode
    ? {
        title: 'REMPLAÇANTS',
        badge: 'SUB',
        badgeBg: 'rgba(218,41,28,0.15)',
        badgeBorder: 'rgba(218,41,28,0.35)',
        badgeColor: T.blue2,
      }
    : LIST_POSITION_CONFIG[position];
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>(hidePrice ? 'rating' : 'price');

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
          return hidePrice ? b.rating - a.rating : b.price - a.price;
      }
    });
    return list;
  }, [hidePrice, players, search, sort]);

  const sorts: { key: SortKey; label: string }[] = hidePrice
    ? [
        { key: 'rating', label: 'Note ↓' },
        { key: 'pts', label: 'Points ↓' },
        { key: 'goals', label: 'Buts ↓' },
      ]
    : [
        { key: 'price', label: 'Prix ↓' },
        { key: 'pts', label: 'Points ↓' },
        { key: 'goals', label: 'Buts ↓' },
        { key: 'rating', label: 'Note ↓' },
      ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.view, { paddingTop: insets.top }]}>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortRow}
          >
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
            <View style={styles.emptyWrap}>
              <ActivityIndicator color={T.blue} />
              <Text style={styles.loading}>Chargement des joueurs…</Text>
            </View>
          ) : null}
          {!loading && filtered.length === 0 ? (
            <Text style={styles.loading}>Aucun joueur disponible pour ce poste.</Text>
          ) : null}
          {filtered.map((p) => (
            <PlayerListRow
              key={p.id}
              player={p}
              position={benchMode ? p.position : position}
              disabled={usedIds.has(p.id)}
              hidePrice={hidePrice}
              onSelect={() => onSelect(p)}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: T.bg,
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
    backgroundColor: 'rgba(218,41,28,0.2)',
    borderColor: T.blue,
  },
  sortTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: T.muted2 },
  sortTxtOn: { color: T.text },
  list: { flex: 1 },
  emptyWrap: { alignItems: 'center', paddingVertical: 32, gap: 12 },
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
  statVal: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: T.text2,
    fontVariant: ['tabular-nums'],
  },
  statLbl: { fontSize: 8, color: T.muted2, textTransform: 'uppercase' },
  priceCol: { alignItems: 'flex-end', minWidth: 36 },
  price: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: T.gold,
    textAlign: 'right',
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(218,41,28,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(218,41,28,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnOff: { opacity: 0.45 },
  addIcon: { fontSize: 18, color: T.gold, fontFamily: 'Inter_700Bold' },
});
