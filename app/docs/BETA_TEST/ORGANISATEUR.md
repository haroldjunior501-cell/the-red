# Checklist organisateur — beta test

## J-2 / J-1 — Préparation

### Environnement local

- [ ] `.env` racine rempli (copie depuis `.env.example`)
- [ ] `EXPO_PUBLIC_LAUNCH_MODE=1` (beta : Arena + Tableau KO)
- [ ] `EXPO_PUBLIC_API_URL=http://<IP_LAN_PC>:4242` (pas `localhost` pour les téléphones)
- [ ] `server/.env` + `server/firebase-service-account.json`
- [ ] Optionnel beta Arena live : `SIMULATOR_FORCE_LIVE=true` dans `server/.env`

```powershell
npm run beta:preflight
```

### Firebase

- [ ] `firebase login`
- [ ] `npm run firebase:deploy:rules` (Firestore + indexes + RTDB + Storage)
- [ ] Vérifier que le déploiement des **indexes** ne renvoie pas d’erreur 400

### Build testeurs

- [ ] Builds **preview** générés (voir [BUILD_ET_DISTRIBUTION.md](./BUILD_ET_DISTRIBUTION.md))
- [ ] Liens TestFlight / APK envoyés au groupe
- [ ] **Pas Expo Go** pour les testeurs (Google + Stripe)

### Communication

- [ ] Message testeurs envoyé ([MESSAGE_TESTEURS.txt](./MESSAGE_TESTEURS.txt))
- [ ] Canal bugs (Discord, formulaire, ou mail `EXPO_PUBLIC_SUPPORT_EMAIL`)
- [ ] [MATRICE_FONCTIONNELLE.md](./MATRICE_FONCTIONNELLE.md) partagée pour attentes réalistes

---

## Jour J — Matin (avant les testeurs)

| Heure | Action |
|-------|--------|
| T-60 min | `npm run beta:preflight` |
| T-45 min | `npm run beta:server` (laisser le terminal ouvert) |
| T-30 min | Smoke test sur **ton** téléphone ([TESTEURS.md](./TESTEURS.md)) |
| T-15 min | Envoyer rappel + lien build aux testeurs |
| H+0 | Ouvrir le canal support / bugs |

### Smoke test obligatoire (15 min)

1. Connexion email (ou Google sur build natif)
2. Profil → choisir un pays
3. Accueil → match visible
4. Pronos → 1 prono → kill app → rouvrir → prono conservé
5. Tableau → élimination → 1 vainqueur → Valider
6. Hub → envoyer un message chat
7. Fantasy → sauver équipe (11 joueurs)
8. Déconnexion / reconnexion

---

## Pendant la beta

- [ ] Serveur API allumé si tests Fantasy FP / Stripe
- [ ] PC et téléphones sur le **même Wi‑Fi** (ou API sur URL publique)
- [ ] Noter les crashs (écran rouge + étape)
- [ ] Regrouper les retours par écran : Accueil, Pronos, Tableau, Hub, Fantasy, Live, Map, Arena

---

## Fin de session

- [ ] Export des bugs (priorité : crash, perte de données, paiement)
- [ ] Décision : correctifs avant élargissement ou 2e vague beta
- [ ] Ne pas passer `EXPO_PUBLIC_LAUNCH_MODE=0` avant la prod si tu continues les tests internes

---

## Dépannage express

| Symptôme | Piste |
|----------|--------|
| Google ne marche pas | Build natif, pas Expo Go |
| Paiement FP échoue | Serveur allumé + `EXPO_PUBLIC_API_URL` = IP LAN |
| Chat Hub vide | Connecté + match affiché en haut du Hub |
| Prono non sauvé | Connecté Firebase (email) |
| Erreur Firestore permission | `npm run firebase:deploy:rules` |
| Index deploy 400 | Voir `firebase/firestore.indexes.json` (pas d’index simple champ seul) |
