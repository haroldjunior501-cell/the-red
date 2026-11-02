import { FieldValue } from 'firebase-admin/firestore';
import { getDatabase, getFirestore } from '../firebaseAdmin.js';
import {
  SIMULATOR_MATCHDAY_ID,
  SIMULATOR_SEASON_ID,
  fotmobPlayerImageUrl,
} from './constants.js';

export type RankingDoc = {
  userId: string;
  displayName: string;
  name?: string;
  country: string;
  profilePhotoUrl: string | null;
  totalPoints: number;
  weeklyPoints: number;
  wins: number;
  losses: number;
  draws: number;
  rank: number;
  rankDelta?: 'up' | 'down' | 'stable';
  captainId: string;
  captainCountry: string;
  teamComplete: boolean;
  recentOpponentIds: string[];
  lastMatchdayId?: string;
  updatedAt: number;
};

export type SimulatorLiveEvent = {
  id: string;
  minute: number;
  playerId: string;
  playerName: string;
  photo: string;
  type: string;
  points: number;
  isCaptain?: boolean;
  isUserTeam?: boolean;
};

function rankingsCollection() {
  return getFirestore().collection('simulator').doc(SIMULATOR_SEASON_ID).collection('rankings');
}

function rtdbBase() {
  return `simulator/${SIMULATOR_SEASON_ID}`;
}

export async function upsertRankingDoc(
  userId: string,
  partial: Partial<RankingDoc> & Pick<RankingDoc, 'displayName' | 'country'>
): Promise<void> {
  const ref = rankingsCollection().doc(userId);
  const snap = await ref.get();
  const now = Date.now();
  const base: RankingDoc = {
    userId,
    displayName: partial.displayName,
    country: partial.country.slice(0, 3).toUpperCase(),
    profilePhotoUrl: partial.profilePhotoUrl ?? null,
    totalPoints: partial.totalPoints ?? 0,
    weeklyPoints: partial.weeklyPoints ?? 0,
    wins: partial.wins ?? 0,
    losses: partial.losses ?? 0,
    draws: partial.draws ?? 0,
    rank: partial.rank ?? 0,
    captainId: partial.captainId ?? '',
    captainCountry: partial.captainCountry ?? partial.country,
    teamComplete: partial.teamComplete ?? false,
    recentOpponentIds: partial.recentOpponentIds ?? [],
    updatedAt: now,
  };

  if (snap.exists) {
    await ref.set(
      {
        ...base,
        totalPoints: partial.totalPoints ?? snap.data()?.totalPoints ?? 0,
        weeklyPoints: partial.weeklyPoints ?? snap.data()?.weeklyPoints ?? 0,
        wins: partial.wins ?? snap.data()?.wins ?? 0,
        losses: partial.losses ?? snap.data()?.losses ?? 0,
        draws: partial.draws ?? snap.data()?.draws ?? 0,
        recentOpponentIds: partial.recentOpponentIds ?? snap.data()?.recentOpponentIds ?? [],
        teamComplete: partial.teamComplete ?? snap.data()?.teamComplete ?? false,
        updatedAt: now,
      },
      { merge: true }
    );
  } else {
    await ref.set(base);
  }

  const db = getDatabase();
  await db.ref(`${rtdbBase()}/rankings/${userId}`).update({
    totalPoints: base.totalPoints,
    weeklyPoints: base.weeklyPoints,
    rank: base.rank,
    dayGain: 0,
    leaderPoints: 0,
    leaderName: '—',
    gapToLeader: 0,
  });
}

export async function fetchAllRankingDocs(): Promise<RankingDoc[]> {
  const snap = await rankingsCollection().get();
  return snap.docs.map((d) => ({ ...(d.data() as RankingDoc), userId: d.data().userId ?? d.id }));
}

