/// <reference types="cypress"/>
import {
  loadWeb3,
  increaseTime,
  randomString,
  syncTimeWithEvm
} from "../helpers";

// describe("sandbox", () => {
//   it("how to increase time", () => {
//     cy.visit("http://localhost:3000", { onBeforeLoad: loadWeb3(0) });
//     // increase time on browser and ganache
//     increaseTime(cy, 60000);
//   });
// });
