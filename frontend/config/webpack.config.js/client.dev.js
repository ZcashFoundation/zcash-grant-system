const baseConfig = require('./client.base');
const webpack = require('webpack');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isTsCheck = process.env.NO_DEV_TS_CHECK !== 'true';

const config = {
  ...baseConfig,
  plugins: [
    new WriteFileWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    ...baseConfig.plugins,
    isTsCheck && new ForkTsCheckerWebpackPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../../dev-client-bundle-analysis.html',
      defaultSizes: 'gzip',
      openAnalyzer: false,
    }),
  ].filter(Boolean),
  mode: 'development',
  devtool: 'cheap-module-inline-source-map',
  performance: {
    hints: false,
  },
};

module.exports = config;
