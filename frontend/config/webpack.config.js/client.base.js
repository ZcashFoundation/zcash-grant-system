const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const paths = require('../paths');
const { client: clientLoaders } = require('./loaders');
const resolvers = require('./resolvers');
const plugins = require('./plugins');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  name: 'client',
  target: 'web',
  entry: {
    bundle: [path.join(paths.srcClient, 'index.tsx')],
  },
  output: {
    path: path.join(paths.clientBuild, paths.publicPath),
    filename: 'bundle.js',
    publicPath: paths.publicPath,
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
  },
  module: {
    rules: clientLoaders,
  },
  resolve: { ...resolvers },
  plugins: [...plugins.shared, ...plugins.client],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          // otherwise BN typecheck gets mangled during minification
          keep_fnames: true,
        },
      }),
    ],
    namedModules: true,
    noEmitOnErrors: false,
    // concatenateModules: true,
    // below settings bundle all vendor css in one file
    // this allows SSR to render a reference to the hashed css
    // if commons is split by module then flickering may occur on load
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  stats: {
    cached: false,
    cachedAssets: false,
    chunks: false,
    chunkModules: false,
    colors: true,
    hash: false,
    modules: false,
    reasons: false,
    timings: true,
    version: false,
  },
};
