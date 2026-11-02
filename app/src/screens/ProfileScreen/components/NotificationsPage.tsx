import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { PROFILE_V2 } from '../../../constants/profileV2Theme';
import type { NotificationPrefKey, NotificationPreferences } from '../../../types/notificationPreferences';
import { PROFILE_FONTS as F } from '../profileTypography';
import { PremiumToggle } from './PremiumToggle';

type IconTone = 'blue' | 'gold' | 'neutral';

type RowDef = {
  key: NotificationPrefKey;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone: IconTone;
  label: string;
  sub: string;
};

type Props = {
  slideX: SharedValue<number>;
  screenWidth: number;
  prefs: NotificationPreferences;
  onBack: () => void;
  onToggle: (key: NotificationPrefKey, value: boolean) => void;
};

function NotifRow({
  row,
  value,
  onToggle,
  isLast,
}: {
  row: RowDef;
  value: boolean;
  onToggle: (v: boolean) => void;
  isLast?: boolean;
}) {
  const tone = row.tone;
  const toneStyle =
    tone === 'gold'
      ? { bg: 'rgba(240,180,41,0.08)', border: 'rgba(240,180,41,0.12)' }
      : tone === 'neutral'
        ? { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)' }
        : { bg: 'rgba(41,121,255,0.1)', border: 'rgba(41,121,255,0.15)' };

  return (
    <View style={[styles.notifRow, !isLast && styles.notifRowBorder]}>
      <View style={[styles.iconMini, { backgroundColor: toneStyle.bg, borderColor: toneStyle.border }]}>
        <MaterialCommunityIcons name={row.icon} size={18} color={PROFILE_V2.text1} />
      </View>
      <View style={styles.notifText}>
        <Text style={styles.nrLabel}>{row.label}</Text>
        <Text style={styles.nrSub}>{row.sub}</Text>
      </View>
      <PremiumToggle value={value} onValueChange={onToggle} />
    </View>
  );
}

export const NotificationsPage = memo(function NotificationsPage({
  slideX,
  screenWidth,
  prefs,
  onBack,
  onToggle,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const LIVE_ROWS: RowDef[] = [
    { key: 'goalsLive', icon: 'soccer', tone: 'blue', label: t('notifications.goalsLive.label'), sub: t('notifications.goalsLive.sub') },
    { key: 'matchResults', icon: 'chart-bar', tone: 'blue', label: t('notifications.matchResults.label'), sub: t('notifications.matchResults.sub') },
    { key: 'cardsEvents', icon: 'card', tone: 'blue', label: t('notifications.cardsEvents.label'), sub: t('notifications.cardsEvents.sub') },
  ];
  const GAME_ROWS: RowDef[] = [
    { key: 'fantasyFootball', icon: 'flash', tone: 'gold', label: t('notifications.fantasyFootball.label'), sub: t('notifications.fantasyFootball.sub') },
    { key: 'bracketTable', icon: 'trophy', tone: 'gold', label: t('notifications.bracketTable.label'), sub: t('notifications.bracketTable.sub') },
    { key: 'pronos', icon: 'star-four-points', tone: 'gold', label: t('notifications.pronos.label'), sub: t('notifications.pronos.sub') },
    { key: 'arenaSimulator', icon: 'sword-cross', tone: 'gold', label: t('notifications.arenaSimulator.label'), sub: t('notifications.arenaSimulator.sub') },
  ];
  const COMMUNITY_ROWS: RowDef[] = [
    { key: 'globalHub', icon: 'earth', tone: 'neutral', label: t('notifications.globalHub.label'), sub: t('notifications.globalHub.sub') },
    { key: 'goalyaNews', icon: 'bullhorn-outline', tone: 'neutral', label: t('notifications.goalyaNews.label'), sub: t('notifications.goalyaNews.sub') },
  ];

  return (
    <Animated.View style={[styles.page, animStyle, { width: screenWidth }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.back} onPress={onBack} accessibilityLabel={t('common.back')}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={PROFILE_V2.text2} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{t('notifications.choose')}</Text>

        <Text style={styles.groupTitle}>{t('notifications.liveMatches')}</Text>
        <View style={styles.card}>
          {LIVE_ROWS.map((row, i) => (
            <NotifRow key={row.key} row={row} value={prefs[row.key]} onToggle={(v) => onToggle(row.key, v)} isLast={i === LIVE_ROWS.length - 1} />
          ))}
        </View>

        <Text style={styles.groupTitle}>{t('notifications.games')}</Text>
        <View style={styles.card}>
          {GAME_ROWS.map((row, i) => (
            <NotifRow key={row.key} row={row} value={prefs[row.key]} onToggle={(v) => onToggle(row.key, v)} isLast={i === GAME_ROWS.length - 1} />
          ))}
        </View>

        <Text style={styles.groupTitle}>{t('notifications.community')}</Text>
        <View style={styles.card}>
          {COMMUNITY_ROWS.map((row, i) => (
            <NotifRow key={row.key} row={row} value={prefs[row.key]} onToggle={(v) => onToggle(row.key, v)} isLast={i === COMMUNITY_ROWS.length - 1} />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  page: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PROFILE_V2.bg,
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_V2.border1,
    backgroundColor: 'rgba(41,121,255,0.04)',
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: PROFILE_V2.border2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: F.bebas,
    fontSize: 20,
    letterSpacing: 4,
    color: PROFILE_V2.text1,
  },
  headerSpacer: { width: 32 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  intro: {
    fontFamily: F.medium,
    fontSize: 12,
    color: PROFILE_V2.text3,
    lineHeight: 18,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 4,
  },
  groupTitle: {
    fontFamily: F.bold,
    fontSize: 14,
    color: PROFILE_V2.text1,
    letterSpacing: 0.5,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: PROFILE_V2.card,
    borderWidth: 1,
    borderColor: PROFILE_V2.border1,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 4,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  notifRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  iconMini: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: { flex: 1, minWidth: 0 },
  nrLabel: { fontFamily: F.bold, fontSize: 13, color: PROFILE_V2.text1 },
  nrSub: { fontFamily: F.medium, fontSize: 11, color: PROFILE_V2.text3, marginTop: 2 },
});
