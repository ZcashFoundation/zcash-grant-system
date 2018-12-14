const fs = require('fs');
const webpack = require('webpack');
const nodemon = require('nodemon');
const rimraf = require('rimraf');
const webpackConfig = require('../config/webpack.config.js')(
  process.env.NODE_ENV || 'development',
);
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const express = require('express');
const paths = require('../config/paths');
const { logMessage } = require('./utils');

const app = express();

const WEBPACK_PORT =
  process.env.WEBPACK_PORT ||
  (!isNaN(Number(process.env.PORT)) ? Number(process.env.PORT) + 1 : 3001);

const start = async () => {
  rimraf.sync(paths.clientBuild);
  rimraf.sync(paths.serverBuild);

  const [clientConfig, serverConfig] = webpackConfig;
  clientConfig.entry.bundle = [
    `webpack-hot-middleware/client?path=http://localhost:${WEBPACK_PORT}/__webpack_hmr`,
    ...clientConfig.entry.bundle,
  ];

  clientConfig.output.hotUpdateMainFilename = 'updates/[hash].hot-update.json';
  clientConfig.output.hotUpdateChunkFilename = 'updates/[id].[hash].hot-update.js';

  const publicPath = clientConfig.output.publicPath;
  clientConfig.output.publicPath = `http://localhost:${WEBPACK_PORT}${publicPath}`;
  serverConfig.output.publicPath = `http://localhost:${WEBPACK_PORT}${publicPath}`;

  const multiCompiler = webpack([clientConfig, serverConfig]);
  const clientCompiler = multiCompiler.compilers[0];
  const serverCompiler = multiCompiler.compilers[1];

  serverCompiler.hooks.compile.tap('_', () => logMessage('Server compiling...', 'info'));
  clientCompiler.hooks.compile.tap('_', () => logMessage('Client compiling...', 'info'));

  const watchOptions = {
    ignored: /node_modules/,
    stats: clientConfig.stats,
  };

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    return next();
  });

  const devMiddleware = webpackDevMiddleware(multiCompiler, {
    publicPath: clientConfig.output.publicPath,
    stats: clientConfig.stats,
    watchOptions,
  });
  app.use(devMiddleware);
  app.use(webpackHotMiddleware(clientCompiler));
  app.use('/static', express.static(paths.clientBuild));
  app.listen(WEBPACK_PORT);

  // await first build...
  await new Promise((res, rej) => devMiddleware.waitUntilValid(() => res()));

  const script = nodemon({
    script: `${paths.serverBuild}/server.js`,
    watch: [paths.serverBuild],
    verbose: true,
  });

  // uncomment to see nodemon details
  // script.on('log', x => console.log(`LOG `, x.colour));

  script.on('crash', () =>
    logMessage(
      'Server crashed, will attempt to restart after changes. Waiting...',
      'error',
    ),
  );

  script.on('restart', () => {
    logMessage('Server restarted.', 'warning');
  });

  script.on('error', () => {
    logMessage('An error occured attempting to run the server. Exiting', 'error');
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log(' Dev exited, see you next time.');
    process.exit();
  });
};

start();
