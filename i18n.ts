import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import lt from './locales/lt.json';

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
  AsyncStorage.setItem('language', lng);
});

// Load saved language
AsyncStorage.getItem('language').then(savedLanguage => {
  if (savedLanguage) {
    i18n.changeLanguage(savedLanguage);
  }
});

export default i18n;
