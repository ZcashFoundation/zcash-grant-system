const webpack = require('webpack');
const rimraf = require('rimraf');

const webpackConfig = require('../config/webpack.config.js')(
  process.env.NODE_ENV || 'production',
);
const paths = require('../config/paths');
const { logMessage } = require('./utils');

const build = async () => {
  rimraf.sync(paths.clientBuild);
  rimraf.sync(paths.serverBuild);

  logMessage('Compiling, please wait...');

  const [clientConfig, serverConfig] = webpackConfig;
  const multiCompiler = webpack([clientConfig, serverConfig]);
  multiCompiler.run((error, stats) => {
    if (stats) {
      console.log(stats.toString(clientConfig.stats));
    }
    if (error) {
      logMessage('Compile error', error);
      console.error(error);
    }
  });
};

build();
