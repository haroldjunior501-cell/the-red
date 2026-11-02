"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWelcomeHTML = getWelcomeHTML;
exports.getPronoResultHTML = getPronoResultHTML;
exports.getBetaInviteHTML = getBetaInviteHTML;
exports.getRankMilestoneHTML = getRankMilestoneHTML;
// ── TEMPLATE BIENVENUE ──
function getWelcomeHTML(name, country, flag) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#07101e;font-family:Arial,sans-serif;}
  .wrap{max-width:600px;margin:0 auto;background:#0e1a2e;border-radius:16px;overflow:hidden;}
  .top{background:linear-gradient(135deg,#0a1428,#162035);padding:40px 32px;text-align:center;border-bottom:1px solid rgba(41,121,255,0.2);}
  .logo{font-size:36px;font-weight:900;color:#fff;letter-spacing:8px;margin-bottom:6px;}
  .logo-sub{font-size:12px;color:#5b9aff;letter-spacing:3px;}
  .body{padding:32px;}
  .trophy{font-size:48px;text-align:center;margin-bottom:16px;}
  .title{font-size:24px;font-weight:900;color:#f0f4ff;text-align:center;margin-bottom:10px;}
  .sub{font-size:14px;color:#8aa0be;text-align:center;line-height:1.7;margin-bottom:20px;}
  .nation{display:inline-block;background:rgba(41,121,255,0.1);border:1px solid rgba(41,121,255,0.25);border-radius:20px;padding:8px 20px;font-size:14px;font-weight:700;color:#5b9aff;text-align:center;width:100%;box-sizing:border-box;margin-bottom:24px;}
  .features{margin-bottom:24px;}
  .feature{display:flex;align-items:center;gap:14px;background:#162035;border-radius:12px;padding:14px;margin-bottom:8px;}
  .fi{font-size:22px;width:36px;text-align:center;}
  .fn{font-size:14px;font-weight:700;color:#f0f4ff;margin-bottom:2px;}
  .fd{font-size:12px;color:#3d5070;}
  .cta{display:block;background:linear-gradient(135deg,#2979ff,#1040cc);color:#fff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:2px;padding:18px;border-radius:14px;text-align:center;margin-bottom:14px;}
  .countdown{font-size:13px;color:#f0b429;font-weight:600;text-align:center;}
  .footer{background:#07101e;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);}
  .ft{font-size:11px;color:#3d5070;line-height:1.8;}
  .fl{color:#5b9aff;text-decoration:none;}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <div class="logo">GOALYA</div>
    <div class="logo-sub">WORLD CUP 2026</div>
  </div>
  <div class="body">
    <div class="trophy">🏆</div>
    <div class="title">Bienvenue dans l'aventure, ${name} !</div>
    <div class="sub">Tu viens de rejoindre la plus grande communauté de supporters de la Coupe du Monde 2026.</div>
    <div class="nation">${flag} Tu représentes ${country}</div>
    <div class="features">
      <div class="feature"><div class="fi">⚽</div><div><div class="fn">Pronos</div><div class="fd">Prédit les scores exacts et grimpe dans le classement</div></div></div>
      <div class="feature"><div class="fi">🏆</div><div><div class="fn">Tableau</div><div class="fd">Pronostique le parcours jusqu'à la finale</div></div></div>
      <div class="feature"><div class="fi">⚡</div><div><div class="fn">Fantasy</div><div class="fd">Compose ton équipe de rêve avec 100M€</div></div></div>
      <div class="feature"><div class="fi">⚔️</div><div><div class="fn">Arena Simulator</div><div class="fd">Affronte des managers du monde entier</div></div></div>
      <div class="feature"><div class="fi">🌍</div><div><div class="fn">Hub mondial</div><div class="fd">Rejoins des millions de supporters</div></div></div>
    </div>
    <a href="https://goalya.com" class="cta">OUVRIR GOALYA 🚀</a>
    <div class="countdown">⏱ La Coupe du Monde commence le 11 juin 2026</div>
  </div>
  <div class="footer">
    <div class="ft">Fait avec l'amour du football · GOALYA v1.0.0<br>
      <a href="mailto:support@goalya.com" class="fl">support@goalya.com</a>
      &nbsp;·&nbsp;
      <a href="https://goalya.com/unsubscribe" class="fl">Se désabonner</a>
    </div>
  </div>
</div>
</body>
</html>`;
}
// ── TEMPLATE RÉSULTAT PRONO ──
function getPronoResultHTML(name, match, prediction, real, pts) {
    const won = pts > 0;
    const wonColor = won ? "#00e676" : "#e5382b";
    const wonBg = won
        ? "linear-gradient(135deg,rgba(0,230,118,0.08),rgba(41,121,255,0.06))"
        : "linear-gradient(135deg,rgba(229,56,43,0.06),rgba(41,121,255,0.04))";
    const wonBorder = won ? "rgba(0,230,118,0.2)" : "rgba(229,56,43,0.15)";
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#07101e;font-family:Arial,sans-serif;}
  .wrap{max-width:600px;margin:0 auto;background:#0e1a2e;border-radius:16px;overflow:hidden;}
  .top{padding:32px;text-align:center;background:${wonBg};border-bottom:1px solid ${wonBorder};}
  .logo{font-size:24px;font-weight:900;color:#fff;letter-spacing:6px;margin-bottom:16px;}
  .result-ico{font-size:48px;margin-bottom:12px;}
  .result-title{font-size:22px;font-weight:900;color:${wonColor};margin-bottom:6px;}
  .match-name{font-size:13px;color:#8aa0be;font-weight:600;}
  .body{padding:28px;}
  .score-row{display:flex;gap:12px;margin-bottom:20px;}
  .score-box{flex:1;background:#162035;border-radius:12px;padding:16px;text-align:center;border:1px solid rgba(255,255,255,0.07);}
  .sb-lbl{font-size:10px;font-weight:700;letter-spacing:1.5px;color:#3d5070;text-transform:uppercase;margin-bottom:8px;}
  .sb-val{font-size:28px;font-weight:900;color:${won ? "#00e676" : "#f0f4ff"};}
  .pts-card{background:${won ? "rgba(0,230,118,0.06)" : "rgba(229,56,43,0.06)"};border:1px solid ${wonBorder};border-radius:12px;padding:16px;text-align:center;margin-bottom:20px;}
  .pts-val{font-size:32px;font-weight:900;color:${won ? "#f0b429" : "#3d5070"};}
  .pts-lbl{font-size:12px;color:#8aa0be;font-weight:600;margin-top:4px;}
  .cta{display:block;background:linear-gradient(135deg,#2979ff,#1040cc);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:16px;border-radius:12px;text-align:center;}
  .footer{background:#07101e;padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);}
  .ft{font-size:11px;color:#3d5070;}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <div class="logo">GOALYA</div>
    <div class="result-ico">${won ? "🎯" : "😅"}</div>
    <div class="result-title">${won ? `Bon pronostic, ${name} !` : `Pas cette fois, ${name}...`}</div>
    <div class="match-name">${match}</div>
  </div>
  <div class="body">
    <div class="score-row">
      <div class="score-box"><div class="sb-lbl">Ton prono</div><div class="sb-val">${prediction}</div></div>
      <div class="score-box"><div class="sb-lbl">Score réel</div><div class="sb-val">${real}</div></div>
    </div>
    <div class="pts-card">
      <div class="pts-val">${won ? `+${pts}` : "0"} pts</div>
      <div class="pts-lbl">${won ? "Points nation gagnés !" : "Meilleure chance la prochaine fois"}</div>
    </div>
    <a href="https://goalya.com" class="cta">Voir mes pronostics →</a>
  </div>
  <div class="footer"><div class="ft">GOALYA · Fait avec l'amour du football</div></div>
</div>
</body>
</html>`;
}
// ── TEMPLATE INVITATION BETA TEST ──
function getBetaInviteHTML(name) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#07101e;font-family:Arial,sans-serif;}
  .wrap{max-width:600px;margin:0 auto;background:#0e1a2e;border-radius:16px;overflow:hidden;}
  .top{background:linear-gradient(135deg,#0a1428,#162035);padding:40px 32px;text-align:center;border-bottom:1px solid rgba(41,121,255,0.2);}
  .logo{font-size:36px;font-weight:900;color:#fff;letter-spacing:8px;margin-bottom:6px;}
  .logo-sub{font-size:12px;color:#5b9aff;letter-spacing:3px;}
  .body{padding:32px;}
  .ico{font-size:52px;text-align:center;margin-bottom:16px;}
  .title{font-size:24px;font-weight:900;color:#f0f4ff;text-align:center;margin-bottom:10px;}
  .sub{font-size:14px;color:#8aa0be;text-align:center;line-height:1.7;margin-bottom:24px;}
  .badge{display:inline-block;background:rgba(0,230,118,0.1);border:1px solid rgba(0,230,118,0.3);border-radius:20px;padding:6px 18px;font-size:13px;font-weight:700;color:#00e676;text-align:center;width:100%;box-sizing:border-box;margin-bottom:24px;}
  .info-box{background:#162035;border-radius:12px;padding:18px 20px;margin-bottom:24px;border-left:3px solid #2979ff;}
  .info-title{font-size:12px;font-weight:700;letter-spacing:1.5px;color:#5b9aff;text-transform:uppercase;margin-bottom:10px;}
  .info-item{font-size:13px;color:#8aa0be;margin-bottom:6px;padding-left:10px;}
  .cta{display:block;background:linear-gradient(135deg,#2979ff,#1040cc);color:#fff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:2px;padding:18px;border-radius:14px;text-align:center;margin-bottom:14px;}
  .note{font-size:12px;color:#3d5070;text-align:center;line-height:1.6;}
  .footer{background:#07101e;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);}
  .ft{font-size:11px;color:#3d5070;line-height:1.8;}
  .fl{color:#5b9aff;text-decoration:none;}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <div class="logo">GOALYA</div>
    <div class="logo-sub">WORLD CUP 2026</div>
  </div>
  <div class="body">
    <div class="ico">🚀</div>
    <div class="title">Tu es invité(e) à tester GOALYA !</div>
    <div class="sub">Salut ${name}, tu fais partie des premiers à accéder à GOALYA avant son lancement officiel. Rejoins l'aventure Coupe du Monde 2026 !</div>
    <div class="badge">🔒 Accès Beta fermé — 14 jours</div>
    <div class="info-box">
      <div class="info-title">Ce qui t'attend</div>
      <div class="info-item">⚽ Pronos — Prédit les scores exacts</div>
      <div class="info-item">🏆 Tableau — Pronostique la finale</div>
      <div class="info-item">⚡ Fantasy Football — Compose ton équipe</div>
      <div class="info-item">⚔️ Arena Simulator — Affronte le monde entier</div>
      <div class="info-item">🌍 Hub mondial — Rejoins la communauté</div>
    </div>
    <a href="https://play.google.com/store/apps/details?id=com.goalya.app" class="cta">📲 TÉLÉCHARGER L'APP BETA</a>
    <div class="note">Disponible sur Android via Google Play.<br>Tes retours nous aident à améliorer l'app avant le lancement !</div>
  </div>
  <div class="footer">
    <div class="ft">Fait avec l'amour du football · GOALYA v1.0.0<br>
      <a href="mailto:support@goalya.com" class="fl">support@goalya.com</a>
      &nbsp;·&nbsp;
      <a href="https://goalya.com/unsubscribe" class="fl">Se désabonner</a>
    </div>
  </div>
</div>
</body>
</html>`;
}
// ── TEMPLATE MILESTONE RANG SIMULATOR ──
function getRankMilestoneHTML(name, milestone, rank) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#07101e;font-family:Arial,sans-serif;}
  .wrap{max-width:600px;margin:0 auto;background:#0e1a2e;border-radius:16px;overflow:hidden;}
  .top{padding:40px 32px;text-align:center;background:linear-gradient(135deg,rgba(147,51,255,0.1),rgba(41,121,255,0.06));border-bottom:1px solid rgba(147,51,255,0.2);}
  .logo{font-size:24px;font-weight:900;color:#fff;letter-spacing:6px;margin-bottom:20px;}
  .ico{font-size:52px;margin-bottom:14px;}
  .title{font-size:26px;font-weight:900;color:#f0f4ff;margin-bottom:6px;}
  .sub{font-size:14px;color:#8aa0be;line-height:1.6;}
  .body{padding:28px;}
  .rank-card{background:linear-gradient(135deg,rgba(147,51,255,0.08),rgba(41,121,255,0.05));border:1px solid rgba(147,51,255,0.2);border-radius:14px;padding:20px;text-align:center;margin-bottom:20px;}
  .rc-lbl{font-size:10px;font-weight:700;letter-spacing:2px;color:#c084fc;text-transform:uppercase;margin-bottom:8px;}
  .rc-val{font-size:40px;font-weight:900;color:#f0f4ff;margin-bottom:6px;}
  .rc-sub{font-size:13px;color:#3d5070;font-weight:600;}
  .msg{font-size:14px;color:#8aa0be;text-align:center;line-height:1.7;margin-bottom:20px;}
  .cta{display:block;background:linear-gradient(135deg,#9333ff,#6d28d9);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:16px;border-radius:12px;text-align:center;}
  .footer{background:#07101e;padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);}
  .ft{font-size:11px;color:#3d5070;}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <div class="logo">GOALYA</div>
    <div class="ico">🏆</div>
    <div class="title">Nouveau palier atteint !</div>
    <div class="sub">${name}, tu viens d'entrer dans l'élite mondiale.</div>
  </div>
  <div class="body">
    <div class="rank-card">
      <div class="rc-lbl">Ton classement mondial</div>
      <div class="rc-val">#${rank}</div>
      <div class="rc-sub">${milestone}</div>
    </div>
    <div class="msg">
      Ton équipe Fantasy t'a propulsé ici. Continue à l'améliorer
      pour atteindre le sommet et devenir Champion GOALYA 2026.
    </div>
    <a href="https://goalya.com" class="cta">🏆 Voir mon classement →</a>
  </div>
  <div class="footer"><div class="ft">GOALYA · Fait avec l'amour du football</div></div>
</div>
</body>
</html>`;
}
//# sourceMappingURL=emailTemplates.js.map