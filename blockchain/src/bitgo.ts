import { BitGo, Wallet } from 'bitgo';
import bitcore from "zcash-bitcore-lib";
import env from './env';
import log from './log';
import { getNetwork } from './node';

let bitgoWallet: Wallet;

export async function initBitGo() {
  if (!env.BITGO_ACCESS_TOKEN || !env.BITGO_WALLET_ID) {
    log.info('BITGO environment variables not set, nooping initBitGo');
    return;
  }

  // Assert that we're on mainnet
  const network = getNetwork();
  if (network !== bitcore.Networks.mainnet) {
    throw new Error(`BitGo cannot be used on anything but mainnet, connected node is ${network}`);
  }

  const bitgo = new BitGo({
    env: 'prod', // Non-prod ZEC is not supported
    accessToken: env.BITGO_ACCESS_TOKEN,
  });
  bitgoWallet = await bitgo.coin('zec').wallets().get({ id: env.BITGO_WALLET_ID });
  log.info(`Initialized BitGo wallet "${bitgoWallet.label()}"`);
}

export async function getContributionAddress(id: number) {
  if (!bitgoWallet) {
    throw new Error('Must run initBitGo before getContributionAddress');
  }

  // Attempt to fetch first
  const label = `Contribution #${id}`;
  const res = await bitgoWallet.addresses({ labelContains: label });
  if (res.addresses.length) {
    if (res.addresses.length > 1) {
      log.warn(`Contribution ${id} has ${res.addresses.length} associated with it. Using the first one (${res.addresses[0].address})`);
    }
    return res.addresses[0].address;
  }

  // Create a new one otherwise
  const createRes = await bitgoWallet.createAddress({ label });
  log.info(`Generate new address for contribution ${id}`);
  return createRes.address;
}

function generateLabel(id: number) {
  return `Contribution #${id}`;
}