# Build & distribution — beta preview

## Prérequis

- Compte [Expo](https://expo.dev) + `eas-cli`
- `.env` rempli (les `EXPO_PUBLIC_*` sont lus au **build** EAS si configurés dans les secrets ou le profil)

```powershell
cd c:\Users\PC\GOALYA\app
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Pas besoin d’installer `eas` en global : les scripts npm utilisent `npx eas-cli@latest`.

### Secrets EAS (recommandé pour distribuer sans fuiter le `.env`)

Dans le dashboard Expo → projet → **Environment variables** → profil `preview` :

- Toutes les `EXPO_PUBLIC_FIREBASE_*`
- `EXPO_PUBLIC_FIREBASE_DATABASE_URL`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (+ Android)
- `EXPO_PUBLIC_LIVESCORE_KEY` / `SECRET`
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_…`)
- `EXPO_PUBLIC_API_URL` (IP LAN ou URL API joignable par les testeurs)
- `EXPO_PUBLIC_LAUNCH_MODE=1`

---

## Builds

### Android (APK interne)

```powershell
npm run build:preview:android
# equivalent : npx eas-cli@latest build --profile preview --platform android
```

- Télécharger l’APK depuis expo.dev  
- Partager le lien (Google Drive, etc.)  
- Testeurs : autoriser « sources inconnues » si besoin  

### iOS (TestFlight interne)

```powershell
npm run build:preview:ios
```

- Profil `preview` dans `eas.json` : `distribution: internal`  
- Inviter les testeurs dans App Store Connect / TestFlight  

### Build local (toi uniquement)

```powershell
npx expo run:ios
npx expo run:android
```

Utile pour débugger ; pas idéal pour 10+ testeurs.

---

## Après modification du `.env`

Les variables `EXPO_PUBLIC_*` sont **figées dans le binaire** au build.

1. Modifier `.env` ou secrets EAS  
2. **Nouveau build preview**  
3. Redistribuer le lien  

Un simple `expo start` ne met pas à jour les testeurs qui ont l’APK.

---

## API URL pour testeurs distants

| Situation | `EXPO_PUBLIC_API_URL` |
|-----------|------------------------|
| Même Wi‑Fi que ton PC | `http://192.168.x.x:4242` (`npm run beta:server` affiche l’IP) |
| Testeurs ailleurs | URL HTTPS publique (VPS, ngrok, Railway…) |

Sans URL joignable : Fantasy conversion FP / paiement carte **échouent**.

### Tunnel rapide pour beta distante

```powershell
# Terminal 1
npm run beta:server

# Terminal 2
cloudflared tunnel --url http://localhost:4242
```

Utiliser l’URL `https://....trycloudflare.com` dans `EXPO_PUBLIC_API_URL`, puis créer un **nouveau build preview**.

---

## Ce qu’il ne faut pas distribuer

- **Expo Go** seul (pas Google natif, pas Stripe)  
- Build sans `EXPO_PUBLIC_LAUNCH_MODE` si tu veux Tableau KO + Arena ouverts en beta  
