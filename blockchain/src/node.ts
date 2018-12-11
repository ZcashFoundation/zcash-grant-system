import stdrpc from 'stdrpc';

interface BlockChainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  // Much much more, but not necessary
}

// TODO: Type node const with methods from
// https://github.com/zcash/zcash/blob/master/doc/payment-api.md
interface ZCashNode {
  getblockchaininfo: () => Promise<BlockChainInfo>;
  getblockcount: () => Promise<number>;
  z_getbalance: (address: string, minConf?: number) => any;
}

export const rpcOptions = {
  url: process.env.ZCASH_NODE_URL,
  username: process.env.ZCASH_NODE_USERNAME,
  password: process.env.ZCASH_NODE_PASSWORD,
};

const node: ZCashNode = stdrpc(rpcOptions);

export default node;