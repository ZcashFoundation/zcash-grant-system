const paths = require('../paths');

module.exports = {
  extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
  modules: paths.resolveModules,
  // tsconfig.compilerOptions.paths should sync with these
  alias: {
    api: `${paths.srcClient}/api`,
    components: `${paths.srcClient}/components`,
    lib: `${paths.srcClient}/lib`,
    modules: `${paths.srcClient}/modules`,
    pages: `${paths.srcClient}/pages`,
    static: `${paths.srcClient}/static`,
    store: `${paths.srcClient}/store`,
    styles: `${paths.srcClient}/styles`,
    typings: `${paths.srcClient}/typings`,
    types: `${paths.srcTypes}`,
    utils: `${paths.srcClient}/utils`,
  },
};
