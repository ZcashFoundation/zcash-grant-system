import i18n from 'i18next';

// NOTE: maintain parity with server/i18n.ts
i18n.init({
  whitelist: ['en'],
  fallbackLng: 'en',

  ns: ['common'],
  defaultNS: 'common',

  interpolation: {
    // not needed for react
    escapeValue: false,
  },
});

export default i18n;
