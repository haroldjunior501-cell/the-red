import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlayerCard } from '../../../components/fantasy/PlayerCard';
import { BENCH_SIZE } from '../../../constants/fantasyPitch';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';
import type { FantasyPitchPlayer } from '../../../types/fantasy.types';
import { getPlayerPhoto } from '../../../utils/playerPhoto';

export type SubstitutesCarouselProps = {
  bench: (FantasyPitchPlayer | null)[];
  benchCount: number;
  onTransfers: () => void;
  onBenchPress: (index: number) => void;
  onBenchLongPress?: (index: number) => void;
};

function benchPosLabel(p: FantasyPitchPlayer | null, index: number): string {
  if (!p) return '+';
  if (p.position === 'MID') return 'MIL';
  return p.position;
}

export const SubstitutesCarousel = memo(function SubstitutesCarousel({
  bench,
  benchCount,
  onTransfers,
  onBenchPress,
  onBenchLongPress,
}: SubstitutesCarouselProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>REMPLAÇANTS</Text>
        <Text style={styles.count}>
          {benchCount}/{BENCH_SIZE} · appui long = retirer
        </Text>
      </View>
      <View style={styles.row}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          decelerationRate="fast"
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}
        >
          {bench.map((p, i) =>
            p ? (
              <PlayerCard
                key={`${p.id}-${i}`}
                name={p.shortName}
                pts={p.pts}
                photo={getPlayerPhoto(p)}
                positionLabel={benchPosLabel(p, i)}
                size="bench"
                onPress={() => onBenchPress(i)}
                onLongPress={onBenchLongPress ? () => onBenchLongPress(i) : undefined}
              />
            ) : (
              <Pressable
                key={`empty-${i}`}
                style={styles.emptyBench}
                onPress={() => onBenchPress(i)}
              >
                <Text style={styles.emptyPlus}>+</Text>
                <Text style={styles.emptyLbl}>Ajouter</Text>
              </Pressable>
            )
          )}
        </ScrollView>
        <Pressable style={styles.transferCard} onPress={onTransfers}>
          <Text style={styles.transferIcon}>⇆</Text>
          <Text style={styles.transferLbl}>TRANSFERTS</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 9,
    letterSpacing: 2,
    color: T.muted2,
    fontFamily: 'Inter_700Bold',
  },
  count: {
    fontSize: 10,
    color: T.blue2,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  scrollView: { flex: 1, maxHeight: 88 },
  scroll: { gap: 8, paddingRight: 8, alignItems: 'center' },
  emptyBench: {
    width: 56,
    height: 82,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(41,121,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(41,121,255,0.06)',
    gap: 4,
  },
  emptyPlus: { fontSize: 20, color: T.blue2 },
  emptyLbl: {
    fontSize: 8,
    fontFamily: 'Inter_600SemiBold',
    color: T.muted2,
    textTransform: 'uppercase',
  },
  transferCard: {
    width: 72,
    height: 82,
    borderRadius: 12,
    backgroundColor: 'rgba(12, 20, 40, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(41, 121, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: T.glowBlue,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  transferIcon: { fontSize: 22, color: T.blue2 },
  transferLbl: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: T.muted2,
    letterSpacing: 0.8,
  },
});
