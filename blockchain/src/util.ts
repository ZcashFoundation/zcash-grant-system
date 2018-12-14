import { randomBytes, createHmac } from "crypto";
import { IncomingMessage } from "http";
// import bitcoin from "bitcoinjs-lib-zcash";
// import bip32 from "bip32";
import bitcore from "zcash-bitcore-lib";
import env from "./env";

function sha256(input: string) {
  const hash = createHmac("sha256", input);
  return hash.digest("hex");
}

export function generateApiKey() {
  const key = randomBytes(16).toString("hex");
  const hash = sha256(key);
  return { key, hash };
}

export function getIpFromRequest(req: IncomingMessage) {
  const xffHeader = req.headers["x-forwarded-for"];
  if (xffHeader && typeof xffHeader === "string") {
    return xffHeader.split(/\s*,\s*/)[0];
  }
  return req.connection.remoteAddress;
}

export function getAuthFromRequest(req: IncomingMessage) {
  const swpHeader = req.headers["sec-websocket-protocol"];
  if (swpHeader && typeof swpHeader === "string") {
    return swpHeader;
  }
  return undefined;
}

export function authenticate(secret: string) {
  const hash = env.API_SECRET_HASH;
  if (!hash) {
    throw Error("API_SECRET_HASH environment variable required.");
  }
  return hash === sha256(secret);
}

export function authenticateRequest(req: IncomingMessage) {
  const secret = getAuthFromRequest(req);
  if (!secret) {
    console.log(`Client must set 'sec-websocket-protocal' header with secret.`);
  }
  return secret ? authenticate(secret) : false;
}

export function deriveAddress(index: number) {
  const root = new bitcore.HDPublicKey(env.BIP32_XPUB);
  const child = root.derive(`m/0/${index}`);
  return child.publicKey.toAddress().toString();
}
