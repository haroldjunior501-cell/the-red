# Connexion Google (GOALYA)

## Ton cas actuel

Dans `.env` tu as déjà :

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=27648052527-....apps.googleusercontent.com
```

Il manque :

```env
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

Sur **iPhone / iPad**, le client **Web seul ne suffit pas**. Il faut un **client OAuth iOS** (autre identifiant).

## Étapes (5 minutes)

### 1. Firebase — ajouter l’app iOS (si pas encore fait)

1. [Firebase Console](https://console.firebase.google.com/) → projet GOALYA
2. **Paramètres du projet** (engrenage) → **Ajouter une application** → **iOS**
3. **Bundle ID** : `com.goalya.app` (identique à `app.json`)
4. Télécharge `GoogleService-Info.plist` (optionnel pour Expo, utile pour retrouver l’ID)

### 2. Récupérer le client ID iOS

**Option A — Google Cloud (recommandé)**

1. [Google Cloud — Identifiants](https://console.cloud.google.com/apis/credentials) (même projet que Firebase)
2. **Créer des identifiants** → **ID client OAuth**
3. Type : **iOS**
4. Nom : `GOALYA iOS`
5. **Identifiant du bundle** : `com.goalya.app`
6. Copie l’**ID client** (format `XXXX.apps.googleusercontent.com`)

**Option B — Fichier plist Firebase**

Dans `GoogleService-Info.plist`, cherche :

```xml
<key>CLIENT_ID</key>
<string>VOTRE_ID_IOS.apps.googleusercontent.com</string>
```

### 3. Coller dans `.env`

```env
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=COLLE_ICI_L_ID_IOS
```

Ne réutilise pas le client Web pour cette ligne.

### 4. Rebuild natif (obligatoire après changement `.env` / schéma URL)

```bash
npx expo run:ios
```

Un simple `expo start` ne met pas à jour le schéma Google dans l’app installée.

## Erreur 400 `invalid_request` (écran « Accès bloqué »)

Causes fréquentes :

1. **Expo Go sur iPad/iPhone** — le client iOS est lié à `com.goalya.app`, pas à Expo Go → Google refuse la requête. Utilise `npx expo run:ios`.
2. **Mauvaise redirect URI** — avec un client iOS, Google attend  
   `com.googleusercontent.apps.<ID>:/oauthredirect`  
   (pas `goalya://oauthredirect`). C’est géré dans `authService.ts` + `app.config.js` (`CFBundleURLSchemes`).
3. **App OAuth en mode test** — dans Google Cloud → **Écran de consentement OAuth**, ajoute `haroldjunior501@gmail.com` (ou ton compte) comme **utilisateur test**.

## Expo Go vs development build

| Environnement | Bundle utilisé | Client Google |
|---------------|----------------|---------------|
| **Development build** (`expo run:ios`) | `com.goalya.app` | Client iOS avec ce bundle |
| **Expo Go** | `host.exp.Exponent` | Client iOS séparé pour Expo Go (déconseillé) |

Pour GOALYA, préfère un **build de dev** avec `com.goalya.app`.

## Android (plus tard)

Même principe avec `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` et le package `com.goalya.app`.
