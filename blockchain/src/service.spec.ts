import "mocha";
import dotenv from "dotenv";
import assert from "assert";
import WebSocket from "isomorphic-ws";

dotenv.load();
import * as service from "./service";
const { PORT, API_SECRET_KEY } = process.env;

describe("index", () => {
  it("should authenticate and connect", done => {
    service.start();
    const socket = new WebSocket(`ws://localhost:${PORT}`, API_SECRET_KEY);
    socket.addEventListener("open", () => {
      service.exit();
      done();
    });
  });
  it("should fail authentication", done => {
    service.start();
    const socket = new WebSocket(`ws://localhost:${PORT}`, "incorrectkey");
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
