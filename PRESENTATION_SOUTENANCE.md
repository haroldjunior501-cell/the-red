# THE RED — Script de soutenance (oral)

> À lire à voix haute. Durée cible : **12–15 minutes** + questions.  
> Projet : application fans Manchester United — Holberton School T3 — **Harold Nguemeta**  
> Dépôt : https://github.com/haroldjunior501-cell/the-red

---

## 0. Ouverture (30 s)

« Bonjour. Je présente **THE RED**, une application mobile pour les supporters de Manchester United.  
Le problème : l’info du club est dispersée (scores, calendrier, news, engagement).  
Le MVP réunit **Match Center**, **United News** et **Fan Community**, avec un client Expo et une API FastAPI.  
Je vais couvrir la stack, l’architecture, la base de données, le frontend, le backend, les API, puis la démo. »

---

## 1. Non-technique (à montrer rapidement)

| Critère | Ce que tu dis / montres |
|---|---|
| **Professionnalisme** | Ton calme, démo fluide, tu assumes les choix et les limites. |
| **Organisation** | README + `PRESENTATION_SOUTENANCE.md` + sprints documentés dans le README. |
| **Sprints** | 8 sprints : socle Docker → auth → matches → news → community → frontend → live/programme → QA. |
| **Collaboration** | Projet individuel : tu as porté tous les rôles (PO, dev, QA) ; communication = commits clairs + README. |
| **Fonctionnalités = user stories** | « En tant que fan, je veux voir le prochain match, le live, le programme, mon XI, les news. » |
| **Adaptabilité** | Pivot CDM → club United ; Live recentré sur FotMob + centre match (score/chrono/stats/compos) sans streaming illégal. |

---

## 2. README & installation (1 min)

« Le dépôt GitHub contient un **README** professionnel : vision, architecture mermaid, schéma BDD, stack, installation Docker et locale, table d’API, tests, sprints. »

**Commandes à citer :**
```bash
git clone https://github.com/haroldjunior501-cell/the-red.git
cd the-red
docker compose up --build -d          # API + Postgres + Nginx
cd app && npm install && npm run start  # Expo
cd backend && python -m pytest tests/   # 5/5
```

---

## 3. Stack technologique — justification (1 min 30)

| Choix | Pourquoi |
|---|---|
| **Expo / React Native + TypeScript** | Un seul code iOS/Android, typage fort, itération rapide pour un MVP mobile. |
| **React Navigation** | Tabs = parcours fan clair (Home, Live, Vidéos, Mon XI, Programme). |
| **TanStack Query** | Cache, stale-time, refetch ; idéal pour scores et classements. |
| **FastAPI + Pydantic** | API async rapide, validation automatique, Swagger gratuit (`/docs`). |
| **PostgreSQL + SQLAlchemy + Alembic** | Données relationnelles (users, posts, matches) avec migrations versionnées. |
| **Docker Compose + Nginx** | Environnement reproductible + reverse-proxy / headers sécurité. |
| **FotMob (data)** | Fixtures United, live, stats, compos — données sportives riches pour le Match Center. |
| **Pytest** | Preuve d’intégration auth + contrats API. |

**Phrase clé :** « Chaque brique répond à une contrainte MVP : vitesse de livraison, clarté des contrats, et séparation des responsabilités. »

---

## 4. Architecture & flux de données (2 min)

### Schéma oral (3 tiers)

1. **Client Expo** — UI + hooks (`useTheRedHome`, `useLiveMatches`, `useUnitedProgramme`) + cache local.  
2. **Passerelle Nginx** — reverse-proxy, rate limiting, headers sécurité.  
3. **Backend FastAPI** — routers métier + adaptateurs externes + ORM.  
4. **PostgreSQL** — persistance users / community / matches / news.

### Flux exemple « Live United »

1. L’onglet Live appelle `fetchUnitedLiveSection`.  
2. On lit le calendrier FotMob (fixtures équipe 10260).  
3. Si match en cours → `matchDetails` pour score, events, stats, lineups.  
4. Polling ~12–20 s pendant le live.  
5. L’écran détail affiche onglets : Match / Stats / Compos / H2H / PL.

### Deux améliorations sécurité / performance (à dire absolument)

**Sécurité**
1. Tourner les secrets JWT via variables d’environnement + rotation ; jamais de clé dans le dépôt.  
2. Rate limiting plus strict sur `/auth/login` + refresh tokens (réduire la fenêtre d’attaque JWT).

**Performance**
1. Cache Redis côté API pour `/matches` et `/news` (TTL court).  
2. Pagination + index déjà présents ; ajouter ETag / HTTP caching sur les listes publiques.

---

## 5. Base de données (1 min 30)

« J’ai choisi **PostgreSQL** car le métier est relationnel : un user a un profil, écrit des posts, réagit ; un match peut être lié à un post. »

**Tables clés :** `users`, `profiles`, `matches`, `news`, `posts`, `comments`, `reactions`.

**Justifications métier**
- Séparer `users` (credentials) et `profiles` (données publiques).  
- `reactions` comme table N–N typée (`red`, `like`, `fire`).  
- `matches.external_id` unique pour dédupliquer les syncs API.  
- CASCADE sur posts/comments pour cohérence à la suppression.

**Deux améliorations stockage / perf**
1. Partitionner ou archiver les vieux posts ; index composites `(match_id, created_at)`.  
2. Colonne JSONB pour stats live éphémères **ou** store temps réel dédié (Firebase déjà exploré) pour ne pas saturer Postgres.

