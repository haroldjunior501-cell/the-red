# GOALYA Admin — Stories & Vidéos

Panneau web pour publier le contenu Firebase consommé par l'app mobile.

## Setup

```bash
cd admin-goalya
npm install
cp .env.example .env
# Remplir avec les mêmes clés que EXPO_PUBLIC_FIREBASE_* de l'app
npm run dev
```

## Admin claim (une fois)

Utiliser Firebase Admin SDK pour définir `admin: true` sur le compte équipe :

```js
await admin.auth().setCustomUserClaims('UID_ICI', { admin: true });
```

## Déployer les règles

Depuis le projet Firebase Console ou CLI, déployer :

- `app/firebase/firestore.rules`
- `app/firebase/storage.rules`
- `app/firebase/firestore.indexes.json`
