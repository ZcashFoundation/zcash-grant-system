/// <reference types="cypress"/>
import {
  loadWeb3,
  increaseTime,
  syncTimeWithEvm,
  randomString
} from "../helpers";
import { createDemoProposal, authenticateUser } from "../parts";

describe("create.fund.cancel", () => {
  const id = randomString();
  const title = `[${id}] e2e create fund cancel`;
  const amount = "1";

  afterEach(function() {
    if (this.currentTest.state === "failed") {
      (Cypress as any).runner.stop();
    }
  });

  it("authenticates and creates if necessary", () => {
    authenticateUser(cy, 0);
  });

  it("create demo proposal", () => {
    createDemoProposal(cy, title, amount);
  });

  it("funds the proposal with account 5", () => {
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(5) }));
    cy.get(".ant-input", { timeout: 20000 }).type(amount);
    cy.get(".ant-form > .ant-btn").click();
    cy.get(".ProposalCampaignBlock-fundingOver", { timeout: 20000 }).contains(
      "Proposal has been funded"
    );
  });

  it("cancels the proposal (refund contributors)", () => {
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(0) }));
    cy.contains(".Proposal-top-main-menu > .ant-btn", "Actions").click();
    cy.contains(".ant-dropdown-menu-item", "Refund contributors").click();
    cy.contains(".ant-modal-footer > div button", "Confirm").click();
    cy.get(".ant-modal-wrap", { timeout: 20000 }).should("not.be.visible");
    cy.contains(".Proposal-top-main-menu > .ant-btn", "Actions").click();
    cy.contains(".ant-dropdown-menu-item", "Refund contributors").should(
      "have.attr",
      "aria-disabled",
      "true"
    );
  });

  it("refunds the contributor (account 5)", () => {
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(5) }));
    cy.contains(".ant-tabs-nav > :nth-child(1) > :nth-child(4)", "Refund", {
      timeout: 20000
    }).click();
    // force disables cypress' auto scrolling which messes up UI in this case
    cy.contains(".ant-btn", "Get your refund").click({ force: true });
    cy.contains("body", "Your refund has been processed", { timeout: 20000 });
  });
});
