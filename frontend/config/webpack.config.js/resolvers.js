const paths = require('../paths');

module.exports = {
  extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
  modules: paths.resolveModules,
  // tsconfig.compilerOptions.paths should sync with these
  alias: {
    contracts: paths.contractsBuild, // truffle build contracts dir
    api: `${paths.srcClient}/api`,
    components: `${paths.srcClient}/components`,
    lib: `${paths.srcClient}/lib`,
    modules: `${paths.srcClient}/modules`,
    pages: `${paths.srcClient}/pages`,
    store: `${paths.srcClient}/store`,
    styles: `${paths.srcClient}/styles`,
    typings: `${paths.srcClient}/typings`,
    utils: `${paths.srcClient}/utils`,
    web3interact: `${paths.srcClient}/web3interact`,
  },
};
