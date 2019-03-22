import express from 'express';
import * as cors from 'cors';
import * as path from 'path';
import chalk from 'chalk';
import manifestHelpers from 'express-manifest-helpers';
import * as bodyParser from 'body-parser';
import expressWinston from 'express-winston';
import i18nMiddleware from 'i18next-express-middleware';
import * as Sentry from '@sentry/node';
import enforce from 'express-sslify';

import '../config/env';
// @ts-ignore
import * as paths from '../config/paths';
import log from './log';
import serverRender from './render';
import i18n from './i18n';

process.env.SERVER_SIDE_RENDER = 'true';
const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.SENTRY_RELEASE,
  environment: process.env.NODE_ENV,
});

const app = express();

// ssl
if (!isDev && !process.env.DISABLE_SSL) {
  log.info('PRODUCTION mode, enforcing HTTPS redirect');
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// sentry
app.use(Sentry.Handlers.requestHandler());

// log requests
app.use(expressWinston.logger({ winstonInstance: log }));

// i18next
app.use(i18nMiddleware.handle(i18n));

if (isDev) {
  app.use(
    paths.publicPath,
    express.static(path.join(paths.clientBuild, paths.publicPath)),
  );
  app.use('/favicon.ico', (_, res) => {
    res.send('');
  });
} else {
  log.warn('PRODUCTION mode, serving static assets from node server');
  app.use(
    paths.publicPath,
    express.static(path.join(paths.clientBuild, paths.publicPath)),
  );
  app.use('/favicon.ico', (_, res) => {
    res.send('');
  });
}

app.use(cors());
app.use(bodyParser.json());

const manifestPath = path.join(paths.clientBuild, paths.publicPath);

app.use(
  manifestHelpers({
    manifestPath: `${manifestPath}/manifest.json`,
    cache: process.env.NODE_ENV === 'production',
    // prependPath: '//cdn.example/assets' // if statics are elsewhere
  }),
);

app.use(serverRender());

app.use(Sentry.Handlers.errorHandler());
app.use(expressWinston.errorLogger({ winstonInstance: log }));

app.listen(process.env.PORT || 3000, () => {
  const port = process.env.PORT || 3000;
  if (isDev) {
    console.log(chalk.blue(`App is running: 🌎 http://localhost:${port} `));
  } else {
    log.info(`Server started on port ${port}`);
  }
});

export default app;
