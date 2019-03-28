import dotenv from "dotenv";
dotenv.load();

// Maps to .env.example variables, plus any node ones we use
// fill in sensible defaults, falsy values will throw if not set
const DEFAULTS = {
  NODE_ENV: "development",
  LOG_LEVEL: "info",

  API_SECRET_HASH: "",
  API_SECRET_KEY: "",

  WEBHOOK_URL: "",
  PORT: "5051",

  ZCASH_NODE_URL: "",
  ZCASH_NODE_USERNAME: "",
  ZCASH_NODE_PASSWORD: "",
  MINIMUM_BLOCK_CONFIRMATIONS: "6",

  BITGO_WALLET_ID: "",
  BITGO_ACCESS_TOKEN: "",

  BIP32_XPUB: "",

  SPROUT_ADDRESS: "",
  SPROUT_VIEWKEY: "",

  MAINNET_START_BLOCK: "464000",
  TESTNET_START_BLOCK: "390000",

  SENTRY_DSN: "",
  FIXIE_URL: "",
};

const OPTIONAL: { [key: string]: undefined | boolean } = {
  BITGO_WALLET_ID: true,
  BITGO_ACCESS_TOKEN: true,
  BIP32_XPUB: true,
  FIXIE_URL: true,
  // NOTE: Remove these from optional when sapling is ready
  SPROUT_ADDRESS: true,
  SPROUT_VIEWKEY: true,
}

type CustomEnvironment = typeof DEFAULTS;

// ignore when testing
if (process.env.NODE_ENV !== "test") {
  // Set environment variables, throw on missing required ones
  Object.entries(DEFAULTS).forEach(([k, v]) => {
    if (!process.env[k]) {
      const defVal = (DEFAULTS as any)[k];
      if (defVal) {
        console.info(`Using default environment variable ${k}="${defVal}"`);
        process.env[k] = defVal;
      } else if (!OPTIONAL[k]) {
        throw new Error(`Missing required environment variable ${k}`);
      }
    }
  });

  // Ensure we have either xpub or bitgo, and warn if we have both
  if (!process.env.BIP32_XPUB && (!process.env.BITGO_WALLET_ID || !process.env.BITGO_ACCESS_TOKEN)) {
    throw new Error('Either BIP32_XPUB or BITGO_* environment variables required, missing both');
  }
  if (process.env.BIP32_XPUB && process.env.BITGO_WALLET_ID) {
    console.info('BIP32_XPUB and BITGO environment variables set, BIP32_XPUB will be ignored');
  }
}

export default (process.env as any) as CustomEnvironment;
