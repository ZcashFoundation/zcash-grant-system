import stdrpc from "stdrpc";
import dotenv from "dotenv";

dotenv.load();

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
  url: process.env.ZCASH_NODE_URL,
  username: process.env.ZCASH_NODE_USERNAME,
  password: process.env.ZCASH_NODE_PASSWORD,
};

const node: ZCashNode = stdrpc(rpcOptions);

export default node;