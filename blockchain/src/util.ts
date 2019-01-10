import { randomBytes, createHmac } from "crypto";
import { IncomingMessage } from "http";
import { HDPublicKey, Address } from "zcash-bitcore-lib";
import { parse } from 'url';
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

export function authenticate(secret: string) {
  const hash = env.API_SECRET_HASH;
  if (!hash) {
    throw Error("API_SECRET_HASH environment variable required.");
  }
  return hash === sha256(secret);
}

// TODO: Not fully confident in compatibility with most bip32 wallets,
// do more work to ensure this is reliable.
export function deriveTransparentAddress(index: number, network: any) {
  const root = new HDPublicKey(env.BIP32_XPUB);
  const child = root.derive(`m/0/${index}`);
  const address = new Address(child.publicKey, network);
  return address.toString();
}

export function dedupeArray(arr: any[]) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function removeItem<T>(arr: T[], remove: T) {
  return arr.filter(item => item !== remove);
}

export function encodeHexMemo(memo: string) {
  return new Buffer(memo, 'utf8').toString('hex');
}

export function decodeHexMemo(memoHex: string) {
  return new Buffer(memoHex, 'hex')
    .toString()
    // Remove null bytes from zero padding
    .replace(/\0.*$/g, '');
}

export function makeContributionMemo(contributionId: number) {
  return encodeHexMemo(`Contribution ${contributionId} on Grant.io`);
}

export function getContributionIdFromMemo(memoHex: string) {
  const matches = decodeHexMemo(memoHex).match(/Contribution ([0-9]+) on Grant\.io/);
  if (matches && matches[1]) {
    return parseInt(matches[1], 10);
  }
  return false;
}

// TODO: Make this more robust
export function toBaseUnit(unit: number) {
  return Math.floor(100000000 * unit);
}