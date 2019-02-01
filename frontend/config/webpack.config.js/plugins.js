const webpack = require('webpack');
const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ModuleDependencyWarning = require('./module-dependency-warning');
const WebappWebpackPlugin = require('webapp-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');

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
      appName: 'ZF Grants',
      appDescription: 'Decentralized funding for Blockchain ecosystem improvements',
      developerName: 'ZF Grants',
      developerURL: 'https://grants.zfnd.org/about',
      background: '#ffffff',
      theme_color: '#CF8A00',
    },
  }),
  new CopyWebpackPlugin([
    {
      from: 'client/static/locales/**/*.json',
      transformPath(targetPath, absolutePath) {
        const match = targetPath.match(/locales\/(.+)\/(.+\.json)$/);
        return `locales/${match[1]}/${match[2]}`;
      },
    },
  ]),
  new LoadablePlugin(),
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
