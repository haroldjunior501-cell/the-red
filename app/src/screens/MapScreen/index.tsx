import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NationBattleBar } from '../../components/map/NationBattleBar';
import { ReactionBar } from '../../components/map/ReactionBar';
import { TopSupporters } from '../../components/map/TopSupporters';
import { LiveEventsFeed } from '../../components/map/LiveEventsFeed';
import { flagEmoji } from '../../constants/mapHub';
import { useMapData } from '../../hooks/useMapData';
import { useMapStore } from '../../store/mapStore';
import { useUserStore } from '../../store/useUserStore';
import { ArenaView } from './components/ArenaView';
import { MapFilterBar } from './components/MapFilterBar';
import { MapHubHeader } from './components/MapHubHeader';
import { MapHubSidebar } from './components/MapHubSidebar';
import { NationChat } from './components/NationChat';
import { NationView } from './components/NationView';
import { WorldMapView } from './components/WorldMapView';
import { mapScreenStyles as s } from './MapScreen.styles';

type MapTab = 'monde' | 'nation';

export default function MapScreen() {
  const [mapTab, setMapTab] = useState<MapTab>('monde');

  // ── Navigation carte ────────────────────────────────────────────────────
  const level             = useMapStore((st) => st.level);
  const filter            = useMapStore((st) => st.filter);
  const selectedCountryId = useMapStore((st) => st.selectedCountryId);
  const selectedStadiumId = useMapStore((st) => st.selectedStadiumId);
  const searchQuery       = useMapStore((st) => st.searchQuery);
  const liveMatches       = useMapStore((st) => st.liveMatches);
  const setFilter             = useMapStore((st) => st.setFilter);
  const setLevel              = useMapStore((st) => st.setLevel);
  const setSelectedCountryId  = useMapStore((st) => st.setSelectedCountryId);
  const setSelectedStadiumId  = useMapStore((st) => st.setSelectedStadiumId);
  const setSearchQuery        = useMapStore((st) => st.setSearchQuery);
  const goBack                = useMapStore((st) => st.goBack);
  const resetToMapHub         = useMapStore((st) => st.resetToMapHub);

  // ── Data Firebase (Mind) ────────────────────────────────────────────────
  const { nationsPower, topSupporters, liveEvents, sendReaction, bumpNation } = useMapData();
  const userId      = useUserStore((s) => s.userId);
  const userName    = useUserStore((s) => s.name);
  const userCountry = useUserStore((s) => s.countryCode) || 'FR';
  const userRank    = useUserStore((s) => s.rank) || 'Supporter';
  const userKdo     = useUserStore((s) => s.kdo) || 0;

  // ── Taille carte ────────────────────────────────────────────────────────
  const [mapSize, setMapSize] = useState({ w: 0, h: 0 });
  const [webviewRef, setWebviewRef] = useState<{
    injectJavaScript: (js: string) => void;
  } | null>(null);

  const onMapLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setMapSize({ w: width, h: height });
  }, []);

  // ── Zoom globe selon tab ─────────────────────────────────────────────────
  useEffect(() => {
    if (!webviewRef) return;
    if (mapTab === 'nation') {
      webviewRef.injectJavaScript(
        `try{window.__goalyaFlyToNation&&window.__goalyaFlyToNation(${JSON.stringify(userCountry)});}catch(_){};true;`
      );
    } else {
      webviewRef.injectJavaScript(
        `try{window.__goalyaWorld&&window.__goalyaWorld();}catch(_){};true;`
      );
    }
  }, [mapTab, userCountry, webviewRef]);

  // ── Handlers navigation ─────────────────────────────────────────────────
  const onCountryTap = useCallback(
    (countryId: string) => { setSelectedCountryId(countryId); setLevel(2); },
    [setLevel, setSelectedCountryId]
  );
  const onStadiumTap = useCallback(
    (stadiumId: string) => { setSelectedStadiumId(stadiumId); setLevel(3); },
    [setLevel, setSelectedStadiumId]
  );

  // ── Réactions ──────────────────────────────────────────────────────────
  const onReact = useCallback(
    async (type: string, cost: number) => {
      if (!userId) return;
      await sendReaction(type, userId, userCountry, { title: type, cost });
      if (cost > 0) await bumpNation(userCountry, 3);
    },
    [sendReaction, bumpNation, userId, userCountry]
  );

  const sheetNation = level === 2 && selectedCountryId ? Math.round(mapSize.h * 0.55) : 0;
  const sheetArena  = level === 3 && selectedStadiumId ? Math.round(mapSize.h * 0.9)  : 0;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Header simplifié ── */}
      <MapHubHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <View style={s.rootRow}>
        {/* ── Sidebar (sans "Prochain match") ── */}
        <MapHubSidebar
          activeKey="carte"
          nextMatch={null}
          onSelect={(key) => { if (key === 'carte') resetToMapHub(); }}
        />

        {/* ── Colonne principale ── */}
        <View style={s.mainCol}>
          {/* Globe */}
          <View style={s.mapHost} onLayout={onMapLayout}>
            {mapSize.w > 0 && mapSize.h > 0 ? (
              <WorldMapView
                width={mapSize.w}
                height={mapSize.h}
                navLevel={level}
                selectedCountryId={selectedCountryId}
                liveMatches={liveMatches}
                onCountryTap={onCountryTap}
                onStadiumTap={onStadiumTap}
                onMapReady={() => undefined}
                onWebviewReady={setWebviewRef}
                mapTab={mapTab}
                userId={userId || 'anon'}
                userCountry={userCountry}
              />
            ) : null}
            <MapFilterBar value={filter} onChange={setFilter} />
          </View>

          {/* ── Panel bas (MONDE / MA NATION) ── */}
          <View style={s.bottomPanel}>
            {/* Tabs */}
            <View style={s.tabRow}>
              <Pressable
                onPress={() => setMapTab('monde')}
                style={[s.tab, mapTab === 'monde' && s.tabActive]}
              >
                <Text style={[s.tabText, mapTab === 'monde' && s.tabTextActive]}>
                  🌍 MONDE
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMapTab('nation')}
                style={[s.tab, mapTab === 'nation' && s.tabActive]}
              >
                <Text style={[s.tabText, mapTab === 'nation' && s.tabTextActive]}>
                  {flagEmoji(userCountry)} MA NATION
                </Text>
              </Pressable>
            </View>

            {/* Contenu */}
            {mapTab === 'monde' ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.panelScroll}
              >
                <NationBattleBar nationsPower={nationsPower} userCountry={userCountry} />
                <ReactionBar userKdo={userKdo} onReact={onReact} />
                <TopSupporters supporters={topSupporters} />
                <LiveEventsFeed events={liveEvents} />
              </ScrollView>
            ) : (
              <View style={s.nationPanelCol}>
                <NationBattleBar nationsPower={nationsPower} userCountry={userCountry} />
                <ReactionBar userKdo={userKdo} onReact={onReact} />
                <NationChat
                  countryId={userCountry}
                  userId={userId || 'anon'}
                  username={userName || 'Supporter'}
                  userRank={userRank}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── Sheets ── */}
      {level === 2 && selectedCountryId ? (
        <NationView
          countryId={selectedCountryId}
          sheetHeight={sheetNation}
          onBack={goBack}
          onSelectStadium={onStadiumTap}
        />
      ) : null}
      {level === 3 && selectedStadiumId ? (
        <ArenaView
          stadiumId={selectedStadiumId}
          sheetHeight={sheetArena}
          onBack={goBack}
        />
      ) : null}
    </SafeAreaView>
  );
}
