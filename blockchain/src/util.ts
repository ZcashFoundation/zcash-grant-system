import dotenv from "dotenv";
import { randomBytes, createHmac } from "crypto";
import { IncomingMessage } from "http";

if (process.env.NODE_ENV !== "production") {
  dotenv.load();
}

function sha256(input: string) {
  const hash = createHmac("sha256", input);
  return hash.digest("hex");
}

export function generateApiKey() {
  const key = randomBytes(16).toString("hex");
  const hash = sha256(key);
  return { key, hash };
}

export function getIpFromRequest(req: IncomingMessage) {
  const xffHeader = req.headers["x-forwarded-for"];
  if (xffHeader && typeof xffHeader === "string") {
    return xffHeader.split(/\s*,\s*/)[0];
  }
  return req.connection.remoteAddress;
}

export function getAuthFromRequest(req: IncomingMessage) {
  const swpHeader = req.headers["sec-websocket-protocol"];
  if (swpHeader && typeof swpHeader === "string") {
    return swpHeader;
  }
  return undefined;
}

export function authenticate(secret: string) {
  const hash = process.env.API_SECRET_HASH;
  if (!hash) {
    throw Error("API_SECRET_HASH environment variable required.");
  }
  return hash === sha256(secret);
}

export function authenticateRequest(req: IncomingMessage) {
  const secret = getAuthFromRequest(req);
  if (!secret) {
    console.log(`Client must set 'sec-websocket-protocal' header with secret.`);
  }
  return secret ? authenticate(secret) : false;
}
