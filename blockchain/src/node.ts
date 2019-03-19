import stdrpc from "stdrpc";
import bitcore from "zcash-bitcore-lib";
import { captureException } from "@sentry/node";
import env from "./env";
import log from "./log";
import { extractErrMessage } from "./util";

export interface BlockChainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  // Much much more, but not necessary
}

export interface ScriptPubKey {
  asm: string;
  hex: string;
  reqSigs: number;
  type: string;
  addresses: string[];
}

export interface VIn {
  sequence: number;
  coinbase?: string;
}

export interface VOut {
  value: number;
  valueZat: number;
  n: number;
  scriptPubKey: ScriptPubKey;
}

export interface Transaction {
  txid: string;
  hex: string;
  version: number;
  locktime: number;
  expiryheight: number;
  blockhash: string;
  blocktime: number;
  confirmations: number;
  time: number;
  vin: VIn[];
  vout: VOut[];
  // unclear what vjoinsplit is
  vjoinsplit: any[];
}

export interface Block {
  hash: string;
  confirmations: number;
  size: number;
  height: number;
  version: number;
  merkleroot: string;
  finalsaplingroot: string;
  time: number;
  nonce: string;
  solution: string;
  bits: string;
  difficulty: number;
  chainwork: string;
  anchor: string;
  // valuePools ?
  previousblockhash?: string;
  nextblockhash?: string;
}

export interface BlockWithTransactionIds extends Block {
  tx: string[];
}

export interface BlockWithTransactions extends Block {
  tx: Transaction[];
}

export interface Receipt {
  txid: string;
  amount: number;
  memo: string;
  change: boolean;
}

export interface DisclosedPayment {
  txid: string;
  jsIndex: number;
  outputIndex: number;
  version: number;
  onetimePrivKey: string;
  joinSplitPubKey: string;
  signatureVerified: boolean;
  paymentAddress: string;
  memo: string;
  value: number;
  commitmentMatch: boolean;
  valid: boolean;
  message?: string;
}

// Actually comes back with a bunch of args, but this is all we need
export interface ValidationResponse {
  isvalid: boolean;
}

// https://github.com/zcash/zcash/blob/master/doc/payment-api.md
interface ZCashNode {
  getblockchaininfo: () => Promise<BlockChainInfo>;
  getblockcount: () => Promise<number>;
  getblock: {
    (numberOrHash: string | number, verbosity?: 1): Promise<
      BlockWithTransactionIds
    >;
    (numberOrHash: string | number, verbosity: 2): Promise<
      BlockWithTransactions
    >;
    (numberOrHash: string | number, verbosity: 0): Promise<string>;
  };
  gettransaction: (txid: string) => Promise<Transaction>;
  validateaddress: (address: string) => Promise<ValidationResponse>;
  z_getbalance: (address: string, minConf?: number) => Promise<number>;
  z_getnewaddress: (type?: "sprout" | "sapling") => Promise<string>;
  z_listaddresses: () => Promise<string[]>;
  z_listreceivedbyaddress: (
    address: string,
    minConf?: number
  ) => Promise<Receipt[]>;
  z_importviewingkey: (
    key: string,
    rescan?: "yes" | "no" | "whenkeyisnew",
    startHeight?: number
  ) => Promise<void>;
  z_exportviewingkey: (zaddr: string) => Promise<string>;
  z_validatepaymentdisclosure: (
    disclosure: string
  ) => Promise<DisclosedPayment>;
  z_validateaddress: (address: string) => Promise<ValidationResponse>;
}

export const rpcOptions = {
  url: env.ZCASH_NODE_URL,
  username: env.ZCASH_NODE_USERNAME,
  password: env.ZCASH_NODE_PASSWORD
};

const node: ZCashNode = stdrpc(rpcOptions);

export default node;

let network: any;
export async function initNode() {
  // Check if node is available & setup network
  try {
    const info = await node.getblockchaininfo();
    log.info(`Connected to ${info.chain} node at block height ${info.blocks}`);

    if (info.chain === "regtest") {
      bitcore.Networks.enableRegtest();
    }
    if (info.chain.includes("test")) {
      network = bitcore.Networks.testnet;
    } else {
      network = bitcore.Networks.mainnet;
    }
  } catch (err) {
    captureException(err);
    log.error(extractErrMessage(err));
    log.error(`Failed to connect to zcash node with the following credentials: ${JSON.stringify(rpcOptions, null, 2)}`);
    process.exit(1);
  }

  // Check if sprout address is readable
  // NOTE: Replace with sapling when ready
  // try {
  //   if (!env.SPROUT_ADDRESS) {
  //     console.error("Missing SPROUT_ADDRESS environment variable, exiting");
  //     process.exit(1);
  //   }
  //   await node.z_getbalance(env.SPROUT_ADDRESS as string);
  // } catch (err) {
  //   if (!env.SPROUT_VIEWKEY) {
  //     log.error(
  //       "Unable to view SPROUT_ADDRESS and missing SPROUT_VIEWKEY environment variable, exiting"
  //     );
  //     process.exit(1);
  //   }
  //   await node.z_importviewingkey(env.SPROUT_VIEWKEY as string);
  //   await node.z_getbalance(env.SPROUT_ADDRESS as string);
  // }
}

export function getNetwork() {
  if (!network) {
    throw new Error("Called getNetwork before initNode");
  }
  return network;
}

// Relies on initNode being called first
export async function getBootstrapBlockHeight(txid: string | undefined) {
  if (txid) {
    try {
      const tx = await node.gettransaction(txid);
      const block = await node.getblock(tx.blockhash);
      const height =
        block.height - parseInt(env.MINIMUM_BLOCK_CONFIRMATIONS, 10);
      return height.toString();
    } catch (err) {
      log.warn(`Attempted to get block height for tx ${txid} but failed with the following error: ${extractErrMessage(err)}`);
    }
  }

  // If we can't find the latest tx block, fall back to when the grant
  // system first launched, and scan from there. Regtest or unknown networks
  // start from the bottom.
  const net = getNetwork();
  let height = "0";
  if (net === bitcore.Networks.mainnet) {
    height = env.MAINNET_START_BLOCK;
  } else if (net === bitcore.Networks.testnet && !net.regtestEnabled) {
    height = env.TESTNET_START_BLOCK;
  }

  log.info(`Falling back to hard-coded starter block height ${height}`);
  return height;
}
