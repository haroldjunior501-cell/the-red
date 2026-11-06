import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, UNITED_RED } from '../../../constants/colors';

type ClubNewsCardProps = {
  onPress: () => void;
  headline?: string | null;
  meta?: string | null;
  imageUrl?: string | null;
};

export const ClubNewsCard = memo(function ClubNewsCard({
  onPress,
  headline,
  meta,
  imageUrl,
}: ClubNewsCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Ouvrir les actualités du club"
    >
      <View style={styles.head}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="newspaper-variant-outline" size={18} color={UNITED_RED} />
          <Text style={styles.title}>ACTUS DU CLUB</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTx}>EN DIRECT</Text>
        </View>
      </View>
      <Text style={styles.lead}>{"L'actualité de Manchester United en français"}</Text>

      {headline ? (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>À LA UNE</Text>
          {imageUrl ? (
            <View style={styles.imageWrap}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
              <View style={styles.imageCaption}>
                <Text style={styles.previewTitleOnImg} numberOfLines={2}>
                  {headline}
                </Text>
                {meta ? (
                  <Text style={styles.previewMetaOnImg}>
                    {meta.includes(' · ') ? (
                      <>
                        <Text style={styles.metaCat}>{meta.split(' · ')[0]}</Text>
                        <Text style={styles.metaSep}>{'  ·  '}</Text>
                        <Text>{meta.split(' · ').slice(1).join(' · ')}</Text>
                      </>
                    ) : (
                      meta
                    )}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {headline}
              </Text>
              {meta ? <Text style={styles.previewMeta}>{meta}</Text> : null}
            </>
          )}
        </View>
      ) : (
        <Text style={styles.hint}>Officiel · Matchs · Mercato · Club · Médias</Text>
      )}

      <View style={styles.cta}>
        <Text style={styles.ctaTx}>Voir toutes les actus</Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color={UNITED_RED} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 0,
    backgroundColor: '#262626',
    padding: 12,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    color: COLORS.text,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(218,41,28,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: UNITED_RED },
  liveTx: { color: UNITED_RED, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  lead: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 10 },
  preview: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    padding: 0,
    marginBottom: 10,
    overflow: 'hidden',
  },
  previewLabel: {
    color: UNITED_RED,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  imageWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  image: { width: '100%', height: 168, resizeMode: 'cover' },
  imageCaption: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#262626',
  },
  previewTitleOnImg: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  previewMetaOnImg: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  metaCat: { color: UNITED_RED, fontWeight: '800' },
  metaSep: { color: 'rgba(255,255,255,0.35)' },
  previewTitle: { color: '#fff', fontSize: 14, fontWeight: '800', lineHeight: 19, paddingHorizontal: 2 },
  previewMeta: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 6, paddingHorizontal: 2 },
  hint: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 10 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2, paddingHorizontal: 2 },
  ctaTx: { color: UNITED_RED, fontSize: 12, fontWeight: '700' },
});
