# GOALYA — Lancement version test (beta)

Point d’entrée unique pour organiser et lancer la beta interne.

## Documents

| Fichier | Pour qui | Contenu |
|---------|----------|---------|
| [ORGANISATEUR.md](./ORGANISATEUR.md) | Toi / équipe | Checklist J-1, jour J, infra, build, Firebase |
| [JOUR_J.md](./JOUR_J.md) | Jour du test | Timeline heure par heure |
| [BUILD_ET_DISTRIBUTION.md](./BUILD_ET_DISTRIBUTION.md) | Technique | EAS preview, TestFlight, APK, variables build |
| [TESTEURS.md](./TESTEURS.md) | Groupe beta | À copier-coller (install, parcours, bugs) |
| [MATRICE_FONCTIONNELLE.md](./MATRICE_FONCTIONNELLE.md) | Tous | Ce qui est testable vs partiel |
| [MESSAGE_TESTEURS.txt](./MESSAGE_TESTEURS.txt) | WhatsApp / mail | Message prêt à envoyer |

## Références techniques

- [../LANCEMENT.md](../LANCEMENT.md) — vue calendrier test + prod 3 juin
- [../SIMULATOR.md](../SIMULATOR.md) — Arena / serveur / jobs admin
- [../STRIPE_SETUP.md](../STRIPE_SETUP.md) — clés Stripe test
- [../GOOGLE_AUTH_SETUP.md](../GOOGLE_AUTH_SETUP.md) — OAuth Google

## Commandes rapides

```powershell
cd c:\Users\PC\GOALYA\app
npm install

# 1. Vérification complète (env, Firebase JSON, serveur)
npm run beta:preflight

# 2. Déployer les règles Firebase (une fois ou après modif rules)
npm run firebase:deploy:rules

# 3. Jour du test : serveur + IP affichée pour les téléphones
npm run beta:server

# 4. Build preview à distribuer
npm run build:preview:ios
npm run build:preview:android
```

## GO / NO-GO beta

**GO** si `npm run beta:preflight` termine sans `[FAIL]`, build preview installé sur au moins un téléphone, parcours [TESTEURS.md](./TESTEURS.md) § « Smoke test » validé une fois.

**NO-GO** si distribution via Expo Go seule, ou Firebase rules non déployées, ou serveur inaccessible aux testeurs pendant Fantasy / Stripe.
