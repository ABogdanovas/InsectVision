import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './locales/en.json';
import lt from './locales/lt.json';
import {globalStorage} from './globalStorage';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: {translation: en},
    lt: {translation: lt},
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {escapeValue: false},
});

i18n.on('languageChanged', lng => {
  globalStorage.set('language', lng);
});

i18n.changeLanguage(globalStorage.getString('language'));

export default i18n;
