import axios from 'axios';
import { captureException } from "@sentry/node";
import { initializeNotifiers } from "./notifiers";
import { Notifier } from "./notifiers/notifier";
import node from "../node";
import env from "../env";
import { store } from "../store";
import { sleep, extractErrMessage } from "../util";
import log from "../log";

let blockScanTimeout: any = null;
let notifiers = [] as Notifier[];
let consecutiveBlockFailures = 0;
const MAXIMUM_BLOCK_FAILURES = 5;
const MIN_BLOCK_CONF = parseInt(env.MINIMUM_BLOCK_CONFIRMATIONS, 10);

export async function start() {
  initScan();
  initNotifiers();

  let { startingBlockHeight } = store.getState();
  while (startingBlockHeight === undefined || startingBlockHeight === null) {
    await requestBootstrap();
    await sleep(10000);
    startingBlockHeight = store.getState().startingBlockHeight;
  }
}

export function exit() {
  notifiers.forEach(n => n.destroy && n.destroy());
  log.info('Webhook notifiers have exited');
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
    log.info(`Processing block #${block.height}...`);
    notifiers.forEach(n => n.onNewBlock && n.onNewBlock(block));
    consecutiveBlockFailures = 0;
  } catch(err) {
    log.warn(`Failed to fetch block ${height}: ${extractErrMessage(err)}`);
    consecutiveBlockFailures++;
    // If we fail a certain number of times, it's reasonable to
    // assume that the blockchain is down, and we should just quit.
    if (consecutiveBlockFailures >= MAXIMUM_BLOCK_FAILURES) {
      captureException(err);
      log.error('Maximum consecutive failures reached, exiting!');
      process.exit(1);
    }
    else {
      log.warn('Attempting to fetch again shortly...');
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
    log.debug('Requesting bootstrap from backend...');
    await send('/blockchain/bootstrap', 'GET');
  } catch(err) {
    log.error(`Request for bootstrap failed: ${extractErrMessage(err)}`);
  }
}

export type Send = (route: string, method: string, payload?: object) => void;
const send: Send = (route, method, payload) => {
  log.debug(`About to send to ${method} ${route}:`, payload);
  const headers: any = {
    'Authorization': `Bearer ${env.API_SECRET_KEY}`,
  };
  if (payload && (method === 'PUT' || method === 'POST')) {
    headers['Content-Type'] = 'application/json';
  }
  axios.request({
    method,
    url: `${env.WEBHOOK_URL}${route}`,
    data: payload,
    headers,
  })
  .then((res) => {
    if (res.status >= 400) {
      log.error(res.data);
      log.error(`Webhook server responded to ${method} ${route} with status code ${res.status}. See above for details.`);
    }
  })
  .catch((err) => {
    if (err.code && err.code === 'ECONNREFUSED') {
      log.warn('Unable to send to backend, probably offline');
      return;
    }
    captureException(err);
    log.error(`Webhook server request to ${method} ${route} failed: ${extractErrMessage(err)}`);
  });
};
