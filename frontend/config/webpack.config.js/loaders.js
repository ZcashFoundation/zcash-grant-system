const hash = require('string-hash');
const _ = require('lodash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === 'development';

const babelPresets = [
  '@babel/react',
  // '@babel/typescript', (using ts-loader)
  ['@babel/env', { useBuiltIns: 'entry', modules: false }],
];

const lessLoader = {
  loader: 'less-loader',
  options: { javascriptEnabled: true },
};

const tsBabelLoaderClient = {
  test: /\.tsx?$/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        plugins: [
          'dynamic-import-webpack', // for client
          'loadable-components/babel',
          'react-hot-loader/babel',
          '@babel/plugin-proposal-object-rest-spread',
          '@babel/plugin-proposal-class-properties',
          ['import', { libraryName: 'antd', style: false }],
        ],
        presets: ['@babel/react', ['@babel/env', { useBuiltIns: 'entry' }]],
      },
    },
    {
      loader: 'ts-loader',
      options: { transpileOnly: isDev },
    },
  ],
};

const tsBabelLoaderServer = {
  test: /\.tsx?$/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        plugins: [
          'dynamic-import-node', // for server
          'loadable-components/babel',
          '@babel/plugin-proposal-object-rest-spread',
          '@babel/plugin-proposal-class-properties',
          ['import', { libraryName: 'antd', style: false }],
        ],
        presets: [
          '@babel/react',
          ['@babel/env', { useBuiltIns: 'entry', targets: { node: 'current' } }],
        ],
      },
    },
    {
      loader: 'ts-loader',
      options: { transpileOnly: isDev },
    },
  ],
};

const cssLoaderClient = {
  test: /\.css$/,
  exclude: [/node_modules/],
  use: [
    isDev && 'style-loader',
    !isDev && MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
    },
  ].filter(Boolean),
};

const lessLoaderClient = {
  test: /\.less$/,
  exclude: [/node_modules/],
  use: [...cssLoaderClient.use, lessLoader],
};

const cssLoaderServer = {
  test: /\.css$/,
  exclude: [/node_modules/],
  use: [
    {
      loader: 'css-loader/locals',
    },
  ],
};

const lessLoaderServer = {
  test: /\.less$/,
  exclude: [/node_modules/],
  use: [...cssLoaderServer.use, lessLoader],
};

const urlLoaderClient = {
  test: /\.(png|jpe?g|gif)$/,
  loader: require.resolve('url-loader'),
  options: {
    limit: 2048,
    name: 'assets/[name].[hash:8].[ext]',
  },
};

const urlLoaderServer = {
  ...urlLoaderClient,
  options: {
    ...urlLoaderClient.options,
    emitFile: false,
  },
};

const fileLoaderClient = {
  // WARNING: this will catch all files except those below
  exclude: [/\.(js|ts|tsx|css|less|mjs|html|json|ejs)$/],
  use: [
    {
      loader: 'file-loader',
      options: {
        name: 'assets/[name].[hash:8].[ext]',
      },
    },
  ],
};

const fileLoaderServer = _.defaultsDeep(
  {
    use: [{ options: { emitFile: false } }],
  },
  fileLoaderClient,
);

const svgLoaderClient = {
  test: /\.svg$/,
  issuer: {
    test: /\.tsx?$/,
  },
  use: ({ resource }) => ({
    loader: '@svgr/webpack',
    options: {
      svgoConfig: {
        plugins: [{
          inlineStyles: {
            onlyMatchedOnce: false
          },
        }, {
          cleanupIDs: {
            prefix: `svg-${hash(resource)}`,
          },
        }],
      },
    },
  }), // svg -> react component
};

const svgLoaderServer = svgLoaderClient;

// Write css files from node_modules to its own vendor.css file
const externalCssLoaderClient = {
  test: /\.css$/,
  include: [/node_modules/],
  use: [
    isDev && 'style-loader',
    !isDev && MiniCssExtractPlugin.loader,
    'css-loader',
  ].filter(Boolean),
};

const externalLessLoaderClient = {
  test: /\.less$/,
  include: [/node_modules/],
  use: [
    isDev && 'style-loader',
    !isDev && MiniCssExtractPlugin.loader,
    'css-loader',
    lessLoader,
  ].filter(Boolean),
};

// Server build needs a loader to handle external .css files
const externalCssLoaderServer = {
  test: /\.css$/,
  include: [/node_modules/],
  loader: 'css-loader/locals',
};

const externalLessLoaderServer = {
  test: /\.less$/,
  include: [/node_modules/],
  use: ['css-loader/locals', lessLoader],
};

const client = [
  {
    // oneOf: first matching rule takes all
    oneOf: [
      tsBabelLoaderClient,
      cssLoaderClient,
      lessLoaderClient,
      svgLoaderClient,
      urlLoaderClient,
      fileLoaderClient,
      externalCssLoaderClient,
      externalLessLoaderClient,
    ],
  },
];

const server = [
  {
    // oneOf: first matching rule takes all
    oneOf: [
      tsBabelLoaderServer,
      cssLoaderServer,
      lessLoaderServer,
      svgLoaderServer,
      urlLoaderServer,
      fileLoaderServer,
      externalCssLoaderServer,
      externalLessLoaderServer,
    ],
  },
];

module.exports = {
  client,
  server,
};
