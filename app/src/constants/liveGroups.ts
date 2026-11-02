/** IDs groupes CDM 2026 (Live Score API). */
export const WC_GROUP_IDS: Record<string, string> = {
  A: '4286',
  B: '4287',
  C: '4288',
  D: '4289',
  E: '4290',
  F: '4291',
  G: '4292',
  H: '4293',
  I: '4297',
  J: '4296',
  K: '4295',
  L: '4294',
};

export function groupIdFromLetter(letter: string): string | undefined {
  return WC_GROUP_IDS[letter.trim().toUpperCase()];
}

export function groupLetterFromName(name: string): string {
  const m = name.match(/group\s*([a-l])/i);
  if (m?.[1]) return m[1].toUpperCase();
  const mFr = name.match(/groupe\s*([a-l])/i);
  if (mFr?.[1]) return mFr[1].toUpperCase();
  const single = name.trim().toUpperCase();
  if (single.length === 1 && WC_GROUP_IDS[single]) return single;
  return 'A';
}

/** Libellés + IDs API pour les 12 groupes CDM 2026. */
export const WC_GROUP_ENTRIES = [
  { name: 'Groupe A', id: '4286', letter: 'A' },
  { name: 'Groupe B', id: '4287', letter: 'B' },
  { name: 'Groupe C', id: '4288', letter: 'C' },
  { name: 'Groupe D', id: '4289', letter: 'D' },
  { name: 'Groupe E', id: '4290', letter: 'E' },
  { name: 'Groupe F', id: '4291', letter: 'F' },
  { name: 'Groupe G', id: '4292', letter: 'G' },
  { name: 'Groupe H', id: '4293', letter: 'H' },
  { name: 'Groupe I', id: '4297', letter: 'I' },
  { name: 'Groupe J', id: '4296', letter: 'J' },
  { name: 'Groupe K', id: '4295', letter: 'K' },
  { name: 'Groupe L', id: '4294', letter: 'L' },
] as const;
