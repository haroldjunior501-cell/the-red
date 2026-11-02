/** Hauteur carte match + espacement vertical (alignement bracket). */
export const BRACKET_MATCH_H = 96;
export const BRACKET_GAP = 10;
export const BRACKET_CARD_WIDTH = 148;

/** Position Y du slot dans une colonne (8 → 4 → 2 → 1). */
export function bracketSlotTop(roundIndex: number, slotIndex: number): number {
  const unit = BRACKET_MATCH_H + BRACKET_GAP;
  if (roundIndex === 0) return slotIndex * unit;
  const span = unit * 2 ** roundIndex;
  return span / 2 + slotIndex * span - BRACKET_MATCH_H / 2;
}

/** Hauteur totale du bracket (colonne huitièmes). */
export function bracketTreeHeight(round0Count = 8): number {
  return round0Count * (BRACKET_MATCH_H + BRACKET_GAP) - BRACKET_GAP;
}

/** Hauteur du contenu bracket (scroll vertical interne). */
export function bracketContentHeight(round0Count = 8): number {
  return bracketTreeHeight(round0Count) + 200;
}
