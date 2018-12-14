import * as Websocket from "./websocket";
import * as RestServer from "./server";
import { initNode } from './node';

async function start() {
  console.log("============== Starting services ==============");
  await initNode();
  await Websocket.start();
  await RestServer.start();
  console.log("===============================================");
}

process.on("SIGINT", () => {
  console.log('Shutting down services...');
  Websocket.exit();
  console.log('Exiting!');
  process.exit();
});

start();