export async function refreshGlobalRanks(): Promise<void> {
  const docs = await fetchAllRankingDocs();
  const sorted = [...docs].sort((a, b) => b.totalPoints - a.totalPoints || a.userId.localeCompare(b.userId));
  const leader = sorted[0];
  const db = getDatabase();
  const batch = getFirestore().batch();

  for (let i = 0; i < sorted.length; i += 1) {
    const u = sorted[i];
    const rank = i + 1;
    const prevRank = u.rank;
    let rankDelta: RankingDoc['rankDelta'] = 'stable';
    if (prevRank > 0) {
      if (rank < prevRank) rankDelta = 'up';
      else if (rank > prevRank) rankDelta = 'down';
    }
    batch.update(rankingsCollection().doc(u.userId), { rank, rankDelta, updatedAt: Date.now() });

    const gapToLeader = leader ? Math.max(leader.totalPoints - u.totalPoints + 1, 1) : 0;
    await db.ref(`${rtdbBase()}/rankings/${u.userId}`).update({
      rank,
      totalPoints: u.totalPoints,
      weeklyPoints: u.weeklyPoints,
      leaderPoints: leader?.totalPoints ?? 0,
      leaderName: leader?.displayName ?? '—',
      gapToLeader: leader && leader.userId === u.userId ? 0 : gapToLeader,
    });
  }

  await batch.commit();
}

export async function applyLiveEventToUser(
  userId: string,
  event: SimulatorLiveEvent,
  pointsDelta: number
): Promise<void> {
  const db = getDatabase();
  const eventRef = db.ref(
    `${rtdbBase()}/matchday/${SIMULATOR_MATCHDAY_ID}/team/${userId}/events/${event.id}`
  );
  const existing = await eventRef.get();
  if (existing.exists()) return;

  await eventRef.set({ ...event, isUserTeam: true });

  const rankingRef = db.ref(`${rtdbBase()}/rankings/${userId}`);
  const matchRef = db.ref(`${rtdbBase()}/rankings/${userId}/currentMatch`);

  await rankingRef.transaction((current) => {
    const cur = (current ?? {}) as Record<string, number>;
    return {
      ...cur,
      dayGain: (cur.dayGain ?? 0) + pointsDelta,
      totalPoints: (cur.totalPoints ?? 0) + pointsDelta,
    };
  });

  await matchRef.transaction((current) => {
    const cur = (current ?? {}) as Record<string, number>;
    return { ...cur, userScore: (cur.userScore ?? 0) + pointsDelta };
  });

  const fsRef = rankingsCollection().doc(userId);
  await fsRef.update({
    totalPoints: FieldValue.increment(pointsDelta),
    weeklyPoints: FieldValue.increment(pointsDelta),
    updatedAt: Date.now(),
  });
}

export async function markEventProcessed(eventKey: string): Promise<boolean> {
  const ref = getDatabase().ref(`${rtdbBase()}/processedEvents/${eventKey}`);
  const snap = await ref.get();
  if (snap.exists()) return false;
  await ref.set({ at: Date.now() });
  return true;
}

export async function writeCurrentMatch(
  userId: string,
  payload: Record<string, string | number | boolean>
): Promise<void> {
  await getDatabase().ref(`${rtdbBase()}/rankings/${userId}/currentMatch`).set(payload);
}

export async function appendHistoryEntry(
  userId: string,
  entryId: string,
  entry: Record<string, unknown>
): Promise<void> {
  await getDatabase().ref(`${rtdbBase()}/rankings/${userId}/history/${entryId}`).set(entry);
}

export async function clearMatchdayEvents(): Promise<void> {
  await getDatabase().ref(`${rtdbBase()}/matchday/${SIMULATOR_MATCHDAY_ID}/team`).remove();
  await getDatabase().ref(`${rtdbBase()}/processedEvents`).remove();
}

export async function readMeta(): Promise<{ dayKey: string } | null> {
  const snap = await getDatabase().ref(`${rtdbBase()}/meta`).get();
  return snap.val() as { dayKey: string } | null;
}

export async function writeMeta(dayKey: string): Promise<void> {
  await getDatabase().ref(`${rtdbBase()}/meta`).set({ dayKey, updatedAt: Date.now() });
}

export function buildLiveEvent(params: {
  id: string;
  minute: number;
  fotmobId: string;
  playerName: string;
  type: string;
  points: number;
  isCaptain: boolean;
}): SimulatorLiveEvent {
  return {
    id: params.id,
    minute: params.minute,
    playerId: params.fotmobId,
    playerName: params.playerName,
    photo: fotmobPlayerImageUrl(params.fotmobId),
    type: params.isCaptain && params.type === 'goal' ? 'captain_goal' : params.type,
    points: params.points,
    isCaptain: params.isCaptain,
    isUserTeam: true,
  };
}
