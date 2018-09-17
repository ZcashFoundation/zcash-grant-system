const baseConfig = require('./server.base');
const webpack = require('webpack');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const config = {
  ...baseConfig,
  plugins: [
    new WriteFileWebpackPlugin(),
    ...baseConfig.plugins,
    new ForkTsCheckerWebpackPlugin(),
  ],
  mode: 'development',
  performance: {
    hints: false,
  },
};

module.exports = config;
