# Simulator Arena — backend réel

Le mode **Simulator** ne utilise **aucune donnée simulée** côté app. Tout passe par :

- **Firestore** : `simulator/season_2026/rankings/{userId}`
- **Realtime Database** : scores live, duel du jour, événements
- **Serveur GOALYA** (`server/`) : matchmaking, poll Live Score, calcul des points

## Prérequis

1. `server/.env` avec Firebase service account + clés Live Score
2. `EXPO_PUBLIC_API_URL` pointant vers le serveur (même URL que Stripe)
3. Déployer les règles : `npm run firebase:deploy:rules`
4. Activer **Realtime Database** dans la console Firebase (si pas déjà fait)

## Variables serveur (`server/.env`)

| Variable | Rôle |
|----------|------|
| `LIVESCORE_KEY` / `LIVESCORE_SECRET` | API Live Score (matchs + événements CdM) |
| `FIREBASE_DATABASE_URL` | URL RTDB (sinon déduite du `project_id`) |
| `SIMULATOR_ENABLED` | `false` pour couper le scheduler |
| `SIMULATOR_POLL_MS` | Intervalle poll (défaut 45000) |
| `SIMULATOR_ADMIN_SECRET` | Header `x-goalya-admin-secret` pour jobs manuels |
| `SIMULATOR_FORCE_LIVE` | `true` = activer le poll avant le 11 juin 2026 |

## Flux joueur

1. Équipe Fantasy **11 titulaires** sauvegardée en cloud → `POST /simulator/register` (auto)
2. Chaque jour : matchmaking 1v1 (scheduler ou admin)
3. Pendant les matchs CdM : le serveur lit les **événements Live Score**, résout le joueur (ID FotMob / nom), crédite les managers concernés
4. Fin de journée (changement de date UTC) : clôture du duel + historique + nouveau matchmaking

## Commandes admin (curl)

Remplacer `SECRET` et l’URL du serveur.

```bash
# Poll live immédiat
curl -X POST http://localhost:4242/simulator/admin/poll-live \
  -H "x-goalya-admin-secret: SECRET"

# Lancer les duels du jour
curl -X POST http://localhost:4242/simulator/admin/run-matchmaking \
  -H "x-goalya-admin-secret: SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"matchdayLabel\":\"CdM · Journée test\"}"

# Clôturer la journée
curl -X POST http://localhost:4242/simulator/admin/close-day \
  -H "x-goalya-admin-secret: SECRET"
```

## Lancement Coupe du Monde

1. Démarrer le serveur : `npm run server:stripe`
2. Vérifier : `GET /health` → `livescoreConfigured: true`, `simulatorScheduler: true`
3. Avant le coup d’envoi : laisser `SIMULATOR_FORCE_LIVE=false` (Arena verrouillée dans l’app)
4. Le **11 juin 2026** : l’app déverrouille l’Arena ; le scheduler poll les matchs réels
5. Au premier jour de compétition : `run-matchmaking` si le scheduler n’a pas encore tourné

## Points (barème)

Aligné sur `SIMULATOR_POINTS` : but +10, passe +6, cartons négatifs, capitaine ×2 sur les actions positives.

Les joueurs Fantasy sont identifiés par **ID FotMob** (champ `id` / `fotmobId` dans l’équipe).
