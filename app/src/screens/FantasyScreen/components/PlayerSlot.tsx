import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { EmptySlotCard } from '../../../components/fantasy/EmptySlotCard';
import { PlayerCard } from '../../../components/fantasy/PlayerCard';
import { FANTASY_THEME as T } from '../../../constants/fantasyTheme';
import type { FantasyPitchPlayer } from '../../../types/fantasy.types';
import { getPlayerPhoto } from '../../../utils/playerPhoto';

export type PlayerSlotProps = {
  player: FantasyPitchPlayer | null;
  positionLabel: string;
  emptyLabel: string;
  isCaptain: boolean;
  captainPickMode?: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

export const PlayerSlot = memo(function PlayerSlot({
  player,
  positionLabel,
  emptyLabel,
  isCaptain,
  captainPickMode,
  onPress,
  onLongPress,
}: PlayerSlotProps) {
  if (!player) {
    return (
      <EmptySlotCard label={emptyLabel} positionLabel={positionLabel} onPress={onPress} />
    );
  }

  return (
    <PlayerCard
      name={player.shortName}
      pts={player.pts}
      photo={getPlayerPhoto(player)}
      positionLabel={positionLabel}
      size="pitch"
      isCaptain={isCaptain}
      onPress={onPress}
      onLongPress={onLongPress}
      style={captainPickMode && !isCaptain ? styles.pickHint : undefined}
    />
  );
});

const styles = StyleSheet.create({
  pickHint: {
    borderColor: T.gold,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
});
