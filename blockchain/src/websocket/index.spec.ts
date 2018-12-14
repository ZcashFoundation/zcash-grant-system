import "mocha";
import assert from "assert";
import WebSocket from "isomorphic-ws";
import * as service from "./index";
import env from "../env";

const { WS_PORT, API_SECRET_KEY } = env;

describe("index", () => {
  it("should authenticate and connect", done => {
    service.start();
    const socket = new WebSocket(`ws://localhost:${WS_PORT}`, API_SECRET_KEY);
    socket.addEventListener("open", () => {
      service.exit();
      done();
    });
  });
  it("should fail authentication", done => {
    service.start();
    const socket = new WebSocket(`ws://localhost:${WS_PORT}`, "incorrectkey");
    socket.addEventListener("message", m => {
      console.log(m.data);
      assert.equal('{"type":"auth","payload":"rejected"}', m.data);
    });
    socket.addEventListener("close", () => {
      console.log("CLOSE...");
      service.exit();
      done();
    });
  });
});
