/// <reference types="cypress"/>
import {
  loadWeb3,
  randomString,
  syncTimeWithEvm,
  increaseTime
} from "../helpers";
import { createDemoProposal, fundProposal, authenticateUser } from "../parts";

describe("create.fund.ms2.refund-after-payout", () => {
  const id = randomString();
  const title = `[${id}] e2e ms2 refund after payout`;
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

  it("fund the proposal with account 5", () => {
    fundProposal(cy, 5, 1);
    cy.get(".ProposalCampaignBlock-fundingOver", { timeout: 20000 }).contains(
      "Proposal has been funded"
    );
  });

  it("receives initial payout for milestone 1", () => {
    // MILESTONE 1
    syncTimeWithEvm(cy);
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(0) }));
    cy.get(".MilestoneAction-top > div > .ant-btn", { timeout: 20000 }).click();
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Receive initial payout",
      { timeout: 20000 }
    ).click();
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Request milestone payout",
      { timeout: 20000 }
    );
  });

  it("majority refund vote and get refund (account 5)", () => {
    // REFUND
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(5) }));
    cy.contains(".ant-tabs-nav > :nth-child(1) > :nth-child(4)", "Refund", {
      timeout: 20000
    }).click();
    // INCREASE TIME
    increaseTime(cy, 70000);
    // force disables cypress' auto scrolling which messes up UI in this case
    cy.contains(".ant-btn", "Vote for refund").click({ force: true });
    cy.contains(".ant-btn", "Get your refund", { timeout: 20000 }).click({
      force: true
    });
    cy.contains("body", "Your refund has been processed", { timeout: 20000 });
  });
});
