# GOALYA — Lancement

## Beta test (version test)

**Documentation complète :** [BETA_TEST/README.md](./BETA_TEST/README.md)

Raccourci racine : [BETA_LANCEMENT.md](../BETA_LANCEMENT.md)

```powershell
npm run beta:preflight      # vérif env + serveur + IP LAN
npm run firebase:deploy:rules
npm run beta:server         # jour J — API Stripe + Simulator
npm run build:preview:ios
npm run build:preview:android
```

---

## Calendrier

| Date | Objectif |
|------|----------|
| **Beta test** | Build preview, clés test, groupe limité — voir [BETA_TEST](./BETA_TEST/) |
| **3 juin (officiel)** | Stores + Stripe live + API hébergée |

---

## Lancement officiel (3 juin)

### Stripe production

- App : `pk_live_…` (EAS Secrets / `.env` production)
- Serveur : `sk_live_…`, `STRIPE_WEBHOOK_SECRET=whsec_…`
- Webhook → `https://api.tondomaine.com/stripe/webhook`

### API hébergée

- Déployer `server/` (Railway, Fly.io, VPS…)
- `EXPO_PUBLIC_API_URL=https://api.tondomaine.com` dans le build production

### Stores

- `eas build --profile production`
- `eas submit`

### Sécurité (avant argent réel)

- Renforcer règles Firestore sur `fantasyPoints` / budget
- Crédits FP uniquement via serveur + webhook

---

## Références

| Doc | Sujet |
|-----|--------|
| [BETA_TEST/](./BETA_TEST/) | Beta complète |
| [SIMULATOR.md](./SIMULATOR.md) | Arena |
| [STRIPE_SETUP.md](./STRIPE_SETUP.md) | Stripe test |
| [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md) | Google OAuth |

---

## Scripts npm

| Commande | Rôle |
|----------|------|
| `npm run beta:preflight` | Pré-vol beta (env, IP, avertissements) |
| `npm run beta:server` | API jour J + affiche IP LAN |
| `npm run launch:check` | Vérif rapide .env / serveur |
| `npm run firebase:deploy:rules` | Firestore + indexes + RTDB + Storage |
| `npm run server:stripe` | API (alias dev) |
| `npm run build:preview:*` | Build testeurs |

## Hors scope Expo Go

- Google Sign-In natif
- Paiement Stripe (Payment Sheet)
