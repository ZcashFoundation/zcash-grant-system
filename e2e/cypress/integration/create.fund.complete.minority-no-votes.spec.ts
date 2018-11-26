/// <reference types="cypress"/>
import {
  loadWeb3,
  randomString,
  syncTimeWithEvm,
  increaseTime
} from "../helpers";
import { createDemoProposal, fundProposal, authenticateUser } from "../parts";

describe("create.fund.complete.minority-no-votes", () => {
  const id = randomString();
  const title = `[${id}] e2e minority no-votes complete`;
  const amount = "1";

  afterEach(function() {
    if (this.currentTest.state === "failed") {
      //(Cypress as any).runner.stop();
      this.skip();
    }
  });

  it("authenticates and creates if necessary", () => {
    authenticateUser(cy, 0);
  });

  it("creates demo proposal", () => {
    createDemoProposal(cy, title, amount);
  });

  it("funds the proposal from accounts 5, 6 & 7", () => {
    fundProposal(cy, 5, 0.1);
    fundProposal(cy, 6, 0.2);
    fundProposal(cy, 7, 0.7);
    cy.get(".ProposalCampaignBlock-fundingOver", { timeout: 20000 }).contains(
      "Proposal has been funded"
    );
  });

  it("receives initial payout", () => {
    // MILESTONE 1
    syncTimeWithEvm(cy);
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(0) }));
    cy.get(".MilestoneAction-top > div > .ant-btn", { timeout: 20000 }).click();
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Receive initial payout",
      { timeout: 20000 }
    ).click();
  });

  it("requests milestone 2 payout", () => {
    // MILESTONE 2
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Request milestone payout",
      { timeout: 20000 }
    ).click();
    cy.contains(".MilestoneAction-progress-text", "voted against payout", {
      timeout: 20000
    });
  });

  it("minority funder (acct 5) votes no", () => {
    // VOTE NO
    syncTimeWithEvm(cy);
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(5) }));
    cy.contains(".ant-btn", "Vote against payout", { timeout: 20000 })
      .click()
      .should("have.class", "ant-btn-loading");
    cy.contains(".ant-btn", "Revert vote against payout", { timeout: 20000 });
  });

  it("expires milestone 2 voting period & receives payout", () => {
    // EXPIRE
    increaseTime(cy, 70000);
    // RECEIVE PAYOUT
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(0) }));
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Receive milestone payout",
      { timeout: 20000 }
    ).click();
  });

  it("requests milestone 3 payout", () => {
    // MILESTONE 3
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Request milestone payout",
      { timeout: 20000 }
    ).click();
    cy.contains(".MilestoneAction-progress-text", "voted against payout", {
      timeout: 20000
    });
  });

  it("minority funder (acct 5) votes no", () => {
    // VOTE NO
    syncTimeWithEvm(cy);
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(5) }));
    cy.contains(".ant-btn", "Vote against payout", { timeout: 20000 })
      .click()
      .should("have.class", "ant-btn-loading");
    cy.contains(".ant-btn", "Revert vote against payout", { timeout: 20000 });
  });

  it("expires milestone 3 voting period & receives payout", () => {
    // EXPIRE
    increaseTime(cy, 70000);
    // RECEIVE PAYOUT
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(0) }));
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Receive milestone payout",
      { timeout: 20000 }
    ).click();
  });

  it("should not have receive button", () => {
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Receive milestone payout",
      { timeout: 20000 }
    ).should("not.exist");
  });
});
