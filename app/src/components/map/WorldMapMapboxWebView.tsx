import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { SupporterOnline } from '../../services/mapService';
import type { WorldMapProps } from './worldMapTypes';

const CONTINENTS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { region: 'europe' },
      geometry: { type: 'Polygon', coordinates: [[[-25, 35], [40, 35], [40, 72], [-25, 72], [-25, 35]]] },
    },
    {
      type: 'Feature',
      properties: { region: 'asia' },
      geometry: { type: 'Polygon', coordinates: [[[38, -12], [180, -12], [180, 78], [38, 78], [38, -12]]] },
    },
    {
      type: 'Feature',
      properties: { region: 'africa' },
      geometry: { type: 'Polygon', coordinates: [[[-20, -37], [52, -37], [52, 38], [-20, 38], [-20, -37]]] },
    },
    {
      type: 'Feature',
      properties: { region: 'southAmerica' },
      geometry: { type: 'Polygon', coordinates: [[[-85, -56], [-33, -56], [-33, 16], [-85, 16], [-85, -56]]] },
    },
  ],
};

const REGION_COLOR: Record<string, string> = {
  europe: 'rgba(41, 121, 255, 0.35)',
  asia: 'rgba(255,59,48,0.3)',
  africa: 'rgba(255,215,0,0.25)',
  southAmerica: 'rgba(139,92,246,0.3)',
};

function buildHtml(mapboxToken: string): string {
  const continentsJson = JSON.stringify(CONTINENTS);
  const colorsJson = JSON.stringify(REGION_COLOR);
  const tokenJson = JSON.stringify(mapboxToken);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css" rel="stylesheet" />
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0b111c; }
    .goalya-pin {
      min-width: 36px; min-height: 36px; border-radius: 999px; display: flex; align-items: center; justify-content: center;
      font-size: 18px; cursor: pointer; border: 2px solid rgba(255,255,255,0.35); background: rgba(12,28,14,0.92);
      box-shadow: 0 2px 10px rgba(0,0,0,0.45);
    }
    .goalya-pin.me { border-color: #2979ff; box-shadow: 0 0 14px rgba(41, 121, 255, 0.45); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js"></script>
  <script>
    (function () {
      var CONTINENTS = ${continentsJson};
      var REGION_COLOR = ${colorsJson};
      mapboxgl.accessToken = ${tokenJson};
      var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 1.2,
        attributionControl: true
      });
      window.__goalyaFlyTo = function (tier) {
        if (!map) return;
        var presets = [
          { center: [0, 20], zoom: 1.15 },
          { center: [10, 50], zoom: 3.35 },
          { center: [2.3522, 48.8566], zoom: 8 }
        ];
        var t = Math.max(0, Math.min(2, parseInt(tier, 10) || 0));
        var p = presets[t];
        try {
          map.flyTo({ center: p.center, zoom: p.zoom, duration: 1300, essential: true, pitch: 0 });
        } catch (e) {}
      };
      var markers = [];
      function post(type, payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
        }
      }
      function clearMarkers() {
        markers.forEach(function (m) { m.remove(); });
        markers = [];
      }
      window.__goalyaUpdate = function (data) {
        clearMarkers();
        (data.markers || []).forEach(function (m) {
          var el = document.createElement('div');
          el.className = 'goalya-pin' + (m.isMe ? ' me' : '');
          el.textContent = m.label || '·';
          el.setAttribute('title', m.name || '');
          el.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!m.isMe) post('supporter', { userId: m.userId, name: m.name, country: m.country, lat: m.lat, lng: m.lng, rank: m.rank });
          });
          var mk = new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([m.lng, m.lat]).addTo(map);
          markers.push(mk);
        });
      };
      map.on('load', function () {
        map.addSource('goalya-continents', { type: 'geojson', data: CONTINENTS });
        ['europe', 'asia', 'africa', 'southAmerica'].forEach(function (region) {
          map.addLayer({
            id: 'goalya-fill-' + region,
            type: 'fill',
            source: 'goalya-continents',
            filter: ['==', ['get', 'region'], region],
            paint: { 'fill-color': REGION_COLOR[region] }
          });
        });
        post('ready', {});
      });
      window.addEventListener('resize', function () { map.resize(); });
      setTimeout(function () { map.resize(); }, 400);
    })();
  </script>
</body>
</html>`;
}

export const WorldMapMapboxWebView = memo(function WorldMapMapboxWebView({
  width,
  height,
  zoomTier = 0,
  supportersOnline = [],
  meSupporter,
  onSupporterPress,
  meDisplayName,
  flagForCountry = () => '·',
}: WorldMapProps) {
  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';
  const webRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(false);
  }, [token]);

  const injectFlyTo = useCallback((tier: 0 | 1 | 2) => {
    webRef.current?.injectJavaScript(`try{window.__goalyaFlyTo&&window.__goalyaFlyTo(${tier});}catch(_){};true;`);
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    injectFlyTo(zoomTier);
  }, [mapReady, zoomTier, injectFlyTo]);

  const markers = useMemo(() => {
    const byId = new Map<string, SupporterOnline>();
    for (const s of supportersOnline) {
      byId.set(s.userId, s);
    }
    if (meSupporter) {
      byId.set(meSupporter.userId, meSupporter);
    }
    return Array.from(byId.values()).map((s) => {
      const isMe = meSupporter != null && s.userId === meSupporter.userId;
      const display = isMe && meDisplayName ? meDisplayName : s.name;
      return {
        userId: s.userId,
        name: display,
        country: s.country,
        lat: s.lat,
        lng: s.lng,
        rank: s.rank,
        isMe,
        label: flagForCountry(s.country) || '·',
      };
    });
  }, [supportersOnline, meSupporter, meDisplayName, flagForCountry]);

  const injectUpdate = useCallback(() => {
    const enc = encodeURIComponent(JSON.stringify({ markers }));
    const js = `try{window.__goalyaUpdate(JSON.parse(decodeURIComponent("${enc}")));}catch(e){};true;`;
    webRef.current?.injectJavaScript(js);
  }, [markers]);

  useEffect(() => {
    const t = setTimeout(injectUpdate, 600);
    return () => clearTimeout(t);
  }, [injectUpdate]);

  const onMessage = useCallback(
    (e: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(e.nativeEvent.data) as { type?: string; payload?: unknown };
        if (msg.type === 'ready') {
          setMapReady(true);
        }
        if (msg.type === 'supporter' && onSupporterPress && msg.payload) {
          onSupporterPress(msg.payload as SupporterOnline);
        }
      } catch {
        /* ignore */
      }
    },
    [onSupporterPress]
  );

  if (!token) {
    return (
      <View style={[styles.wrap, styles.errBox, { width, height }]}>
        <Text style={styles.err}>La carte n&apos;est pas disponible sur cet appareil.</Text>
      </View>
    );
  }

  const html = useMemo(() => buildHtml(token), [token]);

  return (
    <View style={[styles.wrap, { width, height }]}>
      <WebView
        ref={webRef}
        style={StyleSheet.absoluteFill}
        source={{ html }}
        onMessage={onMessage}
        onLoadEnd={injectUpdate}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        androidLayerType="hardware"
        scrollEnabled={false}
        nestedScrollEnabled={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#0b111c', overflow: 'hidden' },
  errBox: { justifyContent: 'center', alignItems: 'center' },
  err: { textAlign: 'center', color: '#8896ab', padding: 16, fontSize: 12 },
});
