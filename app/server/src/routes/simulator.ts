import { Router } from 'express';
import type { AuthedRequest } from '../middleware/authFirebase.js';
import { requireFirebaseAuth } from '../middleware/authFirebase.js';
import { requireAdminSecret } from '../middleware/requireAdminSecret.js';
import { closeSimulatorDay } from '../simulator/dayClose.js';
import { isCupStarted } from '../simulator/constants.js';
import { pollSimulatorLiveScores } from '../simulator/liveEngine.js';
import { runDailySimulatorMatchmaking } from '../simulator/matchdayJob.js';
import { isLivescoreConfigured } from '../simulator/livescoreClient.js';
import { registerSimulatorPlayer } from '../simulator/registerUser.js';
import { readMeta } from '../simulator/rankingStore.js';

export function createSimulatorRouter(): Router {
  const router = Router();

  router.get('/status', (_req, res) => {
    res.json({
      cupStarted: isCupStarted(),
      livescoreConfigured: isLivescoreConfigured(),
      forceLive: process.env.SIMULATOR_FORCE_LIVE === 'true',
    });
  });

  router.post('/register', requireFirebaseAuth, async (req, res) => {
    const uid = (req as AuthedRequest).uid;
    const body = req.body as { displayName?: string; country?: string } | undefined;
    try {
      const result = await registerSimulatorPlayer(uid, {
        displayName: body?.displayName,
        country: body?.country,
      });
      res.json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur inscription Simulator';
      res.status(500).json({ error: msg });
    }
  });

  router.post('/admin/poll-live', requireAdminSecret, async (_req, res) => {
    try {
      const result = await pollSimulatorLiveScores();
      res.json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur poll live';
      res.status(500).json({ error: msg });
    }
  });

  router.post('/admin/run-matchmaking', requireAdminSecret, async (req, res) => {
    const label = (req.body as { matchdayLabel?: string } | undefined)?.matchdayLabel;
    try {
      const result = await runDailySimulatorMatchmaking(label);
      res.json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur matchmaking';
      res.status(500).json({ error: msg });
    }
  });

  router.post('/admin/close-day', requireAdminSecret, async (_req, res) => {
    try {
      const result = await closeSimulatorDay();
      res.json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur clôture journée';
      res.status(500).json({ error: msg });
    }
  });

  router.get('/admin/meta', requireAdminSecret, async (_req, res) => {
    const meta = await readMeta();
    res.json({ meta });
  });

  return router;
}
