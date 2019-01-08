import dotenv from "dotenv";
dotenv.load();

// Maps to .env.example variables, plus any node ones we use
interface CustomEnvironment {
  API_SECRET_HASH: string;
  API_SECRET_KEY: string;

  WEBHOOK_URL: string;
  REST_SERVER_PORT: string;

  ZCASH_NODE_URL: string;
  ZCASH_NODE_USERNAME: string;
  ZCASH_NODE_PASSWORD: string;
  MINIMUM_BLOCK_CONFIRMATIONS: string;

  SPROUT_ADDRESS: string;
  SPROUT_VIEWKEY: string;
  BIP32_XPUB: string;
  BIP44_ACCOUNT: string;
}

export default process.env as any as CustomEnvironment;
