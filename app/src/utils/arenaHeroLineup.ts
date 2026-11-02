import { FORMATION_433_SLOTS } from '../constants/fantasyFormation';
import { ALL_SLOT_KEYS } from '../constants/fantasyPitch';
import { fotmobPlayerImageUrl } from '../constants/fotmob';
import type { FantasyPitchPlayer, FantasySlotKey } from '../types/fantasy.types';

export type HeroLineupPlayer = {
  slotKey: FantasySlotKey;
  photo: string;
  name: string;
  isCaptain: boolean;
  /** Position % dans le hero (0–100). */
  x: number;
  y: number;
};

const SLOT_TO_PITCH: Record<FantasySlotKey, (typeof FORMATION_433_SLOTS)[number]['id']> = {
  GK_0: 'GK',
  DEF_0: 'DEF1',
  DEF_1: 'DEF2',
  DEF_2: 'DEF3',
  DEF_3: 'DEF4',
  MID_0: 'MID1',
  MID_1: 'MID2',
  MID_2: 'MID3',
  ATT_0: 'ATT1',
  ATT_1: 'ATT2',
  ATT_2: 'ATT3',
};

const PITCH_BY_ID = Object.fromEntries(FORMATION_433_SLOTS.map((s) => [s.id, s])) as Record<
  string,
  (typeof FORMATION_433_SLOTS)[number]
>;

const FALLBACK_IDS = [466439, 701154, 292462, 155997, 8198, 914458, 466439, 701154, 292462, 155997, 8198];

export function buildHeroLineupFromTeam(
  slots: Record<FantasySlotKey, FantasyPitchPlayer | null> | undefined,
  captainSlot: FantasySlotKey | null | undefined
): HeroLineupPlayer[] {
  const lineup: HeroLineupPlayer[] = [];
  let fi = 0;

  for (const slotKey of ALL_SLOT_KEYS) {
    const pitchId = SLOT_TO_PITCH[slotKey];
    const def = PITCH_BY_ID[pitchId];
    if (!def) continue;

    const p = slots?.[slotKey];
    const fotmobId = p?.fotmobId ?? Number(p?.id) ?? FALLBACK_IDS[fi % FALLBACK_IDS.length];
    const photo = p?.photo || fotmobPlayerImageUrl(fotmobId);

    lineup.push({
      slotKey,
      photo,
      name: p?.name ?? '',
      isCaptain: captainSlot === slotKey,
      x: def.x,
      y: def.y,
    });
    fi += 1;
  }

  return lineup;
}
