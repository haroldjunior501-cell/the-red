import { fetchLiveMatches, isLivescoreConfigured } from '../simulator/livescoreClient.js';
import { getDatabase } from '../firebaseAdmin.js';
import { parseLiveMatchScoreRow, type LiveMatchScoreRow } from './matchRowScores.js';

type StoredScore = { home: number; away: number };

const POLL_MS = 60_000;

async function readStoredScore(matchId: string): Promise<StoredScore | null> {
  const snap = await getDatabase().ref(`liveMatches/scores/${matchId}`).get();
  const val = snap.val() as StoredScore | null;
  if (!val || typeof val.home !== 'number' || typeof val.away !== 'number') return null;
  return val;
}

async function writeStoredScore(matchId: string, score: StoredScore): Promise<void> {
  await getDatabase().ref(`liveMatches/scores/${matchId}`).set(score);
}

async function pushGoalEvent(match: LiveMatchScoreRow, scoringCountry: string): Promise<void> {
  const db = getDatabase();
  await db.ref('liveEvents/goals').push({
    matchId: match.matchId,
    scoringCountry,
    scorerName: 'BUT',
    minute: 0,
    timestamp: Date.now(),
  });
}

async function syncActiveMatches(matches: LiveMatchScoreRow[]): Promise<void> {
  const active: Record<string, { homeCountry: string; awayCountry: string; updatedAt: number }> = {};
  const now = Date.now();
  for (const m of matches) {
    active[m.matchId] = {
      homeCountry: m.homeCode,
      awayCountry: m.awayCode,
      updatedAt: now,
    };
  }
  await getDatabase().ref('liveMatches/active').set(active);
}

export async function runHubGoalDetection(): Promise<void> {
  if (!isLivescoreConfigured()) return;

  const rows = await fetchLiveMatches();
  const matches = rows
    .map((row) => parseLiveMatchScoreRow(row))
    .filter((m): m is LiveMatchScoreRow => m != null);

  await syncActiveMatches(matches);

  for (const match of matches) {
    const prev = await readStoredScore(match.matchId);
    const next: StoredScore = { home: match.homeScore, away: match.awayScore };

    if (!prev) {
      await writeStoredScore(match.matchId, next);
      continue;
    }

    if (next.home > prev.home) {
      await pushGoalEvent(match, match.homeCode);
    }
    if (next.away > prev.away) {
      await pushGoalEvent(match, match.awayCode);
    }

    if (next.home !== prev.home || next.away !== prev.away) {
      await writeStoredScore(match.matchId, next);
    }
  }
}

export function startHubGoalDetectionScheduler(): void {
  if (!isLivescoreConfigured()) {
    console.log('[GOALYA Hub] Détection buts désactivée — Live Score non configuré.');
    return;
  }

  const tick = () => {
    void runHubGoalDetection().catch((e) => {
      console.warn('[GOALYA Hub] detectGoals:', e instanceof Error ? e.message : e);
    });
  };

  tick();
  setInterval(tick, POLL_MS);
  console.log('[GOALYA Hub] Détection buts active (toutes les 60s).');
}
