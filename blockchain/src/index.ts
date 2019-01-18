import * as Sentry from "@sentry/node";
import * as Webhooks from "./webhooks";
import * as RestServer from "./server";
import { initNode } from "./node";
import env from "./env";

async function start() {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
    });
  }

  console.log("============== Starting services ==============");
  await initNode();
  await Webhooks.start();
  await RestServer.start();
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
