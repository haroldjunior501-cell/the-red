import React, { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildHubGlobeHtml } from '../../../services/mapWebHtml';
import type { ActiveSupporter } from '../../../services/hubRtdbService';
import type { HeatFeature } from '../../../hooks/useNationActivity';
import { filterHeatByNation, filterSupportersByNation } from '../../../utils/hubNationFilter';
import { isMapboxPublicTokenConfigured, readExpoMapboxToken } from '../../../utils/mapboxEnv';
import type { HubGlobeTab } from './GlobeTabs';
import { HubGlobeFallback } from './HubGlobeFallback';

export type HubGlobeHandle = {
  postToMap: (payload: Record<string, unknown>) => void;
};

export type HubGlobeViewProps = {
  tab: HubGlobeTab;
  userCountry: string;
  supporters: ActiveSupporter[];
  heatFeatures: HeatFeature[];
  mapRef?: React.Ref<HubGlobeHandle>;
  onNationFlyComplete?: (countryCode: string) => void;
};

export const HubGlobeView = memo(function HubGlobeView({
  tab,
  userCountry,
  supporters,
  heatFeatures,
  mapRef,
  onNationFlyComplete,
}: HubGlobeViewProps) {
  const nationMode = tab === 'nation';
  const visibleSupporters = useMemo(
    () => (nationMode ? filterSupportersByNation(supporters, userCountry) : supporters),
    [nationMode, supporters, userCountry]
  );
  const visibleHeat = useMemo(
    () => (nationMode ? filterHeatByNation(heatFeatures, userCountry) : heatFeatures),
    [heatFeatures, nationMode, userCountry]
  );
  const token = useMemo(() => readExpoMapboxToken(), []);
  const configured = isMapboxPublicTokenConfigured(token);
  const html = useMemo(() => (configured ? buildHubGlobeHtml(token) : ''), [configured, token]);
  const webRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const pendingMessages = useRef<Record<string, unknown>[]>([]);

  /**
   * Utilise injectJavaScript plutôt que postMessage pour une fiabilité maximale
   * sur Android (les WebViews Android interceptent parfois postMessage).
   */
  const postToMap = useCallback(
    (payload: Record<string, unknown>) => {
      if (!mapReady) {
        pendingMessages.current.push(payload);
        return;
      }
      const safePayload = JSON.stringify(JSON.stringify(payload));
      webRef.current?.injectJavaScript(
        `(function(){try{` +
          `var e=new MessageEvent('message',{data:${safePayload}});` +
          `window.dispatchEvent(e);document.dispatchEvent(e);` +
          `}catch(_){}})();true;`
      );
    },
    [mapReady]
  );

  // Drain la file d'attente dès que la carte est prête
  useEffect(() => {
    if (!mapReady || pendingMessages.current.length === 0) return;
    const queued = [...pendingMessages.current];
    pendingMessages.current = [];
    queued.forEach((payload) => postToMap(payload));
  }, [mapReady, postToMap]);

  useImperativeHandle(mapRef, () => ({ postToMap }), [postToMap]);

  useEffect(() => {
    if (!mapReady) return;
    postToMap({
      type: 'UPDATE_AVATARS',
      supporters: visibleSupporters.map((s) => ({
        id: s.id,
        lat: s.lat,
        lng: s.lng,
        flag: s.flag,
        country: s.country,
        username: s.username,
        color: s.countryColor,
      })),
    });
  }, [mapReady, postToMap, visibleSupporters]);

  useEffect(() => {
    if (!mapReady) return;
    postToMap({
      type: 'UPDATE_HEATMAP',
      geojson: { type: 'FeatureCollection', features: visibleHeat },
    });
  }, [mapReady, postToMap, visibleHeat]);

  useEffect(() => {
    if (!mapReady) return;
    postToMap({
      type: 'SET_NATION_MODE',
      active: nationMode,
      country: userCountry,
    });
    postToMap({ type: nationMode ? 'FLY_NATION' : 'FLY_WORLD', country: userCountry });
  }, [mapReady, nationMode, postToMap, userCountry]);

  const onMessage = useCallback(
    (e: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(e.nativeEvent.data) as { type?: string; data?: { country?: string } };
        if (msg.type === 'MAP_READY') setMapReady(true);
        if (msg.type === 'NATION_FLY_COMPLETE' && msg.data?.country) {
          onNationFlyComplete?.(msg.data.country);
        }
      } catch {
        /* ignore */
      }
    },
    [onNationFlyComplete]
  );

  if (!configured) {
    return (
      <HubGlobeFallback
        tab={tab}
        userCountry={userCountry}
        supporters={supporters}
        heatFeatures={heatFeatures}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <WebView
        ref={webRef}
        style={StyleSheet.absoluteFill}
        containerStyle={styles.web}
        source={{ html }}
        onMessage={onMessage}
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

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0A0E1A', overflow: 'hidden' },
  web: { flex: 1, backgroundColor: '#0A0E1A' },
});
