import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Expo/Metro n’intègre `EXPO_PUBLIC_*` au bundle que si l’accès est statique (`process.env.EXPO_PUBLIC_XXX`), pas `process.env[key]`. */
function trimEnv(v: string | undefined): string | undefined {
  const t = typeof v === 'string' ? v.trim() : '';
  return t || undefined;
}

/**
 * Identifiants [MetaPerson / Avatar SDK](https://docs.metaperson.avatarsdk.com/getting_started#developer-credentials).
 * Ne mets pas le secret dans `app.json` : uniquement `.env` / EAS Secrets.
 * En production, évite d’embarquer `clientSecret` dans l’app : passe par un backend qui renvoie un `accessToken` court.
 */
export function getMetaPersonCredentials(): { clientId: string; clientSecret: string } {
  const extra = Constants.expoConfig?.extra as { avatarSdkClientId?: string } | undefined;
  const clientId =
    trimEnv(process.env.EXPO_PUBLIC_AVATARSDK_CLIENT_ID) ?? extra?.avatarSdkClientId?.trim() ?? '';
  const clientSecret = trimEnv(process.env.EXPO_PUBLIC_AVATARSDK_CLIENT_SECRET) ?? '';
  return { clientId, clientSecret };
}

/** Version mobile du créateur (recommandée iPhone / iPad / Android). @see doc MetaPerson « Creator Versions ». */
export const METAPERSON_IFRAME_MOBILE = 'https://mobile.metaperson.avatarsdk.com/generator';

/** Version bureau (navigateur desktop). */
export const METAPERSON_IFRAME_DESKTOP = 'https://metaperson.avatarsdk.com/iframe.html';

/**
 * URL de l’iframe MetaPerson.
 * Sur iOS / Android on utilise par défaut la version **Mobile** (le desktop dans une WebView iPad reste souvent vide).
 */
export function getMetaPersonIframeSrc(): string {
  const fromEnv = trimEnv(process.env.EXPO_PUBLIC_METAPERSON_IFRAME_URL);
  if (fromEnv) return fromEnv;
  const fromExtra = (Constants.expoConfig?.extra as { metaPersonIframeUrl?: string } | undefined)
    ?.metaPersonIframeUrl?.trim();
  if (fromExtra) return fromExtra;
  if (Platform.OS === 'ios' || Platform.OS === 'android') return METAPERSON_IFRAME_MOBILE;
  return METAPERSON_IFRAME_DESKTOP;
}

/** `baseUrl` du WebView : aligné sur l’origine de l’iframe pour cookies / postMessage. */
export function getMetaPersonWebViewBaseUrl(iframeSrc: string): string {
  try {
    return new URL(iframeSrc).origin;
  } catch {
    return 'https://metaperson.avatarsdk.com';
  }
}

/**
 * Page locale embarquant l’iframe + pont `postMessage` → React Native.
 * @see https://docs.metaperson.avatarsdk.com/web_integration
 */
export function buildMetaPersonBridgeHtml(iframeSrc: string, clientId: string, clientSecret: string): string {
  const credJson = JSON.stringify({ clientId, clientSecret });
  const iframeSrcJson = JSON.stringify(iframeSrc);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
  <style>*{margin:0;padding:0}html,body,#wrap{height:100%;width:100%;}</style>
</head>
<body>
  <div id="wrap" style="display:flex;height:100%;width:100%;">
    <iframe
      id="mp_iframe"
      allow="camera; microphone; fullscreen"
      style="flex:1;border:0;width:100%;height:100%;"
    ></iframe>
  </div>
  <script>
(function () {
  var IFRAME_SRC = ${iframeSrcJson};
  var IS_MOBILE = IFRAME_SRC.indexOf('mobile.metaperson') !== -1;
  var el = document.getElementById('mp_iframe');
  var iframeLoaded = false;
  if (el) {
    el.addEventListener('load', function () {
      iframeLoaded = true;
      toRn({ source: 'goalya_bridge', eventName: 'iframe_loaded' });
      // Sur iOS, on ne reçoit parfois pas l’event metaperson_creator_loaded.
      // On tente donc l’auth + export params directement vers le contenu de l’iframe.
      trySendAuth('on_iframe_load');
    });
    el.addEventListener('error', function () {
      reportError('Échec de chargement de l’iframe MetaPerson');
    });
    el.src = IFRAME_SRC;
  } else {
    reportError('Iframe introuvable dans le bridge HTML');
  }
  setTimeout(function () {
    if (!iframeLoaded) {
      reportError('Timeout: l’iframe MetaPerson ne se charge pas (réseau / blocage / cookies)');
    }
  }, 12000);
  var CRED = ${credJson};
  function reportError(message) {
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ source: 'goalya_bridge', eventName: 'bridge_error', message: String(message || '') })
        );
      }
    } catch (e) {}
  }
  function toRn(obj) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      } catch (e) {}
    }
  }
  function exportParamsMessage() {
    var m = {
      eventName: 'set_export_parameters',
      format: 'glb',
      lod: 1,
      textureProfile: '1K.jpg',
      useZip: false,
    };
    if (!IS_MOBILE) {
      m.headOnly = 'false';
      m.removeNeckLayers = 0;
    }
    return m;
  }
  function trySendAuth(reason) {
    try {
      var target = el && el.contentWindow ? el.contentWindow : null;
      if (!target || !target.postMessage) return false;
      target.postMessage({ eventName: 'authenticate', clientId: CRED.clientId, clientSecret: CRED.clientSecret }, '*');
      target.postMessage(exportParamsMessage(), '*');
      toRn({ source: 'goalya_bridge', eventName: 'auth_sent', reason: reason || '', mobile: IS_MOBILE });
      return true;
    } catch (e) {
      return false;
    }
  }
  window.addEventListener('error', function (ev) {
    reportError(ev && ev.message ? ev.message : 'Erreur JavaScript (bridge)');
  });
  window.addEventListener('unhandledrejection', function (ev) {
    reportError('Promise rejetée (bridge)');
  });
  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || d.source !== 'metaperson_creator') return;
    toRn(d);
    if (d.eventName === 'metaperson_creator_loaded' && ev.source && ev.source.postMessage) {
      ev.source.postMessage(
        { eventName: 'authenticate', clientId: CRED.clientId, clientSecret: CRED.clientSecret },
        '*'
      );
      ev.source.postMessage(exportParamsMessage(), '*');
    }
  });

  // Retry auth pendant quelques secondes (iOS / timing / cookies).
  var tries = 0;
  var authTimer = setInterval(function () {
    tries += 1;
    var ok = trySendAuth('retry_' + tries);
    if (ok || tries >= 8) clearInterval(authTimer);
  }, 1000);
})();
  <\/script>
</body>
</html>`;
}
