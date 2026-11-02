import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { flagEmoji, HOST_COUNTRIES, MAP_HUB_COLORS, STADIUMS } from '../../../constants/mapHub';
import type { LiveMatchUpdate } from '../../../store/mapStore';
import { subscribeToSupportersOnline, type SupporterOnline } from '../../../services/mapService';
import { isMapboxPublicTokenConfigured, readExpoMapboxToken } from '../../../utils/mapboxEnv';
import { buildMapLibreHubHtml } from './mapLibreHtml';
import { buildMapHubHtml } from './mapWebHtml';
import { worldMapViewStyles as s } from './WorldMapView.styles';

export type WebviewHandle = { injectJavaScript: (js: string) => void };

export type WorldMapViewProps = {
  width: number;
  height: number;
  navLevel: number;
  selectedCountryId: string | null;
  liveMatches: LiveMatchUpdate[];
  mapTab: 'monde' | 'nation';
  userId: string;
  userCountry: string;
  onCountryTap: (countryId: string) => void;
  onStadiumTap: (stadiumId: string) => void;
  onMapReady: () => void;
  onWebviewReady?: (handle: WebviewHandle) => void;
};

function markMapReady(
  notified: React.RefObject<boolean>,
  setReady: (v: boolean) => void,
  cb: () => void
) {
  setReady(true);
  if (!notified.current) { notified.current = true; cb(); }
}

export const WorldMapView = memo(function WorldMapView({
  width, height, navLevel, selectedCountryId,
  liveMatches, mapTab, userId, userCountry,
  onCountryTap, onStadiumTap, onMapReady, onWebviewReady,
}: WorldMapViewProps) {
  const mapboxToken = useMemo(() => readExpoMapboxToken(), []);
  const useMapbox  = isMapboxPublicTokenConfigured(mapboxToken);

  const webRef        = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const readyNotified = useRef(false);
  const skipWorld     = useRef(true);
  const lastCountry   = useRef<string | null>(null);

  const html = useMemo(
    () => useMapbox
      ? buildMapHubHtml(mapboxToken, HOST_COUNTRIES, STADIUMS)
      : buildMapLibreHubHtml(HOST_COUNTRIES, STADIUMS),
    [useMapbox, mapboxToken]
  );

  const inject = useCallback((js: string) => {
    webRef.current?.injectJavaScript(js);
  }, []);

  // Expose WebView handle to parent (for tab-driven flyTo)
  useEffect(() => {
    onWebviewReady?.({ injectJavaScript: inject });
  }, [inject, onWebviewReady]);

  // ── Firebase: avatars ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToSupportersOnline((list: SupporterOnline[]) => {
      if (!mapReady) return;
      const payload = list.map((s) => ({
        lat: s.lat,
        lng: s.lng,
        flag: flagEmoji(s.country),
        name: s.name,
        rank: s.rank,
        country: s.country,
        isMe: s.userId === userId,
        muted: mapTab === 'nation' && s.country !== userCountry,
      }));
      inject(
        `try{window.__goalyaUpdateAvatars&&window.__goalyaUpdateAvatars(${JSON.stringify(payload)});}catch(_){};true;`
      );
    });
    return () => unsub();
  }, [mapReady, mapTab, userCountry, userId, inject]);

  // ── Live matches → lignes de tension ─────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return;
    inject(
      `try{window.__goalyaUpdateLiveMatches&&window.__goalyaUpdateLiveMatches(${JSON.stringify(liveMatches)});}catch(_){};true;`
    );
  }, [mapReady, liveMatches, inject]);

  // ── Navigation niveau pays ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return;
    if (navLevel >= 2 && selectedCountryId && lastCountry.current !== selectedCountryId) {
      lastCountry.current = selectedCountryId;
      inject(
        `try{window.__goalyaEnterCountry&&window.__goalyaEnterCountry(${JSON.stringify(selectedCountryId)});}catch(_){};true;`
      );
    }
    if (navLevel === 1) lastCountry.current = null;
  }, [navLevel, selectedCountryId, mapReady, inject]);

  useEffect(() => {
    if (!mapReady || navLevel !== 1) return;
    if (skipWorld.current) { skipWorld.current = false; return; }
    inject(`try{window.__goalyaWorld&&window.__goalyaWorld();}catch(_){};true;`);
  }, [navLevel, mapReady, inject]);

  const onMessage = useCallback(
    (e: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(e.nativeEvent.data) as {
          type?: string;
          payload?: { id?: string; message?: string };
        };
        if (msg.type === 'ready' || msg.type === 'MAP_READY')
          markMapReady(readyNotified, setMapReady, onMapReady);
        if (msg.type === 'map_error' && __DEV__)
          // eslint-disable-next-line no-console
          console.warn('[WorldMapView] map_error', msg.payload?.message);
        if (msg.type === 'country' && msg.payload?.id) onCountryTap(msg.payload.id);
        if (msg.type === 'stadium' && msg.payload?.id) onStadiumTap(msg.payload.id);
      } catch { /* ignore */ }
    },
    [onCountryTap, onStadiumTap, onMapReady]
  );

  return (
    <View style={[s.wrap, { width, height, backgroundColor: MAP_HUB_COLORS.background }]}>
      <WebView
        ref={webRef}
        style={[StyleSheet.absoluteFill, { backgroundColor: MAP_HUB_COLORS.background }]}
        containerStyle={{ flex: 1, backgroundColor: MAP_HUB_COLORS.background }}
        source={{ html }}
        onMessage={onMessage}
        onError={(ev) => { if (__DEV__) console.error('[WorldMapView]', ev.nativeEvent); }}
        onHttpError={(ev) => { if (__DEV__) console.error('[WorldMapView] HTTP', ev.nativeEvent); }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        scrollEnabled={false}
        nestedScrollEnabled={false}
        androidLayerType="hardware"
      />
    </View>
  );
});
