const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const childProcess = require('child_process');
const dotenv = require('dotenv');
const { logMessage } = require('../bin/utils');

delete require.cache[require.resolve('./paths')];

if (!process.env.NODE_ENV) {
  throw new Error(
    'The process.env.NODE_ENV environment variable is required but was not specified.',
  );
}

// Override local ENV variables with .env
if (fs.existsSync(paths.dotenv)) {
  const envConfig = dotenv.parse(fs.readFileSync(paths.dotenv));
  // tslint:disable-next-line
  for (const k in envConfig) {
    if (process.env[k]) {
      logMessage(`Warning! Over-writing existing ENV Variable ${k}`);
    }
    process.env[k] = envConfig[k];
  }
}

const envProductionRequiredHandler = (envVariable, fallbackValue) => {
  if (!process.env[envVariable]) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `The process.env.${envVariable} environment variable is required but was not specified.`,
      );
    }
    process.env[envVariable] = fallbackValue;
  }
};

envProductionRequiredHandler(
  'PUBLIC_HOST_URL',
  'http://localhost:' + (process.env.PORT || 3000),
);
envProductionRequiredHandler(
  'CROWD_FUND_URL',
  'https://eip-712.herokuapp.com/contract/crowd-fund',
);
envProductionRequiredHandler(
  'CROWD_FUND_FACTORY_URL',
  'https://eip-712.herokuapp.com/contract/factory',
);

if (!process.env.BACKEND_URL) {
  process.env.BACKEND_URL = 'http://localhost:5000';
}

if (!process.env.SENTRY_RELEASE) {
  process.env.SENTRY_RELEASE = childProcess
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();
}

const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter);

module.exports = () => {
  const raw = {
    BACKEND_URL: process.env.BACKEND_URL,
    CROWD_FUND_FACTORY_URL: process.env.CROWD_FUND_FACTORY_URL,
    CROWD_FUND_URL: process.env.CROWD_FUND_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    PUBLIC_HOST_URL: process.env.PUBLIC_HOST_URL,
    SENTRY_DSN: process.env.SENTRY_DSN || null,
    SENTRY_RELEASE: process.env.SENTRY_RELEASE,
  };

  // Stringify all values so we can feed into Webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
};
