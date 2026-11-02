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
exports.sendWelcomeToExisting = exports.sendBetaInviteToAll = exports.onSimulatorRankMilestone = exports.onPronoResult = exports.onNewUser = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const emailService_1 = require("./emailService");
// Initialiser admin une seule fois — v2026-06-04
if (!admin.apps.length) {
    admin.initializeApp();
}
// Base Firestore nommée 'default' (pas l'alias (default))
const db = (0, firestore_1.getFirestore)(admin.app(), "default");
// Mapping code pays → nom + drapeau
const COUNTRY_META = {
    FR: { name: "France", flag: "🇫🇷" },
    BR: { name: "Brésil", flag: "🇧🇷" },
    AR: { name: "Argentine", flag: "🇦🇷" },
    DE: { name: "Allemagne", flag: "🇩🇪" },
    ES: { name: "Espagne", flag: "🇪🇸" },
    PT: { name: "Portugal", flag: "🇵🇹" },
    GB: { name: "Angleterre", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    US: { name: "États-Unis", flag: "🇺🇸" },
    MX: { name: "Mexique", flag: "🇲🇽" },
    MA: { name: "Maroc", flag: "🇲🇦" },
    SN: { name: "Sénégal", flag: "🇸🇳" },
    NG: { name: "Nigeria", flag: "🇳🇬" },
    CM: { name: "Cameroun", flag: "🇨🇲" },
    CI: { name: "Côte d'Ivoire", flag: "🇨🇮" },
    JP: { name: "Japon", flag: "🇯🇵" },
    KR: { name: "Corée du Sud", flag: "🇰🇷" },
    AU: { name: "Australie", flag: "🇦🇺" },
    CA: { name: "Canada", flag: "🇨🇦" },
};
function countryMeta(code) {
    return COUNTRY_META[code?.toUpperCase()] ?? { name: code ?? "ta nation", flag: "🌍" };
}
// ── 1. EMAIL DE BIENVENUE ─────────────────────────────────────────────────────
// Trigger : création d'un utilisateur Firebase Auth
exports.onNewUser = functions
    .region("us-central1")
    .auth.user()
    .onCreate(async (user) => {
    const email = user.email;
    if (!email)
        return;
    let name = user.displayName ?? "Champion";
    let countryCode = "FR";
    try {
        const snap = await db.doc(`users/${user.uid}`).get();
        if (snap.exists) {
            const data = snap.data();
            if (typeof data.name === "string" && data.name)
                name = data.name;
            if (typeof data.countryCode === "string" && data.countryCode) {
                countryCode = data.countryCode;
            }
        }
    }
    catch {
        // Firestore pas encore dispo — on utilise les valeurs par défaut
    }
    const meta = countryMeta(countryCode);
    await (0, emailService_1.sendWelcomeEmail)(email, name, meta.name, meta.flag);
});
// ── 2. EMAIL RÉSULTAT PRONO ───────────────────────────────────────────────────
// Trigger : mise à jour du document users/{userId}/games/pronos
// (map de matchId → Prono). On détecte les nouvelles entrées avec pointsAwarded.
exports.onPronoResult = functions
    .region("us-central1")
    .firestore.document("users/{userId}/games/pronos")
    .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const before = change.before.data();
    const after = change.after.data();
    // Trouver les matchs où pointsAwarded vient d'être attribué
    const newlyAwarded = [];
    for (const [matchId, prono] of Object.entries(after)) {
        const prevPts = before[matchId]?.pointsAwarded;
        const currPts = prono.pointsAwarded;
        if (currPts !== undefined && prevPts === undefined) {
            newlyAwarded.push({ matchId, prono });
        }
    }
    if (!newlyAwarded.length)
        return;
    // Récupérer infos utilisateur
    let userEmail;
    let userName = "Champion";
    try {
        const [authUser, userDoc] = await Promise.all([
            admin.auth().getUser(userId),
            db.doc(`users/${userId}`).get(),
        ]);
        userEmail = authUser.email;
        const userData = userDoc.data();
        if (typeof userData?.name === "string" && userData.name) {
            userName = userData.name;
        }
    }
    catch {
        return;
    }
    if (!userEmail)
        return;
    for (const { matchId, prono } of newlyAwarded) {
        const pts = typeof prono.pointsAwarded === "number" ? prono.pointsAwarded : 0;
        const homeScore = typeof prono.homeScore === "number" ? prono.homeScore : 0;
        const awayScore = typeof prono.awayScore === "number" ? prono.awayScore : 0;
        const prediction = `${homeScore} - ${awayScore}`;
        const realScore = "Voir dans l'app";
        const matchName = matchId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        await (0, emailService_1.sendPronoResultEmail)(userEmail, userName, matchName, prediction, realScore, pts);
    }
});
// ── 3. EMAIL PALIER SIMULATOR ─────────────────────────────────────────────────
// Trigger : mise à jour du rang simulator d'un joueur (Firestore)
// Envoie un email quand le joueur entre dans le Top 100, Top 10 ou devient #1.
const RANK_MILESTONES = [1, 10, 100, 1000];
exports.onSimulatorRankMilestone = functions
    .region("us-central1")
    .firestore.document("simulator/season_2026/rankings/{userId}")
    .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const before = change.before.data();
    const after = change.after.data();
    const rankBefore = typeof before.rank === "number" ? before.rank : 999999;
    const rankAfter = typeof after.rank === "number" ? after.rank : 999999;
    // Déclencher uniquement si le rang s'est amélioré et franchit un palier
    if (rankAfter >= rankBefore)
        return;
    const hitMilestone = RANK_MILESTONES.find((m) => rankAfter <= m && rankBefore > m);
    if (!hitMilestone)
        return;
    let userEmail;
    let userName = "Champion";
    try {
        const [authUser, userDoc] = await Promise.all([
            admin.auth().getUser(userId),
            db.doc(`users/${userId}`).get(),
        ]);
        userEmail = authUser.email;
        const userData = userDoc.data();
        if (typeof userData?.name === "string" && userData.name) {
            userName = userData.name;
        }
    }
    catch {
        return;
    }
    if (!userEmail)
        return;
    const milestoneLabel = hitMilestone === 1 ? "Top 1 mondial 🥇" :
        hitMilestone === 10 ? "Top 10 mondial" :
            hitMilestone === 100 ? "Top 100 mondial" :
                `Top ${hitMilestone} mondial`;
    await (0, emailService_1.sendMilestoneEmail)(userEmail, userName, milestoneLabel, rankAfter);
});
// ── 4. EMAIL ONE-SHOT — invitation beta test ──────────────────────────────────
// Envoie l'email d'invitation beta (lien Play Store) à tous les users inscrits.
// Protégée par X-Admin-Secret. Appeler UNE SEULE FOIS.
exports.sendBetaInviteToAll = functions
    .region("us-central1")
    .runWith({ timeoutSeconds: 540, memory: "512MB" })
    .https.onRequest(async (req, res) => {
    if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
        res.status(401).json({ error: "Non autorisé" });
        return;
    }
    if (req.method !== "POST") {
        res.status(405).json({ error: "POST requis" });
        return;
    }
    const results = { sent: 0, skipped: 0, errors: 0 };
    let pageToken;
    try {
        do {
            const listResult = await admin.auth().listUsers(100, pageToken);
            pageToken = listResult.pageToken;
            for (const user of listResult.users) {
                if (!user.email) {
                    results.skipped++;
                    continue;
                }
                try {
                    const snap = await db.doc(`users/${user.uid}`).get();
                    let name = user.displayName ?? "Champion";
                    if (snap.exists) {
                        const data = snap.data();
                        if (typeof data.name === "string" && data.name)
                            name = data.name;
                    }
                    await (0, emailService_1.sendBetaInviteEmail)(user.email, name);
                    results.sent++;
                    await new Promise((r) => setTimeout(r, 200));
                }
                catch {
                    results.errors++;
                }
            }
        } while (pageToken);
        res.status(200).json({ message: "Invitations beta envoyées", ...results });
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
// ── 5. EMAIL ONE-SHOT — testeurs existants ────────────────────────────────────
// Appelle cette URL UNE SEULE FOIS pour envoyer l'email de bienvenue
// à tous les utilisateurs déjà inscrits.
// Protégée par un secret dans le header : X-Admin-Secret
// Exemple : curl -X POST https://.../sendWelcomeToExisting \
//           -H "X-Admin-Secret: GOALYA_SECRET_2026"
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "GOALYA_SECRET_2026";
exports.sendWelcomeToExisting = functions
    .region("us-central1")
    .runWith({ timeoutSeconds: 540, memory: "512MB" })
    .https.onRequest(async (req, res) => {
    // Vérifier le secret
    if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
        res.status(401).json({ error: "Non autorisé" });
        return;
    }
    if (req.method !== "POST") {
        res.status(405).json({ error: "POST requis" });
        return;
    }
    const results = { sent: 0, skipped: 0, errors: 0 };
    let pageToken;
    try {
        // Parcourir tous les utilisateurs Firebase Auth par pages de 100
        do {
            const listResult = await admin.auth().listUsers(100, pageToken);
            pageToken = listResult.pageToken;
            for (const user of listResult.users) {
                if (!user.email) {
                    results.skipped++;
                    continue;
                }
                try {
                    const snap = await db.doc(`users/${user.uid}`).get();
                    let name = user.displayName ?? "Champion";
                    let countryCode = "FR";
                    if (snap.exists) {
                        const data = snap.data();
                        if (typeof data.name === "string" && data.name)
                            name = data.name;
                        if (typeof data.countryCode === "string" && data.countryCode) {
                            countryCode = data.countryCode;
                        }
                    }
                    const meta = countryMeta(countryCode);
                    await (0, emailService_1.sendWelcomeEmail)(user.email, name, meta.name, meta.flag);
                    results.sent++;
                    // Pause de 200ms entre chaque email pour respecter les limites Brevo
                    await new Promise((r) => setTimeout(r, 200));
                }
                catch {
                    results.errors++;
                }
            }
        } while (pageToken);
        res.status(200).json({
            message: "Emails envoyés aux testeurs existants",
            ...results,
        });
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
//# sourceMappingURL=index.js.map