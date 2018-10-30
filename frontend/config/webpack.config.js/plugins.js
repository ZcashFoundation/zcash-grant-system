const webpack = require('webpack');
const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ModuleDependencyWarning = require('./module-dependency-warning');
const WebappWebpackPlugin = require('webapp-webpack-plugin');

const env = require('../env')();
const paths = require('../paths');

const shared = [new ModuleDependencyWarning()];

const client = [
  new webpack.DefinePlugin(env.stringified),
  new webpack.DefinePlugin({
    __SERVER__: 'false',
    __CLIENT__: 'true',
  }),
  new MiniCssExtractPlugin({
    filename:
      process.env.NODE_ENV === 'development' ? '[name].css' : '[name].[hash:8].css',
    chunkFilename:
      process.env.NODE_ENV === 'development'
        ? '[name].chunk.css'
        : '[name].[chunkhash:8].chunk.css',
  }),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new ManifestPlugin({
    fileName: 'manifest.json',
    // fixes initial-only writing from WriteFileWebpackPlugin
    writeToFileEmit: true,
  }),
  new WebappWebpackPlugin({
    logo: path.resolve(paths.srcClient, 'static/images/favicon.png'),
    cache: true,
    inject: false,
    favicons: {
      appName: 'Grant.io',
      appDescription: 'Decentralized funding for Blockchain ecosystem improvements',
      developerName: 'Grant.io',
      developerURL: 'https://grant.io/about',
      background: '#ffffff',
      theme_color: '#ffffff',
    },
  }),
  // this allows the server access to the dependency graph
  // so it can find which js/css to add to initial page
  new StatsWriterPlugin({
    fileName: 'stats.json',
    fields: null,
    transform(data) {
      const trans = {};
      trans.publicPath = data.publicPath;
      trans.modules = data.modules.map(m => ({
        id: m.id,
        chunks: m.chunks,
        reasons: m.reasons,
      }));
      trans.chunks = data.chunks.map(c => ({
        id: c.id,
        files: c.files,
        origins: c.origins,
      }));
      return JSON.stringify(trans, null, 2);
    },
  }),
];

const server = [
  new webpack.DefinePlugin({
    __SERVER__: 'true',
    __CLIENT__: 'false',
  }),
];

module.exports = {
  shared,
  client,
  server,
};
