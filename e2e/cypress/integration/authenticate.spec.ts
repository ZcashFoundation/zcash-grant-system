/// <reference types="cypress"/>
import {
  loadWeb3,
  increaseTime,
  syncTimeWithEvm,
  randomString
} from "../helpers";
import { createDemoProposal, authenticateUser } from "../parts";

describe("authenticate", () => {
  it("authenticates and creates if necessary", () => {
    authenticateUser(cy, 0);
  });
});
