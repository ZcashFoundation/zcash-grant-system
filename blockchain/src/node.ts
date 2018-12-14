import stdrpc from "stdrpc";
import bitcore from "zcash-bitcore-lib";
import env from "./env";

export interface BlockChainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  // Much much more, but not necessary
}

export interface Transaction {
  txid: string;
  hex: string;
  version: number;
  locktime: number;
  expiryheight: number;
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
  // TODO: fill me out, what are these?
  vin: any[];
  vout: any[];
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
  tx: string[];
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


export type BlockWithTransactions = Block & {
  tx: Transaction[];
}

export interface Receipt {
  txid: string;
  amount: string;
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

// TODO: Type all methods with signatures from
// https://github.com/zcash/zcash/blob/master/doc/payment-api.md
interface ZCashNode {
  getblockchaininfo: () => Promise<BlockChainInfo>;
  getblockcount: () => Promise<number>;
  getblock: {
    (numberOrHash: string | number, verbosity?: 1): Promise<Block>;
    (numberOrHash: string | number, verbosity: 2): Promise<BlockWithTransactions>;
    (numberOrHash: string | number, verbosity: 0): Promise<string>;
  }
  z_getbalance: (address: string, minConf?: number) => Promise<number>;
  z_getnewaddress: (type?: 'sprout' | 'sapling') => Promise<string>;
  z_listaddresses: () => Promise<string[]>;
  z_listreceivedbyaddress: (address: string, minConf?: number) => Promise<Receipt[]>;
  z_importviewingkey: (key: string, rescan?: 'yes' | 'no' | 'whenkeyisnew', startHeight?: number) => Promise<void>;
  z_exportviewingkey: (zaddr: string) => Promise<string>;
  z_validatepaymentdisclosure: (disclosure: string) => Promise<DisclosedPayment>;
}

export const rpcOptions = {
  url: env.ZCASH_NODE_URL,
  username: env.ZCASH_NODE_USERNAME,
  password: env.ZCASH_NODE_PASSWORD,
};

const node: ZCashNode = stdrpc(rpcOptions);

export default node;

let network: any;
export async function initNode() {
  // Check if node is available & setup network
  try {
    const info = await node.getblockchaininfo();
    console.log(`Connected to ${info.chain} node at block height ${info.blocks}`);

    if (info.chain === "regtest") {
      bitcore.Networks.enableRegtest();
    }
    if (info.chain === "regtest" || info.chain.includes("testnet")) {
      network = bitcore.Networks.testnet;
    }
    else {
      network = bitcore.Networks.mainnet;
    }
  }
  catch(err) {
    console.log(err.response ? err.response.data : err);
    console.log('Failed to connect to zcash node with the following credentials:\r\n', rpcOptions);
    process.exit(1);
  }

  // Check if sprout address is readable
  try {
    if (!env.SPROUT_ADDRESS) {
      console.error('Missing SPROUT_ADDRESS environment variable, exiting');
      process.exit(1);
    }
    await node.z_getbalance(env.SPROUT_ADDRESS as string);
  } catch(err) {
    if (!env.SPROUT_VIEWKEY) {
      console.error('Unable to view SPROUT_ADDRESS and missing SPROUT_VIEWKEY environment variable, exiting');
      process.exit(1);
    }
    await node.z_importviewingkey(env.SPROUT_VIEWKEY as string);
    await node.z_getbalance(env.SPROUT_ADDRESS as string);
  }
}

export function getNetwork() {
  if (!network) {
    throw new Error('Called getNetwork before initNode');
  }
  return network;
}
