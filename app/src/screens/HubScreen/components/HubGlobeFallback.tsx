import React, { memo, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { COUNTRIES } from '../../../constants/countries';
import { COUNTRY_GLOBE_VIEW } from '../../../data/countryGlobeCoordinates';
import type { HeatFeature } from '../../../hooks/useNationActivity';
import type { ActiveSupporter } from '../../../services/hubRtdbService';
import { filterHeatByNation, filterSupportersByNation } from '../../../utils/hubNationFilter';
import type { HubGlobeTab } from './GlobeTabs';

type Size = { w: number; h: number };

function project(lng: number, lat: number, size: Size): { x: number; y: number } {
  const padX = 18;
  const padY = 28;
  const x = padX + ((lng + 180) / 360) * (size.w - padX * 2);
  const y = padY + ((90 - lat) / 180) * (size.h - padY * 2);
  return { x, y };
}

export type HubGlobeFallbackProps = {
  tab: HubGlobeTab;
  userCountry: string;
  supporters: ActiveSupporter[];
  heatFeatures: HeatFeature[];
};

export const HubGlobeFallback = memo(function HubGlobeFallback({
  tab,
  userCountry,
  supporters,
  heatFeatures,
}: HubGlobeFallbackProps) {
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });
  const nationMode = tab === 'nation';

  const visibleSupporters = useMemo(
    () => (nationMode ? filterSupportersByNation(supporters, userCountry) : supporters),
    [nationMode, supporters, userCountry]
  );
  const visibleHeat = useMemo(
    () => (nationMode ? filterHeatByNation(heatFeatures, userCountry) : heatFeatures),
    [heatFeatures, nationMode, userCountry]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const focus = COUNTRY_GLOBE_VIEW[userCountry] ?? COUNTRY_GLOBE_VIEW.FR;

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <View style={styles.ocean} />
      {size.w > 0
        ? Object.entries(COUNTRY_GLOBE_VIEW).map(([code, view]) => {
            const { x, y } = project(view.lng, view.lat, size);
            const heat = visibleHeat.find((h) => (h.properties.country ?? '') === code);
            const intensity = heat?.properties.intensity ?? 0;
            const isUser = code === userCountry;
            const dim = nationMode && !isUser;
            const flag = COUNTRIES.find((c) => c.code === code)?.flag ?? '🏳️';
            const glow = 10 + intensity * 28;
            return (
              <View
                key={code}
                pointerEvents="none"
                style={[
                  styles.dotWrap,
                  {
                    left: x - glow / 2,
                    top: y - glow / 2,
                    width: glow,
                    height: glow,
                    opacity: dim ? 0.28 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.glow,
                    {
                      width: glow,
                      height: glow,
                      borderRadius: glow / 2,
                      backgroundColor: isUser ? 'rgba(90,142,196,0.35)' : 'rgba(90,142,196,0.12)',
                    },
                  ]}
                />
                <Text style={styles.flag}>{flag}</Text>
              </View>
            );
          })
        : null}
      {size.w > 0
        ? visibleSupporters.slice(0, 24).map((s) => {
            const { x, y } = project(s.lng, s.lat, size);
            return (
              <View
                key={s.id}
                pointerEvents="none"
                style={[styles.supporter, { left: x - 7, top: y - 7 }]}
              >
                <Text style={styles.supporterFlag}>{s.flag}</Text>
              </View>
            );
          })
        : null}
      <Text style={styles.caption}>
        {nationMode
          ? `Présence · ${focus?.name ?? userCountry}`
          : 'Planète supporters · 48 nations'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#070b14', overflow: 'hidden' },
  ocean: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a1424',
    opacity: 0.95,
  },
  dotWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  flag: { fontSize: 13, textAlign: 'center' },
  supporter: {
    position: 'absolute',
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supporterFlag: { fontSize: 10 },
  caption: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    color: 'rgba(228,233,242,0.45)',
    fontSize: 10,
    letterSpacing: 0.6,
    fontFamily: 'Inter_500Medium',
  },
});
