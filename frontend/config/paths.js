const path = require('path');
const fs = require('fs');
const findRoot = require('find-root');

const appDirectory = fs.realpathSync(process.cwd());
const appRoot = findRoot(appDirectory);
const resolveApp = relativePath => path.resolve(appRoot, relativePath);

const paths = {
  clientBuild: resolveApp('build/client'),
  dotenv: resolveApp('.env'),
  logs: resolveApp('logs'),
  publicPath: '/static/',
  serverBuild: resolveApp('build/server'),
  srcClient: resolveApp('client'),
  srcServer: resolveApp('server'),
  srcTypes: resolveApp('types'),
};

paths.resolveModules = [
  paths.srcClient,
  paths.srcServer,
  paths.srcTypes,
  resolveApp('node_modules'),
];

module.exports = paths;
