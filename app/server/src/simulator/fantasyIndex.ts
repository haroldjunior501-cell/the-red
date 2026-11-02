import { getFirestore } from '../firebaseAdmin.js';
import { STARTING_SLOT_KEYS, fotmobPlayerImageUrl } from './constants.js';

export type FantasyRosterEntry = {
  userId: string;
  country: string;
  captainPlayerId: string | null;
  /** FotMob ids des titulaires */
  startingPlayerIds: Set<string>;
  playerNames: Map<string, string>;
};

export type FantasyIndex = {
  byPlayerId: Map<string, FantasyRosterEntry[]>;
  rosters: FantasyRosterEntry[];
};

function countStartingSlots(slots: Record<string, unknown> | undefined): number {
  if (!slots) return 0;
  let n = 0;
  for (const key of STARTING_SLOT_KEYS) {
    if (slots[key]) n += 1;
  }
  return n;
}

function rosterFromTeamDoc(
  userId: string,
  team: {
    slots?: Record<string, { id?: string; fotmobId?: number; name?: string } | null>;
    captainSlot?: string | null;
    country?: string;
  },
  countryFallback: string
): FantasyRosterEntry | null {
  const slots = team.slots ?? {};
  if (countStartingSlots(slots as Record<string, unknown>) < 11) return null;

  const startingPlayerIds = new Set<string>();
  const playerNames = new Map<string, string>();
  let captainPlayerId: string | null = null;
  const capSlot = team.captainSlot ?? null;

  for (const key of STARTING_SLOT_KEYS) {
    const p = slots[key];
    if (!p) continue;
    const id = String(p.fotmobId ?? p.id ?? '').trim();
    if (!id) continue;
    startingPlayerIds.add(id);
    playerNames.set(id, p.name ?? id);
    if (capSlot === key) captainPlayerId = id;
  }

  if (startingPlayerIds.size < 11) return null;

  return {
    userId,
    country: (team.country ?? countryFallback).slice(0, 3).toUpperCase(),
    captainPlayerId,
    startingPlayerIds,
    playerNames,
  };
}

export async function buildFantasyIndex(): Promise<FantasyIndex> {
  const fs = getFirestore();
  const byPlayerId = new Map<string, FantasyRosterEntry[]>();
  const rosters: FantasyRosterEntry[] = [];

  const teamSnap = await fs.collection('fantasy_teams').get();
  for (const doc of teamSnap.docs) {
    const data = doc.data() as {
      userId?: string;
      country?: string;
      players?: { id: string; name: string; isCaptain?: boolean }[];
      playerIds?: string[];
      slots?: Record<string, { id?: string; fotmobId?: number; name?: string } | null>;
      captainSlot?: string | null;
    };

    const userId = data.userId ?? doc.id;
    if (!userId || userId.startsWith('guest_')) continue;

    let roster: FantasyRosterEntry | null = null;

    if (data.slots) {
      roster = rosterFromTeamDoc(userId, data, data.country ?? 'FR');
    } else if (data.players?.length) {
      const slots: Record<string, { id: string; fotmobId?: number; name: string } | null> = {};
      const starters = data.players.slice(0, 11);
      STARTING_SLOT_KEYS.forEach((key, i) => {
        const p = starters[i];
        if (p) slots[key] = { id: p.id, name: p.name, fotmobId: Number(p.id) || undefined };
      });
      const cap = data.players.find((p) => p.isCaptain);
      roster = rosterFromTeamDoc(
        userId,
        {
          slots,
          captainSlot: cap
            ? STARTING_SLOT_KEYS[starters.findIndex((s) => s.id === cap.id)] ?? null
            : null,
          country: data.country,
        },
        data.country ?? 'FR'
      );
    }

    if (!roster) {
      const cloud = await fs.doc(`users/${userId}/fantasy/team`).get();
      if (cloud.exists) {
        roster = rosterFromTeamDoc(userId, cloud.data() as Record<string, unknown>, data.country ?? 'FR');
      }
    }

    if (!roster) continue;
    rosters.push(roster);
    for (const pid of roster.startingPlayerIds) {
      const list = byPlayerId.get(pid) ?? [];
      list.push(roster);
      byPlayerId.set(pid, list);
    }
  }

  return { byPlayerId, rosters };
}

export function photoForPlayer(fotmobId: string): string {
  return fotmobPlayerImageUrl(fotmobId);
}
