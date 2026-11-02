import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en';
import fr from './locales/fr';
import es from './locales/es';
import pt from './locales/pt';
import ar from './locales/ar';

const SUPPORTED = ['en', 'fr', 'es', 'pt', 'ar'] as const;
type SupportedLang = (typeof SUPPORTED)[number];

function detectLanguage(): SupportedLang {
  try {
    const locales = getLocales();
    for (const locale of locales) {
      const lang = locale.languageCode?.toLowerCase() as SupportedLang | undefined;
      if (lang && (SUPPORTED as readonly string[]).includes(lang)) return lang;
    }
  } catch {
    // expo-localization unavailable — fallback
  }
  return 'en';
}

const detectedLang = detectLanguage();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    lng: detectedLang,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      pt: { translation: pt },
      ar: { translation: ar },
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

export default i18n;
export { detectedLang };
