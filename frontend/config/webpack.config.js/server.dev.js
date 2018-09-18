const baseConfig = require('./server.base');
const webpack = require('webpack');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isTsCheck = process.env.NO_DEV_TS_CHECK !== 'true';

const config = {
  ...baseConfig,
  plugins: [
    new WriteFileWebpackPlugin(),
    ...baseConfig.plugins,
    isTsCheck && new ForkTsCheckerWebpackPlugin(),
  ].filter(Boolean),
  mode: 'development',
  performance: {
    hints: false,
  },
};

module.exports = config;
