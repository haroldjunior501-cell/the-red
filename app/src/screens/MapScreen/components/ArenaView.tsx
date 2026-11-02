import React, { memo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { flagEmoji, stadiumById } from '../../../constants/mapHub';
import { useArenaData } from '../../../hooks/useArenaData';
import { links } from '../../../services/externalLinks';
import { ActionButtonsGrid } from './ActionButtonsGrid';
import { arenaViewStyles as s } from './ArenaView.styles';

type ArenaTab = 'bataille' | 'stats' | 'compo' | 'hub';

const ARENA_TABS: { id: ArenaTab; label: string }[] = [
  { id: 'bataille', label: '⚔️ BATAILLE' },
  { id: 'stats',    label: '📊 STATS' },
  { id: 'compo',    label: '👥 COMPO' },
  { id: 'hub',      label: '🗺️ HUB' },
];

const GIFTS = [
  { emoji: '🏆', label: 'Trophée', team: 'home' as const },
  { emoji: '🔥', label: 'Feu',     team: 'home' as const },
  { emoji: '💚', label: 'Cœur',    team: 'home' as const },
  { emoji: '⚽', label: 'Ballon',  team: 'away' as const },
];

export type ArenaViewProps = {
  stadiumId: string;
  sheetHeight: number;
  onBack: () => void;
};

export const ArenaView = memo(function ArenaView({ stadiumId, sheetHeight, onBack }: ArenaViewProps) {
  const [tab, setTab] = useState<ArenaTab>('bataille');
  const stadium = stadiumById(stadiumId);
  const data    = useArenaData(stadium ? stadiumId : null);

  if (!stadium) {
    return (
      <View style={[s.sheet, { height: sheetHeight }]}>
        <Text style={s.muted}>Arène introuvable.</Text>
      </View>
    );
  }

  const score = data.score;
  const lat   = stadium.coordinates[1];
  const lng   = stadium.coordinates[0];

  return (
    <View style={[s.sheet, { height: sheetHeight }]} accessibilityViewIsModal>
      <View style={s.handle} />

      {/* Header */}
      <View style={s.heroRow}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={12} accessibilityRole="button">
          <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
        </Pressable>
        <Text style={s.heroTitle} numberOfLines={1}>{stadium.name.toUpperCase()}</Text>
        <View style={s.heroIcons}>
          <MaterialCommunityIcons name="heart-outline" size={22} color="#fff" />
          <Pressable onPress={() => void links.youtube(`${stadium.name} ${stadium.city}`)} hitSlop={8}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Score live */}
      {score ? (
        <View style={s.scoreBar}>
          <Text style={s.scoreTeam} numberOfLines={1}>{score.homeTeam}</Text>
          <View style={s.scoreCenter}>
            <Text style={s.scoreDigits}>{score.homeScore} — {score.awayScore}</Text>
            {score.isLive ? (
              <View style={s.livePill}>
                <View style={s.liveDot} />
                <Text style={s.liveText}>LIVE {score.minute}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[s.scoreTeam, s.scoreTeamAway]} numberOfLines={1}>{score.awayTeam}</Text>
        </View>
      ) : null}

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsRow}>
        {ARENA_TABS.map((t) => (
          <Pressable key={t.id} onPress={() => setTab(t.id)} style={[s.tab, tab === t.id && s.tabActive]}>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tab content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ── BATAILLE ── */}
        {tab === 'bataille' && (
          <>
            {/* Nations face à face */}
            {score ? (
              <View style={s.nationsRow}>
                <View style={s.nationBlock}>
                  <Text style={s.nationFlag}>{flagEmoji('FR')}</Text>
                  <Text style={s.nationName}>{score.homeTeam}</Text>
                </View>
                <Text style={s.vsText}>VS</Text>
                <View style={s.nationBlock}>
                  <Text style={s.nationFlag}>{flagEmoji('BR')}</Text>
                  <Text style={s.nationName}>{score.awayTeam}</Text>
                </View>
              </View>
            ) : null}

            {/* Boutons cadeaux */}
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#6b7280', paddingHorizontal: 16, marginBottom: 6, letterSpacing: 1 }}>
              ENVOYER UN CADEAU
            </Text>
            <View style={s.giftRow}>
              {GIFTS.map((g) => (
                <Pressable
                  key={g.emoji}
                  style={s.giftBtn}
                  onPress={() => void data.sendGift(g.label, g.team === 'home' ? (score?.homeTeam ?? 'Home') : (score?.awayTeam ?? 'Away'))}
                >
                  <Text style={s.giftEmoji}>{g.emoji}</Text>
                  <Text style={s.giftLabel}>{g.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Cadeaux récents */}
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#6b7280', paddingHorizontal: 16, marginBottom: 6, marginTop: 4, letterSpacing: 1 }}>
              CADEAUX RÉCENTS
            </Text>
            {data.recentGifts.length > 0 ? (
              data.recentGifts.map((evt) => (
                <View key={evt.id} style={s.eventRow}>
                  <Text style={s.eventIcon}>🎁</Text>
                  <View style={s.eventContent}>
                    <Text style={s.eventTitle}>{evt.title}</Text>
                    {evt.description ? <Text style={s.eventDesc}>{evt.description}</Text> : null}
                  </View>
                </View>
              ))
            ) : (
              <View style={s.placeholder}>
                <Text style={s.placeholderText}>Sois le premier à envoyer un cadeau !</Text>
              </View>
            )}
          </>
        )}

        {/* ── STATS ── */}
        {tab === 'stats' && (
          data.stats.length > 0 ? (
            data.stats.map((st, i) => (
              <View key={i} style={s.statRow}>
                <Text style={s.statHome}>{st.home}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
                <Text style={s.statAway}>{st.away}</Text>
              </View>
            ))
          ) : (
            <View style={s.placeholder}>
              <Text style={s.placeholderText}>
                {data.apiConfigured
                  ? 'Chargement des statistiques…'
                  : 'Les stats détaillées arrivent bientôt pour ce match.'}
              </Text>
            </View>
          )
        )}

        {/* ── COMPO ── */}
        {tab === 'compo' && (
          <View style={s.placeholder}>
            <Text style={s.placeholderText}>
              {data.apiConfigured
                ? 'Les compositions seront affichées avant le coup d\'envoi.'
                : 'Les compositions seront disponibles avant le coup d\'envoi.'}
            </Text>
          </View>
        )}

        {/* ── HUB ── */}
        {tab === 'hub' && (
          <>
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#6b7280', paddingHorizontal: 16, paddingVertical: 10, letterSpacing: 1 }}>
              ACTIONS RAPIDES
            </Text>
            <ActionButtonsGrid stadium={stadium} phase="before" />
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#6b7280', paddingHorizontal: 16, paddingVertical: 10, letterSpacing: 1 }}>
              MÉDIAS EN DIRECT
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 20 }}>
              {[
                { icon: 'youtube' as const, label: 'YouTube', color: '#FF0000', onPress: () => void links.youtube(`${stadium.name} live`) },
                { icon: 'music-note-eighth' as const, label: 'TikTok', color: '#fff', onPress: () => void links.tiktok(`${stadium.name} world cup`) },
                { icon: 'twitch' as const, label: 'Twitch', color: '#A855F7', onPress: () => void links.twitch() },
              ].map((v) => (
                <Pressable key={v.label}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' }}
                  onPress={v.onPress}>
                  <MaterialCommunityIcons name={v.icon} size={20} color={v.color} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{v.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </View>
  );
});
