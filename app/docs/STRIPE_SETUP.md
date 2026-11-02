# Connecter ton compte Stripe à GOALYA

## 1. Clés Stripe (Dashboard)

1. Ouvre [https://dashboard.stripe.com](https://dashboard.stripe.com) et connecte-toi.
2. Active le **mode Test** (interrupteur en haut).
3. **Développeurs → Clés API** :
   - **Clé publiable** `pk_test_…` → app `.env` : `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Clé secrète** `sk_test_…` → `server/.env` : `STRIPE_SECRET_KEY`

## 2. Fichier `app/.env`

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# Optionnel si Metro détecte ton IP automatiquement (même Wi‑Fi) :
# EXPO_PUBLIC_API_URL=http://192.168.x.x:4242
```

Sur **émulateur Android** : `EXPO_PUBLIC_API_URL=http://10.0.2.2:4242`  
Sur **simulateur iOS** : `http://localhost:4242` suffit souvent.

## 3. Fichier `server/.env`

Copie `server/.env.example` ou édite `server/.env` :

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # optionnel en local
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Compte de service Firebase

1. [Console Firebase](https://console.firebase.google.com) → projet **goalya**
2. Paramètres → **Comptes de service** → **Générer une nouvelle clé privée**
3. Enregistre le JSON sous `server/firebase-service-account.json`

## 4. Lancer le serveur Stripe

```powershell
cd c:\Users\PC\GOALYA\app\server
npm install
npm run dev
```

Vérifie : [http://localhost:4242/health](http://localhost:4242/health) → `{"ok":true}`

## 5. App mobile (obligatoire : build natif)

Stripe **ne fonctionne pas dans Expo Go**.

```powershell
cd c:\Users\PC\GOALYA\app
npx expo run:ios
# ou
npx expo run:android
```

Puis `npx expo start -c` si besoin.

## 6. Tester un achat FP

1. Connecte-toi dans l’app (Firebase Auth).
2. **Fantasy** → ouvrir le modal budget / packs FP.
3. Carte test Stripe : `4242 4242 4242 4242` · date future · CVC quelconque.

## Webhook (production)

1. Stripe → **Développeurs → Webhooks** → ajouter endpoint `https://api.tondomaine.com/stripe/webhook`
2. Événement : `payment_intent.succeeded`
3. Copie le secret `whsec_…` dans `STRIPE_WEBHOOK_SECRET`

En local, le crédit FP passe surtout par `/stripe/fp-fulfill` après le Payment Sheet.
