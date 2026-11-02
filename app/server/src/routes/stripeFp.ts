import { Router } from 'express';
import Stripe from 'stripe';
import { findConversion } from '../budgetConversions.js';
import { fulfillConvertFp } from '../fulfillConvertFp.js';
import { fulfillFpPurchase } from '../fulfillFpPurchase.js';
import { fulfillQuickBoost } from '../fulfillQuickBoost.js';
import { getPack, totalFp, type FpPackId } from '../fpPacks.js';
import { getQuickBoost, type QuickBoostId } from '../quickBoosts.js';
import type { AuthedRequest } from '../middleware/authFirebase.js';
import { requireFirebaseAuth } from '../middleware/authFirebase.js';

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const userId = pi.metadata.userId;
  if (!userId) return;

  const productType = pi.metadata.productType;

  if (productType === 'quick_boost') {
    const boostId = pi.metadata.boostId as QuickBoostId;
    const gain = Number(pi.metadata.gain);
    if (boostId && Number.isFinite(gain)) {
      await fulfillQuickBoost(userId, pi.id, boostId, gain);
    }
    return;
  }

  if (productType === 'fp_pack' || pi.metadata.packId) {
    const packId = pi.metadata.packId as FpPackId;
    const fpAmount = Number(pi.metadata.fpAmount);
    if (packId && Number.isFinite(fpAmount)) {
      await fulfillFpPurchase(userId, pi.id, packId, fpAmount);
    }
  }
}

export function createStripeFpRouter(stripe: Stripe): Router {
  const router = Router();

  router.post('/convert-fp-to-budget', requireFirebaseAuth, async (req, res) => {
    const uid = (req as AuthedRequest).uid;
    const fpCost = Number(req.body?.fpCost);
    const budgetGain = Number(req.body?.budgetGain);

    if (!findConversion(fpCost, budgetGain)) {
      res.status(400).json({ error: 'Conversion non autorisée' });
      return;
    }

    const referenceId = `conv_${fpCost}_${budgetGain}_${Date.now()}`;
    const result = await fulfillConvertFp(uid, fpCost, budgetGain, referenceId);

    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      success: true,
      fantasyPoints: result.fantasyPoints,
      fantasyBudget: result.fantasyBudget,
    });
  });

  router.post('/fp-payment-intent', requireFirebaseAuth, async (req, res) => {
    const uid = (req as AuthedRequest).uid;
    const packId = String(req.body?.packId ?? '') as FpPackId;
    const pack = getPack(packId);
    if (!pack) {
      res.status(400).json({ error: 'Pack inconnu' });
      return;
    }

    try {
      const amountCents = Math.round(pack.priceEur * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: uid,
          productType: 'fp_pack',
          packId: pack.id,
          fpAmount: String(totalFp(pack)),
        },
      });

      if (!paymentIntent.client_secret) {
        res.status(500).json({ error: 'Stripe n’a pas renvoyé de client_secret' });
        return;
      }

      res.json({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        packId: pack.id,
        fpAmount: pack.fp,
        amountEur: pack.priceEur,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur Stripe';
      res.status(500).json({ error: msg });
    }
  });

  router.post('/boost-payment-intent', requireFirebaseAuth, async (req, res) => {
    const uid = (req as AuthedRequest).uid;
    const boostId = String(req.body?.boostId ?? '') as QuickBoostId;
    const boost = getQuickBoost(boostId);
    if (!boost) {
      res.status(400).json({ error: 'Boost inconnu' });
      return;
    }

    try {
      const amountCents = Math.round(boost.priceEur * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: uid,
          productType: 'quick_boost',
          boostId: boost.id,
          gain: String(boost.gain),
        },
      });

      if (!paymentIntent.client_secret) {
        res.status(500).json({ error: 'Stripe n’a pas renvoyé de client_secret' });
        return;
      }

      res.json({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        boostId: boost.id,
        budgetGain: boost.gain,
        amountEur: boost.priceEur,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur Stripe';
      res.status(500).json({ error: msg });
    }
  });

  router.post('/fp-fulfill', requireFirebaseAuth, async (req, res) => {
    const uid = (req as AuthedRequest).uid;
    const paymentIntentId = String(req.body?.paymentIntentId ?? '').trim();
    if (!paymentIntentId) {
      res.status(400).json({ error: 'paymentIntentId requis' });
      return;
    }

    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.status !== 'succeeded') {
        res.status(400).json({ error: 'Paiement non confirmé', status: pi.status });
        return;
      }
      if (pi.metadata.userId !== uid) {
        res.status(403).json({ error: 'Paiement non associé à ce compte' });
        return;
      }

      const packId = pi.metadata.packId as FpPackId;
      const fpAmount = Number(pi.metadata.fpAmount);
      if (!packId || !Number.isFinite(fpAmount)) {
        res.status(400).json({ error: 'Métadonnées de paiement invalides' });
        return;
      }

      const result = await fulfillFpPurchase(uid, paymentIntentId, packId, fpAmount);
      if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
      }
      res.json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de validation';
      res.status(500).json({ error: msg });
    }
  });

  router.post('/boost-fulfill', requireFirebaseAuth, async (req, res) => {
    const uid = (req as AuthedRequest).uid;
    const paymentIntentId = String(req.body?.paymentIntentId ?? '').trim();
    if (!paymentIntentId) {
      res.status(400).json({ error: 'paymentIntentId requis' });
      return;
    }

    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.status !== 'succeeded') {
        res.status(400).json({ error: 'Paiement non confirmé', status: pi.status });
        return;
      }
      if (pi.metadata.userId !== uid) {
        res.status(403).json({ error: 'Paiement non associé à ce compte' });
        return;
      }

      const boostId = pi.metadata.boostId as QuickBoostId;
      const gain = Number(pi.metadata.gain);
      if (!boostId || !Number.isFinite(gain)) {
        res.status(400).json({ error: 'Métadonnées boost invalides' });
        return;
      }

      const result = await fulfillQuickBoost(uid, paymentIntentId, boostId, gain);
      if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
      }
      res.json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de validation';
      res.status(500).json({ error: msg });
    }
  });

  return router;
}

export async function handleStripeWebhook(
  stripe: Stripe,
  rawBody: Buffer,
  signature: string | undefined
): Promise<{ status: number; body: string }> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return { status: 500, body: 'STRIPE_WEBHOOK_SECRET manquant' };
  }
  if (!signature) {
    return { status: 400, body: 'Signature manquante' };
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Webhook invalide';
    return { status: 400, body: msg };
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    await handlePaymentIntentSucceeded(pi);
  }

  return { status: 200, body: JSON.stringify({ received: true }) };
}
