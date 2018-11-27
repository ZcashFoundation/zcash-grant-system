/// <reference types="cypress"/>
import {
  loadWeb3,
  increaseTime,
  syncTimeWithEvm,
  randomString
} from "../helpers";
import { createDemoProposal, authenticateUser } from "../parts";

describe("proposal", () => {
  const id = randomString();
  const title = `[${id}] e2e create cancel`;
  const amount = "1";

  afterEach(function() {
    if (this.currentTest.state === "failed") {
      (Cypress as any).runner.stop();
    }
  });

  it("authenticates and creates if necessary", () => {
    authenticateUser(cy, 0);
  });

  it("creates demo proposal", () => {
    createDemoProposal(cy, title, amount);
  });

  it("cancels the proposal", () => {
    cy.contains(".Proposal-top-main-menu > .ant-btn", "Actions").click();
    cy.contains(".ant-dropdown-menu-item", "Cancel proposal").click();
    cy.contains(".ant-modal-footer > div button", "Confirm").click();
    cy.contains("body", "Proposal didn’t get funded", { timeout: 20000 });
    cy.get(".ant-modal-wrap").should("not.be.visible");
    cy.contains(".Proposal-top-main-menu > .ant-btn", "Actions").click();
    cy.contains(".ant-dropdown-menu-item", "Cancel proposal").should(
      "have.attr",
      "aria-disabled",
      "true"
    );
  });

  it("should appear unfunded to outsiders (account 9)", () => {
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(9) }));
    cy.contains("body", "Proposal didn’t get funded", { timeout: 20000 });
  });
});
