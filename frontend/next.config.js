const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { withPlugins } = require('next-compose-plugins');
const images = require('next-images');
const sass = require('@zeit/next-sass');
const css = require('@zeit/next-css');
const less = require('@zeit/next-less');
const typescript = require('@zeit/next-typescript');

const nextConfig = {
  distDir: 'build',
  webpack: (config, options) => {
    config.resolve.symlinks = false;
    config.context = `${__dirname}/client`;

    // Do not run type checking twice:
    if (options.isServer) {
      // config.plugins.push(
      //   new ForkTsCheckerWebpackPlugin({
      //     tsconfig: '../tsconfig.json',
      //     tslint: '../tslint.json'
      //   })
      // );
    }

    if (process.env.ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true
        })
      );
    }

    config.module.rules.push({
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
      test: /\.(graphql|gql)$/
    });

    config.module.rules.push({
      test: /\.(eot|otf|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          publicPath: './',
          outputPath: 'static/',
          name: '[name].[ext]'
        }
      }
    });

    return config;
  }
};

module.exports = withPlugins(
  [
    sass,
    images,
    css,
    [
      less,
      {
        lessLoaderOptions: {
          javascriptEnabled: true
        }
      }
    ],
    typescript
  ],
  nextConfig
);

