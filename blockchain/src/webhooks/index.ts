import axios from 'axios';
import { captureException } from "@sentry/node";
import { initializeNotifiers } from "./notifiers";
import { Notifier } from "./notifiers/notifier";
import node from "../node";
import env from "../env";
import log from "../log";

export type Send = (route: string, method: string, payload: object) => void;

let notifiers = [] as Notifier[];
let consecutiveBlockFailures = 0;
const MAXIMUM_BLOCK_FAILURES = 5;

export async function start() {
  await initNode();
  initNotifiers();
}

export function exit() {
  notifiers.forEach(n => n.destroy && n.destroy());
  log.info('Webhook notifiers have exited');
}


async function initNode() {
  const info = await node.getblockchaininfo();
  let currentBlock = info.blocks;
  const minBlockConf = parseInt(env.MINIMUM_BLOCK_CONFIRMATIONS, 10);

  setInterval(async () => {
    const blockHeight = await node.getblockcount();
    if (blockHeight > currentBlock) {
      if (blockHeight - minBlockConf < 1) {
        log.info(`Current height is ${blockHeight}, waiting for ${env.MINIMUM_BLOCK_CONFIRMATIONS} blocks before processing...`);
        return;
      }

      const desiredBlock = currentBlock - minBlockConf;
      try {
        // Verbosity of 2 is full blocks
        const block = await node.getblock(String(desiredBlock), 2);
        log.info(`Processing block #${block.height}...`);
        notifiers.forEach(n => n.onNewBlock && n.onNewBlock(block));
        currentBlock++;
        consecutiveBlockFailures = 0;
      } catch(err) {
        log.warn(err.response ? err.response.data : err);
        log.warn(`Failed to fetch block ${desiredBlock}`);
        consecutiveBlockFailures++;
        if (consecutiveBlockFailures >= MAXIMUM_BLOCK_FAILURES) {
          captureException(err);
          log.error('Maximum consecutive failures reached, exiting!');
          process.exit(1);
        }
        else {
          log.warn('Attempting to fetch again shortly...');
        }
      }
    }
  }, 3000);
}


function initNotifiers() {
  const send: Send = (route, method, payload) => {
    log.debug(`About to send to ${method} ${route}:`, payload);
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
        log.error(`Webhook server responded to ${method} ${route} with status code ${res.status}\n`, res.data);
      }
    })
    .catch((err) => {
      captureException(err);
      log.error(err);
      log.error('Webhook server request failed! See above for details.');
    });
  };

  notifiers = initializeNotifiers();
  notifiers.forEach(n => n.registerSend(send));
}