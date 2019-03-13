const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';

require('dotenv').config();

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: {
    bundle: './src/index.tsx',
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 3500,
    contentBase: './build',
    hot: true,
    historyApiFallback: {
      disableDotRule: true,
    },
  },
  module: {
    rules: [
      // typescript
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                'react-hot-loader/babel',
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-class-properties',
                ['import', { libraryName: 'antd', style: true }],
                [
                  'import',
                  {
                    libraryName: 'ant-design-pro',
                    libraryDirectory: 'lib',
                    style: true,
                    camel2DashComponentName: false,
                  },
                  'antdproimport',
                ],
              ],
              presets: ['@babel/react', ['@babel/env', { useBuiltIns: 'entry' }]],
            },
          },
          {
            loader: 'ts-loader',
            options: { transpileOnly: isDev },
          },
        ],
      },
      // less
      {
        test: /\.less$/,
        // exclude: [/node_modules/],
        use: [
          isDev && 'style-loader',
          !isDev && MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: { javascriptEnabled: true },
          },
        ].filter(Boolean),
      },
      // images (url loader)
      {
        test: /\.(png|jpe?g|gif)$/,
        loader: require.resolve('url-loader'),
        options: {
          limit: 2048,
          name: 'assets/[name].[hash:8].[ext]',
        },
      },
      // svg
      {
        test: /\.svg$/,
        issuer: {
          test: /\.tsx?$/,
        },
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [{ inlineStyles: { onlyMatchedOnce: false } }],
              },
            },
          },
        ], // svg -> react component
      },
      // other files (file loader)
      {
        exclude: [/\.(js|ts|tsx|css|less|mjs|html|json|ejs)$/],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
    // resolveModules = [ './src', path.join(__dirname, 'node_modules')]
    // tsconfig.compilerOptions.paths should sync with these
    alias: {
      src: path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
      styles: path.resolve(__dirname, 'src/styles'),
      util: path.resolve(__dirname, 'src/util'),
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(['build']),
    new webpack.DefinePlugin({
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL),
    }),
    new HtmlWebpackPlugin({
      template: './src/static/index.html',
    }),
    new MiniCssExtractPlugin({
      filename:
        process.env.NODE_ENV === 'development' ? '[name].css' : '[name].[hash:8].css',
      chunkFilename:
        process.env.NODE_ENV === 'development'
          ? '[name].chunk.css'
          : '[name].[chunkhash:8].chunk.css',
    }),
  ],
};
