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

export interface Receipt {
  txid: string;
  amount: string;
  memo: string;
  change: boolean;
}

// TODO: Type node const with methods from
// https://github.com/zcash/zcash/blob/master/doc/payment-api.md
interface ZCashNode {
  getblockchaininfo: () => Promise<BlockChainInfo>;
  getblockcount: () => Promise<number>;
  getblock: (numberOrHash: string | number) => Promise<Block>;
  z_getbalance: (address: string, minConf?: number) => Promise<number>;
  z_getnewaddress: (type?: 'sprout' | 'sapling') => Promise<string>;
  z_listaddresses: () => Promise<string[]>;
  z_listreceivedbyaddress: (address: string, minConf?: number) => Promise<Receipt[]>;
  z_importviewingkey: (key: string, rescan?: 'yes' | 'no' | 'whenkeyisnew', startHeight?: number) => Promise<void>;
  z_exportviewingkey: (zaddr: string) => Promise<string>;
}

export const rpcOptions = {
  url: process.env.ZCASH_NODE_URL,
  username: process.env.ZCASH_NODE_USERNAME,
  password: process.env.ZCASH_NODE_PASSWORD,
};

const node: ZCashNode = stdrpc(rpcOptions);

export default node;