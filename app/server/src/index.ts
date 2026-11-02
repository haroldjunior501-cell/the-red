import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import Stripe from 'stripe';
import { createStripeFpRouter, handleStripeWebhook } from './routes/stripeFp.js';
import { createSimulatorRouter } from './routes/simulator.js';
import { startHubGoalDetectionScheduler } from './hub/detectGoals.js';
import { startSimulatorScheduler } from './simulator/scheduler.js';
import { isLivescoreConfigured } from './simulator/livescoreClient.js';

function isFirebaseServiceAccountReady(): boolean {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) return true;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (!path) return false;
  return existsSync(resolve(path));
}

const port = Number(process.env.PORT ?? 4242);
const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();

if (!stripeSecret) {
  console.error('[GOALYA] STRIPE_SECRET_KEY manquant dans server/.env');
  process.exit(1);
}

const stripe = new Stripe(stripeSecret);
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s: string) => s.trim()) ?? true,
  })
);

app.get('/health', (_req, res) => {
  const firebaseReady = isFirebaseServiceAccountReady();
  res.json({
    ok: true,
    service: 'goalya-stripe-api',
    firebaseReady,
    stripeReady: Boolean(stripeSecret),
    livescoreConfigured: isLivescoreConfigured(),
    simulatorForceLive: process.env.SIMULATOR_FORCE_LIVE === 'true',
  });
});

app.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const result = await handleStripeWebhook(
      stripe,
      req.body as Buffer,
      typeof sig === 'string' ? sig : undefined
    );
    res.status(result.status).send(result.body);
  }
);

app.use(express.json());
app.use('/stripe', createStripeFpRouter(stripe));
app.use('/simulator', createSimulatorRouter());

app.listen(port, '0.0.0.0', () => {
  console.log(`[GOALYA] API http://localhost:${port}`);
  if (!isFirebaseServiceAccountReady()) {
    console.warn(
      '[GOALYA] firebase-service-account.json manquant — les paiements ne créditeront pas les FP.\n' +
        '         Firebase Console → Comptes de service → clé JSON dans server/'
    );
  } else {
    try {
      startSimulatorScheduler();
      startHubGoalDetectionScheduler();
    } catch (e) {
      console.warn('[GOALYA] Simulator scheduler non démarré:', e);
    }
  }
});
