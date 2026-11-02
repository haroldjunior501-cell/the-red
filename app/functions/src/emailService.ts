import * as brevoLib from "@getbrevo/brevo";
import { getWelcomeHTML, getPronoResultHTML, getRankMilestoneHTML, getBetaInviteHTML } from "./emailTemplates";

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "hello@goalya.com";
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "GOALYA";
const API_KEY = process.env.BREVO_API_KEY ?? "";

function buildClient(): brevoLib.TransactionalEmailsApi {
  const client = new brevoLib.TransactionalEmailsApi();
  client.setApiKey(brevoLib.TransactionalEmailsApiApiKeys.apiKey, API_KEY);
  return client;
}

async function send(email: brevoLib.SendSmtpEmail): Promise<void> {
  if (!API_KEY) {
    console.warn("[emailService] BREVO_API_KEY absent — email non envoyé.");
    return;
  }
  try {
    await buildClient().sendTransacEmail(email);
  } catch (err) {
    console.error("[emailService] Erreur envoi :", err);
  }
}

// ── EMAIL DE BIENVENUE ──
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  countryName: string,
  countryFlag: string
): Promise<void> {
  const email = new brevoLib.SendSmtpEmail();
  email.to = [{ email: userEmail, name: userName }];
  email.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
  email.subject = `Bienvenue dans l'aventure GOALYA 🏆`;
  email.htmlContent = getWelcomeHTML(userName, countryName, countryFlag);
  await send(email);
}

// ── EMAIL RÉSULTAT PRONO ──
export async function sendPronoResultEmail(
  userEmail: string,
  userName: string,
  matchName: string,
  userPrediction: string,
  realScore: string,
  pointsEarned: number
): Promise<void> {
  const email = new brevoLib.SendSmtpEmail();
  email.to = [{ email: userEmail, name: userName }];
  email.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
  email.subject =
    pointsEarned > 0
      ? `🎯 Bon prono ! +${pointsEarned} pts nation`
      : `😅 Pas cette fois — résultat de ton prono`;
  email.htmlContent = getPronoResultHTML(
    userName,
    matchName,
    userPrediction,
    realScore,
    pointsEarned
  );
  await send(email);
}

// ── EMAIL INVITATION BETA TEST ──
export async function sendBetaInviteEmail(
  userEmail: string,
  userName: string
): Promise<void> {
  const email = new brevoLib.SendSmtpEmail();
  email.to = [{ email: userEmail, name: userName }];
  email.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
  email.subject = `🚀 Tu es invité(e) à tester GOALYA en avant-première !`;
  email.htmlContent = getBetaInviteHTML(userName);
  await send(email);
}

// ── EMAIL PALIER SIMULATOR ──
export { sendRankMilestoneEmail as sendMilestoneEmail };
export async function sendRankMilestoneEmail(
  userEmail: string,
  userName: string,
  milestone: string,
  rank: number
): Promise<void> {
  const email = new brevoLib.SendSmtpEmail();
  email.to = [{ email: userEmail, name: userName }];
  email.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
  email.subject = `🏆 Tu viens d'entrer dans le ${milestone} mondial !`;
  email.htmlContent = getRankMilestoneHTML(userName, milestone, rank);
  await send(email);
}
