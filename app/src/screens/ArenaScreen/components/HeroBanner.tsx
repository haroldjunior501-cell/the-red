import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { ARENA_THEME as T } from '../../../constants/arenaTheme';
import type { HeroLineupPlayer } from '../../../utils/arenaHeroLineup';
import { HeroFormationBackdrop } from './HeroFormationBackdrop';

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  started: boolean;
};

type Props = {
  countdown: Countdown;
  lineup?: HeroLineupPlayer[];
};

function GridPattern({ width, height }: { width: number; height: number }) {
  const hLines = Array.from({ length: Math.ceil(height / 22) }, (_, i) => i);
  const vLines = Array.from({ length: Math.ceil(width / 22) }, (_, i) => i);
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {hLines.map((i) => (
        <Rect key={`h-${i}`} x={0} y={i * 22} width={width} height={1} fill="rgba(90,120,255,0.07)" />
      ))}
      {vLines.map((i) => (
        <Rect key={`v-${i}`} x={i * 22} y={0} width={1} height={height} fill="rgba(90,120,255,0.07)" />
      ))}
    </Svg>
  );
}

function Silhouettes({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} viewBox="0 0 360 200">
      <Path
        d="M40 180 Q50 120 70 100 Q90 80 75 60 Q60 40 55 20 L65 20 Q70 45 85 55 Q100 65 95 95 Q90 130 70 180 Z"
        fill="#7c3aed"
        opacity={0.09}
      />
      <Path
        d="M160 190 Q170 110 200 90 Q230 70 215 50 Q200 30 195 15 L208 15 Q215 40 235 55 Q255 70 250 105 Q245 140 220 190 Z"
        fill="#7c3aed"
        opacity={0.09}
      />
      <Path
        d="M280 185 Q290 115 310 95 Q330 75 318 55 Q305 35 300 18 L312 18 Q320 42 338 58 Q356 74 350 110 Q344 150 320 185 Z"
        fill="#7c3aed"
        opacity={0.09}
      />
    </Svg>
  );
}

export const HeroBanner = memo(function HeroBanner({ countdown, lineup }: Props) {
  const { width: screenW } = useWindowDimensions();
  const { t } = useTranslation();
  const bannerW = Math.max(screenW - 24, 280);
  const bannerH = 280;
  const hasLineup = lineup != null && lineup.length > 0;

  const blocks = [
    { v: countdown.days, l: t('arena.days') },
    { v: countdown.hours, l: t('arena.hours') },
    { v: countdown.minutes, l: t('arena.min') },
    { v: countdown.seconds, l: t('arena.sec') },
  ];

  return (
    <View style={[styles.wrap, { minHeight: bannerH }]}>
      <LinearGradient
        colors={['#0c0e28', '#080a20', '#0e0820']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {hasLineup ? (
        <HeroFormationBackdrop players={lineup!} width={bannerW} height={bannerH} />
      ) : (
        <>
          <GridPattern width={bannerW} height={bannerH} />
          <Silhouettes width={bannerW} height={bannerH} />
        </>
      )}
      {hasLineup ? <GridPattern width={bannerW} height={bannerH} /> : null}
      <View style={styles.content}>
        <Text style={styles.tag}>{t('arena.tag')}</Text>
        <Text style={styles.title}>{t('arena.title')}</Text>
        <Text style={styles.sub}>{t('arena.description')}</Text>
        {!countdown.started ? (
          <View>
            <Text style={styles.cdLbl}>{t('arena.worldCupIn')}</Text>
            <View style={styles.cdRow}>
              {blocks.map((b, i) => (
                <View key={b.l} style={styles.cdItem}>
                  <View style={styles.cdBlock}>
                    <Text style={styles.cdVal}>{String(b.v).padStart(2, '0')}</Text>
                    <Text style={styles.cdUnit}>{b.l}</Text>
                  </View>
                  {i < blocks.length - 1 ? <Text style={styles.cdSep}>:</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTxt}>{t('arena.liveSeason')}</Text>
          </View>
        )}
        <Pressable style={styles.rulesBtn}>
          <Ionicons name="information-circle-outline" size={14} color="#a78bfa" />
          <Text style={styles.rulesTxt}>{t('arena.rulesBtn')}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 4,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.border,
  },
  content: { padding: 16, zIndex: 2 },
  tag: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#a78bfa',
    fontFamily: 'Inter_700Bold',
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 34,
    letterSpacing: 2,
    color: '#f0ecff',
    marginTop: 4,
    textShadowColor: 'rgba(124, 58, 237, 0.5)',
    textShadowRadius: 12,
  },
  sub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: T.text2,
    marginTop: 6,
    marginBottom: 14,
  },
  cdLbl: {
    fontSize: 8,
    letterSpacing: 1,
    color: T.muted2,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  cdRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cdItem: { flexDirection: 'row', alignItems: 'center' },
  cdBlock: { alignItems: 'center', minWidth: 44 },
  cdVal: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 30,
    color: '#f0ecff',
  },
  cdUnit: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: T.muted2,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  cdSep: { fontSize: 22, color: 'rgba(255,255,255,0.12)', marginBottom: 14 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.35)',
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: T.live },
  liveTxt: { fontFamily: 'Inter_700Bold', fontSize: 9, color: T.live, letterSpacing: 1 },
  rulesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  rulesTxt: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#c4b5fd' },
});
