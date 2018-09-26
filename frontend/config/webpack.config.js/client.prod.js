const baseConfig = require('./client.base');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../../prod-client-bundle-analysis.html',
      defaultSizes: 'gzip',
      openAnalyzer: false,
    }),
  ],
  mode: 'production',
  devtool: 'source-map',
};

config.output.filename = 'bundle.[hash:8].js';

module.exports = config;
