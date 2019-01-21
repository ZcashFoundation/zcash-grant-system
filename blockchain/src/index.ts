import * as Sentry from "@sentry/node";
import * as Webhooks from "./webhooks";
import * as RestServer from "./server";
import { initNode } from "./node";
import env from "./env";
import log from "./log";

async function start() {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
    });
  }

  log.info("============== Starting services ==============");
  await initNode();
  await RestServer.start();
  await Webhooks.start();
  log.info("===============================================");
}

process.on("SIGINT", () => {
  log.info('Shutting down services...');
  Webhooks.exit();
  RestServer.exit();
  log.info('Exiting!');
  process.exit();
});

start();
