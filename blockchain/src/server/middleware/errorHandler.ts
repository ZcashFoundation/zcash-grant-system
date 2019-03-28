import { captureException } from "@sentry/node";
import { Request, Response, NextFunction } from 'express';
import log from "../../log";
import { extractErrMessage } from "../../util";

export default function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Non-error responses, or something else handled & responded
  if (!err || res.headersSent) {
    next(err);
  }

  captureException(err);
  log.error(`Uncaught ${err.name} exception at ${req.method} ${req.path}: ${extractErrMessage(err)}`);
  log.debug(`Query: ${JSON.stringify(req.query, null, 2)}`);
  log.debug(`Body: ${JSON.stringify(req.body, null, 2)}`);
  log.debug(`Full stacktrace:\n${err.stack}`);
  return res.status(500).json({ error: err.message });
}
