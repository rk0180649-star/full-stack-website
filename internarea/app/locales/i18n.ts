import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import es from './es.json';
import fr from './fr.json';
import pt from './pt.json';
import zh from './zh.json';

// Local storage se saved language uthayega, nahi toh English default rahegi
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('preferred_language') || 'en' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      es: { translation: es },
      fr: { translation: fr },
      pt: { translation: pt },
      zh: { translation: zh },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already XSS safe hota hai
    },
  });

export default i18n;