---

## 6. Frontend — 3 concepts + extraits (2 min)

### Concept 1 — Navigation modulaire
Tabs `AppTabs` : Accueil, Live, Vidéos, Fantasy (Mon XI), Programme.  
→ Respect de la règle « 3 taps ».

### Concept 2 — Hooks de données + polling
`useLiveMatches` / `useMatchDetails` : chargement, erreurs, refresh, score live.

### Concept 3 — UI thématisée THE RED
Tokens couleurs (`#DA291C`, or `#FBE122`), `ScreenAmbience`, cartes match.

**Extraits à ouvrir dans l’IDE pendant l’oral :**
1. `app/src/navigation/AppTabs.tsx` — structure des onglets.  
2. `app/src/hooks/useMatchDetails.ts` — fetch FotMob + polling.  
3. `app/src/screens/ProgrammeScreen/index.tsx` — liste saison filtrée.

**Phrase :** « Le frontend est découpé screens / hooks / services : lisible, testable, évolutif. »

---

## 7. Backend — 3 concepts + extraits (2 min)

### Concept 1 — Routers domaine
`/auth`, `/users`, `/matches`, `/news`, `/community` sous préfixe `/api/v1`.

### Concept 2 — Sécurité JWT + bcrypt
Register/login → hash bcrypt → token HS256 Bearer.

### Concept 3 — Adaptateurs externes + mocks
`integrations/football.py` et `news.py` isolent les APIs tierces ; fallback si panne.

**Extraits à ouvrir :**
1. `backend/app/main.py` — montage des routers.  
2. `backend/app/routers/auth.py` — register/login.  
3. `backend/app/models/` ou `schemas/` — modèles + validation Pydantic.

**Tests :** `cd backend && python -m pytest tests/` → **5/5**.  
Couvre health, inscription → JWT → profil, contrat matches.

---

## 8. API & intégrations (1 min 30)

### API interne THE RED
- Contrats documentés dans le README + Swagger `/docs`.  
- Tests d’intégration Pytest = preuve que l’API répond au contrat.

### Intégrations externes
| Source | Usage |
|---|---|
| **FotMob** | Programme, Live (score, events, stats, compos), classement PL |
| **OneFootball / news** | Fil club (micro-service auxiliaire possible) |
| **YouTube** | Highlights / vidéos club |
| **Firebase (optionnel)** | Compteurs d’engagement Live |

**Comment tu testes une intégration :**  
« Je vérifie le statut HTTP, je parse vers un type interne (`LiveMatch`, `UnitedProgrammeMatch`), je cache, et je dégrade proprement si l’API tombe. »

---

## 9. Démo guidée (3–4 min) — ordre recommandé

1. **Home** — prochain match + card classement PL.  
2. **Programme** — filtres Tous / À venir / Joués + compétitions.  
3. **Live** — si pas de match live : prochain + récents ; ouvrir un match → Stats / Compos / H2H.  
4. **Mon XI** — composition United sur le terrain.  
5. **Vidéos** — un highlight.  
6. **Backend** — montrer Swagger ou résultat pytest.

Si le réseau bloque FotMob : expliquer le cache / fallback ; montrer le code du parseur.

---

## 10. Limites & roadmap (30 s — honnêteté = points)

« Limites actuelles : dépendance aux APIs tierces, JWT sans refresh token, community encore perfectible côté UX.  
Prochaines étapes : Redis cache, refresh tokens, notifications push match kickoff, tests E2E Detox/Maestro. »

---

## 11. Questions fréquentes (prépare 2 phrases chacune)

**Q : Pourquoi pas NestJS / Django ?**  
« FastAPI offre async natif, perf, et génération OpenAPI — idéal pour un MVP API-first en Python. »

**Q : Pourquoi FotMob et pas seulement ta BDD ?**  
« Postgres stocke le métier (users, community). FotMob fournit le calendrier live riche. L’adaptateur + cache isolent le client. »

**Q : Sécurité des mots de passe ?**  
« bcrypt avec salt ; jamais de plaintext ; JWT signé et expiré. »

**Q : Comment gérer un changement de format API externe ?**  
« Les parseurs (`fotmobLiveMatchDetails`, `fotmobClubApi`) centralisent le mapping ; un seul endroit à corriger. »

**Q : Qu’est-ce qui est en production vs mock ?**  
« Auth/community/matches/news via FastAPI + Postgres. Enrichissement sportif live via FotMob côté mobile, avec possibilité de remonter tout derrière le backend plus tard. »

**Q : Comment as-tu géré le versionning ?**  
« Branche `main` sur GitHub, commits conventionnels, README à jour, secrets exclus du dépôt. »

---

## 12. Checklist 5 minutes avant

- [ ] Expo lance sans erreur rouge  
- [ ] `docker compose` ou API up **ou** pytest déjà passé à montrer  
- [ ] GitHub ouvert sur le README  
- [ ] IDE prêt sur `AppTabs.tsx`, `auth.py`, `useMatchDetails.ts`  
- [ ] Ce fichier ouvert en second écran  
- [ ] Respire ; parle lentement ; si tu bloques : « Je vais ouvrir le fichier et expliquer. »

---

## 13. Phrase de clôture

« THE RED montre une architecture 3-tiers complète, un MVP aligné sur des user stories fans United, des choix techniques justifiés, des tests d’API, et une documentation claire. Merci — je suis prêt pour vos questions. »
