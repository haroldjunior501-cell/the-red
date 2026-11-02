import { utcDayKey } from './constants.js';
import { pollSimulatorLiveScores } from './liveEngine.js';
import { runDailySimulatorMatchmaking } from './matchdayJob.js';
import { readMeta } from './rankingStore.js';

let pollTimer: ReturnType<typeof setInterval> | null = null;
let rollingDay = false;

async function ensureDayRollover(): Promise<void> {
  if (rollingDay) return;
  const dayKey = utcDayKey();
  const meta = await readMeta();
  if (meta?.dayKey === dayKey) return;

  rollingDay = true;
  try {
    console.log(`[GOALYA Simulator] Nouvelle journée ${dayKey} — matchmaking…`);
    await runDailySimulatorMatchmaking(`Coupe du Monde · ${dayKey}`);
  } finally {
    rollingDay = false;
  }
}

export function startSimulatorScheduler(): void {
  if (process.env.SIMULATOR_ENABLED === 'false') {
    console.log('[GOALYA Simulator] Scheduler désactivé (SIMULATOR_ENABLED=false)');
    return;
  }

  const pollMs = Math.max(15_000, Number(process.env.SIMULATOR_POLL_MS ?? 45_000));

  if (pollTimer) clearInterval(pollTimer);

  void (async () => {
    try {
      await ensureDayRollover();
      await pollSimulatorLiveScores();
    } catch (e) {
      console.warn('[GOALYA Simulator] Premier poll:', e);
    }
  })();

  pollTimer = setInterval(() => {
    void (async () => {
      try {
        await ensureDayRollover();
        await pollSimulatorLiveScores();
      } catch (e) {
        console.warn('[GOALYA Simulator] Poll:', e instanceof Error ? e.message : e);
      }
    })();
  }, pollMs);

  console.log(`[GOALYA Simulator] Scheduler actif (poll ${pollMs}ms)`);
}
