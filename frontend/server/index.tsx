import express from 'express';
import * as cors from 'cors';
import * as path from 'path';
import chalk from 'chalk';
import manifestHelpers from 'express-manifest-helpers';
import * as bodyParser from 'body-parser';
import dotenv from 'dotenv';
import expressWinston from 'express-winston';
import i18nMiddleware from 'i18next-express-middleware';

// @ts-ignore
import * as paths from '../config/paths';
import log from './log';
import serverRender from './render';
import i18n from './i18n';

process.env.SERVER_SIDE_RENDER = 'true';
const isDev = process.env.NODE_ENV === 'development';

dotenv.config();

const app = express();

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
  log.warn('PRODUCTION mode, serving static assets from node server.');
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
