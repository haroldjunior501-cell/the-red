"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendPronoResultEmail = sendPronoResultEmail;
exports.sendBetaInviteEmail = sendBetaInviteEmail;
exports.sendRankMilestoneEmail = sendRankMilestoneEmail;
exports.sendMilestoneEmail = sendRankMilestoneEmail;
const brevoLib = __importStar(require("@getbrevo/brevo"));
const emailTemplates_1 = require("./emailTemplates");
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "hello@goalya.com";
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "GOALYA";
const API_KEY = process.env.BREVO_API_KEY ?? "";
function buildClient() {
    const client = new brevoLib.TransactionalEmailsApi();
    client.setApiKey(brevoLib.TransactionalEmailsApiApiKeys.apiKey, API_KEY);
    return client;
}
async function send(email) {
    if (!API_KEY) {
        console.warn("[emailService] BREVO_API_KEY absent — email non envoyé.");
        return;
    }
    try {
        await buildClient().sendTransacEmail(email);
    }
    catch (err) {
        console.error("[emailService] Erreur envoi :", err);
    }
}
// ── EMAIL DE BIENVENUE ──
async function sendWelcomeEmail(userEmail, userName, countryName, countryFlag) {
    const email = new brevoLib.SendSmtpEmail();
    email.to = [{ email: userEmail, name: userName }];
    email.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    email.subject = `Bienvenue dans l'aventure GOALYA 🏆`;
    email.htmlContent = (0, emailTemplates_1.getWelcomeHTML)(userName, countryName, countryFlag);
    await send(email);
}
// ── EMAIL RÉSULTAT PRONO ──
async function sendPronoResultEmail(userEmail, userName, matchName, userPrediction, realScore, pointsEarned) {
    const email = new brevoLib.SendSmtpEmail();
    email.to = [{ email: userEmail, name: userName }];
    email.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    email.subject =
        pointsEarned > 0
            ? `🎯 Bon prono ! +${pointsEarned} pts nation`
            : `😅 Pas cette fois — résultat de ton prono`;
    email.htmlContent = (0, emailTemplates_1.getPronoResultHTML)(userName, matchName, userPrediction, realScore, pointsEarned);
    await send(email);
}
// ── EMAIL INVITATION BETA TEST ──
async function sendBetaInviteEmail(userEmail, userName) {
    const email = new brevoLib.SendSmtpEmail();
    email.to = [{ email: userEmail, name: userName }];
    email.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    email.subject = `🚀 Tu es invité(e) à tester GOALYA en avant-première !`;
    email.htmlContent = (0, emailTemplates_1.getBetaInviteHTML)(userName);
    await send(email);
}
async function sendRankMilestoneEmail(userEmail, userName, milestone, rank) {
    const email = new brevoLib.SendSmtpEmail();
    email.to = [{ email: userEmail, name: userName }];
    email.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    email.subject = `🏆 Tu viens d'entrer dans le ${milestone} mondial !`;
    email.htmlContent = (0, emailTemplates_1.getRankMilestoneHTML)(userName, milestone, rank);
    await send(email);
}
//# sourceMappingURL=emailService.js.map