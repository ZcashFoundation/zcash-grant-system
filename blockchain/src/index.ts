import * as Webhooks from "./webhooks";
import * as RestServer from "./server";
import { initNode } from './node';

async function start() {
  console.log("============== Starting services ==============");
  await initNode();
  await RestServer.start();
  await Webhooks.start();
  console.log("===============================================");
}

process.on("SIGINT", () => {
  console.log('Shutting down services...');
  Webhooks.exit();
  RestServer.exit();
  console.log('Exiting!');
  process.exit();
});

start();
