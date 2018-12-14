import WebSocket from "ws";
import { initializeNotifiers } from "./notifiers";
import { Notifier } from "./notifiers/notifier";
import { getIpFromRequest, authenticateRequest } from "../util";
import node, { rpcOptions } from "../node";
import env from "../env";

const log = console.log;

export type Send = (message: Message) => void;
export type Receive = (message: Message) => void;

export interface Message {
  type: string;
  payload: any;
}

const parse = (data: WebSocket.Data) => {
  try {
    return JSON.parse(data.toString());
  } catch (e) {
    log(
      `unable to parse message, it was probably not JSON, data: ${data}`
    );
    return null;
  }
};

let wss: null | WebSocket.Server = null;
let notifiers = [] as Notifier[];
let consecutiveBlockFailures = 0;
const MAXIMUM_BLOCK_FAILURES = 5;

export async function start() {
  await initNode();
  initWebsocketServer();
  initNotifiers();
}

export function exit() {
  notifiers.forEach(n => n.destroy && n.destroy());
  wss && wss.close();
  wss = null;
  console.log('WebSocket server has been closed');
}


async function initNode() {
  const info = await node.getblockchaininfo();
  let currentBlock = info.blocks;

  setInterval(async () => {
    const blockHeight = await node.getblockcount();
    if (blockHeight > currentBlock) {
      try {
        const block = await node.getblock(String(currentBlock + 1), 2);
        notifiers.forEach(n => n.onNewBlock && n.onNewBlock(block));
        currentBlock++;
        consecutiveBlockFailures = 0;
      } catch(err) {
        log(err.response ? err.response.data : err);
        log(`Failed to fetch block ${currentBlock + 1}`);
        consecutiveBlockFailures++;
        if (consecutiveBlockFailures >= MAXIMUM_BLOCK_FAILURES) {
          log('Maximum consecutive failures reached, exiting');
          process.exit(1);
        }
        else {
          log('Attempting to fetch again shortly...');
        }
      }
    }
  }, 3000);
}

function initWebsocketServer() {
  if (wss) return;

  wss = new WebSocket.Server({
    port: parseInt(env.WS_PORT as string, 10)
  });
  log(`WebSocket Server started on port ${env.WS_PORT}`);

  wss.on("connection", function connection(ws, req) {
    log(`${getIpFromRequest(req)} connected`);
    const isAuth = authenticateRequest(req);
    if (!isAuth) {
      log(`Connection ${getIpFromRequest(req)} rejected, unauthorized.`);
      ws.send(JSON.stringify({ type: "auth", payload: "rejected" }));
      ws.terminate();
      return;
    }

    ws.on("message", message => {
      const parsedMsg = parse(message);
      if (parsedMsg) {
        notifiers.forEach(n => n.receive && n.receive(parsedMsg));
      }
    });
    ws.on("close", () => {
      log(`${getIpFromRequest(req)} closed.`);
    });
  });
}


function initNotifiers() {
  const send: Send = message =>
    wss &&
    wss.clients.forEach(ws => {
      try {
        ws.send(JSON.stringify(message));
      } catch (e) {
        log(`Send error: ${e}`);
      }
    });

  notifiers = initializeNotifiers();
  notifiers.forEach(n => n.registerSend(send));
}