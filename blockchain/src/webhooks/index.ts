import axios from 'axios';
import { initializeNotifiers } from "./notifiers";
import { Notifier } from "./notifiers/notifier";
import node from "../node";
import env from "../env";
import { store } from "../store";
import { sleep } from "../util";

const log = console.log;

let blockScanTimeout: any = null;
let notifiers = [] as Notifier[];
let consecutiveBlockFailures = 0;
const MAXIMUM_BLOCK_FAILURES = 5;
const MIN_BLOCK_CONF = parseInt(env.MINIMUM_BLOCK_CONFIRMATIONS, 10);

export async function start() {
  initScan();
  initNotifiers();
  await requestBootstrap();
}

export function exit() {
  notifiers.forEach(n => n.destroy && n.destroy());
  console.log('Webhook notifiers have exited');
}


function initScan() {
  // Scan is actually kicked off by redux action setting start height
  let prevHeight: number | null = null;
  store.subscribe(() => {
    const { startingBlockHeight } = store.getState();
    if (startingBlockHeight !== null && prevHeight !== startingBlockHeight) {
      console.info(`Starting block scan at block ${startingBlockHeight}`);
      clearTimeout(blockScanTimeout);
      scanBlock(startingBlockHeight);
      prevHeight = startingBlockHeight;
    }
  });
}

async function scanBlock(height: number) {
  const highestBlock = await node.getblockcount();

  // Try again in 5 seconds if the next block isn't ready
  if (height > highestBlock - MIN_BLOCK_CONF) {
    blockScanTimeout = setTimeout(() => {
      scanBlock(height);
    }, 5000);
    return;
  }

  // Process the block
  try {
    const block = await node.getblock(String(height), 2); // 2 == full blocks
    log(`Processing block #${block.height}...`);
    notifiers.forEach(n => n.onNewBlock && n.onNewBlock(block));
    consecutiveBlockFailures = 0;
  } catch(err) {
    log(err.response ? err.response.data : err);
    log(`Failed to fetch block ${height}, see above error`);
    consecutiveBlockFailures++;
    // If we fail a certain number of times, it's reasonable to
    // assume that the blockchain is down, and we should just quit.
    // TODO: Scream at sentry or something!
    if (consecutiveBlockFailures >= MAXIMUM_BLOCK_FAILURES) {
      log('Maximum consecutive failures reached, exiting!');
      process.exit(1);
    }
    else {
      log('Attempting to fetch again shortly...');
      await sleep(5000);
    }
  }

  // Try next block
  scanBlock(height + 1);
}

function initNotifiers() {
  notifiers = initializeNotifiers();
  notifiers.forEach(n => n.registerSend(send));
}

async function requestBootstrap() {
  try {
    log('Requesting bootstrap from backend...');
    await send('/blockchain/bootstrap', 'GET');
  } catch(err) {
    console.error(err.response ? err.response.data : err);
    console.error('Request for bootstrap failed, see above for details');
  }
}

export type Send = (route: string, method: string, payload?: object) => void;
const send: Send = (route, method, payload) => {
  console.log('About to send to', route);
  axios.request({
    method,
    url: `${env.WEBHOOK_URL}${route}`,
    data: payload,
    headers: {
      'Authorization': `Bearer ${env.API_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  .then((res) => {
    if (res.status >= 400) {
      console.error(`Webhook server responded to ${method} ${route} with status code ${res.status}`);
      console.error(res.data);
    }
  })
  .catch((err) => {
    console.error(err);
    console.error('Webhook server request failed! See above for details.');
  });
};