import { fotmobPlayerImageUrl } from '../constants/fotmob';
import type { FantasyPitchPlayer } from '../types/fantasy.types';

export function getPlayerPhoto(player: FantasyPitchPlayer): string {
  if (player.photo) return player.photo;
  const id = player.fotmobId ?? Number(player.id);
  if (Number.isFinite(id) && id > 0) return fotmobPlayerImageUrl(id);
  return '';
}
