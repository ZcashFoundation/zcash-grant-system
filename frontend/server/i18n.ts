import path from 'path';
import i18n from 'i18next';
import Backend from 'i18next-node-fs-backend';
import { LanguageDetector } from 'i18next-express-middleware';

// @ts-ignore
import * as paths from '../config/paths';

const publicPath = path.join(paths.clientBuild, paths.publicPath);

// NOTE: maintain parity with client/i18n.ts
i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    whitelist: ['en'],
    fallbackLng: 'en',

    ns: ['common'],
    defaultNS: 'common',

    debug: false,

    interpolation: {
      // not needed for react
      escapeValue: false,
    },

    backend: {
      loadPath: publicPath + 'locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
    },
  });

export default i18n;
