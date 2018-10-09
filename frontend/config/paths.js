const path = require('path');
const fs = require('fs');
const findRoot = require('find-root');

const appDirectory = fs.realpathSync(process.cwd());
// truffle exec cwd moves to called js, so make sure we are on root
const appRoot = findRoot(appDirectory);
const resolveApp = relativePath => path.resolve(appRoot, relativePath);

const paths = {
  clientBuild: resolveApp('build/client'),
  contractsBase: resolveApp('../contract'),
  contractsBuild: resolveApp('../contract/build/contracts'),
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
