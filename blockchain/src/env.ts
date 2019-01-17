import dotenv from "dotenv";
dotenv.load();

// Maps to .env.example variables, plus any node ones we use
// fill in sensible defaults, falsy values will throw if not set
const DEFAULTS = {
  API_SECRET_HASH: "",
  API_SECRET_KEY: "",

  WEBHOOK_URL: "",
  PORT: "5051",

  ZCASH_NODE_URL: "",
  ZCASH_NODE_USERNAME: "",
  ZCASH_NODE_PASSWORD: "",
  MINIMUM_BLOCK_CONFIRMATIONS: "6",

  SPROUT_ADDRESS: "",
  SPROUT_VIEWKEY: "",
  BIP32_XPUB: ""
  // can't find any refs to this
  // BIP44_ACCOUNT: ""
};

type CustomEnvironment = typeof DEFAULTS;

Object.entries(DEFAULTS).forEach(([k, v]) => {
  if (!process.env[k]) {
    const defVal = (DEFAULTS as any)[k];
    if (defVal) {
      console.log(`Using default environment variable ${k}="${defVal}"`);
      process.env[k] = defVal;
    } else {
      throw new Error(`Missing required environment variable ${k}`);
    }
  }
});

export default (process.env as any) as CustomEnvironment;
