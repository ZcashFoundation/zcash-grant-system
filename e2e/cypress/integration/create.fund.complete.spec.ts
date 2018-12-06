/// <reference types="cypress"/>
import {
  loadWeb3,
  increaseTime,
  syncTimeWithEvm,
  randomString
} from "../helpers";
import { createDemoProposal, authenticateUser } from "../parts";

describe("create.fund.complete", () => {
  const id = randomString();
  const title = `[${id}] e2e create fund complete`;
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

  it("receives initial payout", () => {
    // MILESTONE 1
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(0) }));
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Request initial payout",
      { timeout: 20000 }
    )
      .as("RequestPayout")
      .click();
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Receive initial payout",
      { timeout: 20000 }
    ).click();
  });

  it("requests and receives milestone 2 payout", () => {
    // MILESTONE 2
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Request milestone payout",
      { timeout: 20000 }
    ).click();
    cy.contains(".MilestoneAction-progress-text", "voted against payout", {
      timeout: 20000
    });
    // EXPIRE
    increaseTime(cy, 70000);
    cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(0) }));
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Receive milestone payout",
      { timeout: 20000 }
    ).click();
  });

  it("requests and receives milestone 3 payout", () => {
    // MILESTONE 3
    cy.contains(
      ".MilestoneAction-top > div > .ant-btn",
      "Request milestone payout",
      { timeout: 20000 }
    ).click();
    cy.contains(".MilestoneAction-progress-text", "voted against payout", {
      timeout: 20000
    });
    // EXPIRE
    increaseTime(cy, 70000);
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
