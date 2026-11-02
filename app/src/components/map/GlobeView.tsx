import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { flagEmoji } from '../../constants/mapHub';
import { buildMindGlobeHtml } from '../../services/mapWebHtml';
import { subscribeToLiveEvents, subscribeToSupportersOnline, type SupporterOnline } from '../../services/mapService';
import { isMapboxPublicTokenConfigured, readExpoMapboxToken } from '../../utils/mapboxEnv';
import { HubGlobeFallback } from '../../screens/HubScreen/components/HubGlobeFallback';

export type GlobeViewHandle = { injectJavaScript: (js: string) => void };

export type GlobeViewProps = {
  height: number;
  mindTab: 'monde' | 'nation' | 'chat';
  userId: string;
  userCountry: string;
  onReady?: (handle: GlobeViewHandle) => void;
  onStadiumTap?: (stadiumId: string) => void;
};

const NATION_CENTROIDS: Record<string, [number, number]> = {
  FR: [2.3522, 46.2276],
  FRA: [2.3522, 46.2276],
  BR: [-51.9253, -14.235],
  BRA: [-51.9253, -14.235],
  US: [-95.7129, 37.0902],
  USA: [-95.7129, 37.0902],
  MX: [-102.5528, 23.6345],
  MEX: [-102.5528, 23.6345],
  CA: [-96.7969, 56.1304],
  CAN: [-96.7969, 56.1304],
  JP: [138.2529, 36.2048],
  JPN: [138.2529, 36.2048],
};

export const GlobeView = memo(function GlobeView({
  height,
  mindTab,
  userId,
  userCountry,
  onReady,
  onStadiumTap,
}: GlobeViewProps) {
  const token = useMemo(() => readExpoMapboxToken(), []);
  const configured = isMapboxPublicTokenConfigured(token);
  const html = useMemo(() => (configured ? buildMindGlobeHtml(token) : ''), [configured, token]);
  const webRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);

  const inject = useCallback((js: string) => {
    webRef.current?.injectJavaScript(js);
  }, []);

  useEffect(() => {
    onReady?.({ injectJavaScript: inject });
  }, [inject, onReady]);

  useEffect(() => {
    if (!mapReady) return;
    if (mindTab === 'nation') {
      inject(`try{window.__goalyaFlyToNation&&window.__goalyaFlyToNation(${JSON.stringify(userCountry)});}catch(_){};true;`);
    } else {
      inject(`try{window.__goalyaWorld&&window.__goalyaWorld();}catch(_){};true;`);
    }
  }, [mindTab, userCountry, mapReady, inject]);

  useEffect(() => {
    if (!mapReady) return;
    const unsub = subscribeToSupportersOnline((list: SupporterOnline[]) => {
      const payload = list.map((s) => ({
        lat: s.lat,
        lng: s.lng,
        flag: flagEmoji(s.country),
        name: s.name,
        rank: s.rank,
        country: s.country,
        isMe: s.userId === userId,
        muted: mindTab === 'nation' && s.country !== userCountry,
        count: '',
      }));
      inject(
        `try{window.__goalyaUpdateAvatars&&window.__goalyaUpdateAvatars(${JSON.stringify(payload)});}catch(_){};true;`
      );
      const heat = list.reduce<Record<string, { lng: number; lat: number; supporters: number }>>((acc, s) => {
        const key = s.country;
        const base = NATION_CENTROIDS[key] ?? [s.lng, s.lat];
        const cur = acc[key] ?? { lng: base[0], lat: base[1], supporters: 0 };
        cur.supporters += 1;
        acc[key] = cur;
        return acc;
      }, {});
      inject(
        `try{window.__goalyaUpdateHeat&&window.__goalyaUpdateHeat(${JSON.stringify(Object.values(heat))});}catch(_){};true;`
      );
    });
    return unsub;
  }, [mapReady, mindTab, userCountry, userId, inject]);

  useEffect(() => {
    if (!mapReady) return;
    const unsub = subscribeToLiveEvents((events) => {
      const latest = events[0];
      if (!latest) return;
      const emoji = latest.type === 'goal' ? '⚽' : latest.type === 'gift' ? '🎁' : '🔥';
      const country = latest.country ?? userCountry;
      inject(
        `try{window.__goalyaSpawnReaction&&window.__goalyaSpawnReaction(${JSON.stringify({ countryCode: country, emoji })});}catch(_){};true;`
      );
    });
    return unsub;
  }, [mapReady, userCountry, inject]);

  const onMessage = useCallback(
    (e: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(e.nativeEvent.data) as { type?: string; data?: { stadiumId?: string } };
        if (msg.type === 'MAP_READY') setMapReady(true);
        if (msg.type === 'STADIUM_TAP' && msg.data?.stadiumId) onStadiumTap?.(msg.data.stadiumId);
      } catch {
        /* ignore */
      }
    },
    [onStadiumTap]
  );

  if (!configured) {
    return (
      <View style={[styles.wrap, { height }]}>
        <HubGlobeFallback tab={mindTab === 'nation' ? 'nation' : 'monde'} userCountry={userCountry} supporters={[]} heatFeatures={[]} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        ref={webRef}
        style={StyleSheet.absoluteFill}
        containerStyle={styles.web}
        source={{ html }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        androidLayerType="hardware"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: '#050810', overflow: 'hidden' },
  web: { flex: 1, backgroundColor: '#050810' },
});
