const paths = require('../config/paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { client: clientLoaders } = require('../config/webpack.config.js/loaders');
const { alias } = require('../config/webpack.config.js/resolvers');

module.exports = (baseConfig, env, defaultConfig) => {
  const rules = [...baseConfig.module.rules, ...clientLoaders];
  baseConfig.module.rules = rules;
  baseConfig.resolve.extensions.push('.ts', '.tsx', '.json', '.less');
  baseConfig.resolve.alias = alias;
  baseConfig.plugins.push(new MiniCssExtractPlugin());
  return baseConfig;
};
