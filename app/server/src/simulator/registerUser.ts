import { getAuth, getFirestore } from '../firebaseAdmin.js';
import { STARTING_SLOT_KEYS, SIMULATOR_SEASON_ID } from './constants.js';
import { upsertRankingDoc } from './rankingStore.js';

function countSlots(slots: Record<string, unknown> | undefined): number {
  if (!slots) return 0;
  return STARTING_SLOT_KEYS.filter((k) => slots[k]).length;
}

export async function registerSimulatorPlayer(
  userId: string,
  opts?: { displayName?: string; country?: string }
): Promise<{ ok: boolean; teamComplete: boolean; reason?: string }> {
  if (!userId || userId.startsWith('guest_')) {
    return { ok: false, teamComplete: false, reason: 'invalid_user' };
  }

  const fs = getFirestore();
  const teamSnap = await fs.doc(`users/${userId}/fantasy/team`).get();
  let displayName = opts?.displayName?.trim() || 'Joueur';
  let country = (opts?.country ?? 'FR').slice(0, 3).toUpperCase();
  let captainId = '';
  let teamComplete = false;

  const userSnap = await fs.doc(`users/${userId}`).get();
  if (userSnap.exists) {
    const u = userSnap.data() as { name?: string; displayName?: string; country?: string; countryCode?: string };
    displayName = opts?.displayName ?? u.displayName ?? u.name ?? displayName;
    country = (opts?.country ?? u.countryCode ?? u.country ?? country).slice(0, 3).toUpperCase();
  } else {
    try {
      const authUser = await getAuth().getUser(userId);
      displayName = opts?.displayName ?? authUser.displayName ?? displayName;
    } catch {
      /* ignore */
    }
  }

  if (teamSnap.exists) {
    const team = teamSnap.data() as {
      slots?: Record<string, { id?: string; fotmobId?: number; name?: string } | null>;
      captainSlot?: string | null;
    };
    teamComplete = countSlots(team.slots as Record<string, unknown>) >= 11;
    const capSlot = team.captainSlot;
    if (capSlot && team.slots?.[capSlot]) {
      const cap = team.slots[capSlot]!;
      captainId = String(cap.fotmobId ?? cap.id ?? '');
    }
  } else {
    const legacy = await fs.doc(`fantasy_teams/${userId}`).get();
    if (legacy.exists) {
      const data = legacy.data() as { playerIds?: string[]; players?: { id: string; isCaptain?: boolean }[] };
      teamComplete = (data.playerIds?.length ?? 0) >= 11;
      const cap = data.players?.find((p) => p.isCaptain);
      captainId = cap?.id ?? '';
    }
  }

  await upsertRankingDoc(userId, {
    userId,
    displayName,
    country,
    profilePhotoUrl: null,
    captainId,
    captainCountry: country,
    teamComplete,
    totalPoints: 0,
    weeklyPoints: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    rank: 0,
    recentOpponentIds: [],
  });

  return { ok: true, teamComplete };
}
