/// <reference types="cypress"/>
import { syncTimeWithEvm, loadWeb3, testAccounts } from "./helpers";

export const authenticateUser = (
  cy: Cypress.Chainable,
  accountIndex: number
) => {
  const name = `Qual Itty ${accountIndex}`;
  const ethAccount = testAccounts[accountIndex][0];
  const title = `QA Robot ${accountIndex}`;
  const email = `qa.robot.${accountIndex}@grant.io`;
  cy.visit("http://localhost:3000", { onBeforeLoad: loadWeb3(accountIndex) });
  syncTimeWithEvm(cy);
  cy.get(".AuthButton").click();
  cy.request({
    url: `http://localhost:5000/api/v1/users/${ethAccount}`,
    method: "GET",
    failOnStatusCode: false
  })
    .its("status")
    .then(status => {
      if (status === 200) {
        cy.contains("button", "Prove identity").click();
      } else {
        cy.get("input[name='name']").type(name);
        cy.get("input[name='title']").type(title);
        cy.get("input[name='email']").type(email);
        cy.contains("button", "Claim Identity").click();
      }
      cy.contains(".ProfileUser", email);
    });
};

export const createDemoProposal = (
  cy: Cypress.Chainable,
  title: string,
  amount: string
) => {
  cy.get('[href="/create"]').click();

  // expects to be @ /create
  cy.url().should("contain", "/create");

  cy.log("CREATE DEMO PROPOSAL", title, amount);

  // demo proposal
  cy.get("button.CreateFlow-footer-example").click();

  // change name
  cy.get(".ant-steps > :nth-child(1)").click();
  cy.get('.CreateFlow input[name="title"]', { timeout: 20000 })
    .clear()
    .type(title)
    .blur();
  cy.get('.CreateFlow input[name="amountToRaise"]')
    .clear()
    .type(amount)
    .blur();
  cy.wait(1000);

  // remove extra trustees
  cy.get(".ant-steps > :nth-child(5)").click();
  cy.get(
    ":nth-child(11) > .ant-form-item-control-wrapper div > button"
  ).click();
  cy.get(
    ":nth-child(10) > .ant-form-item-control-wrapper div > button"
  ).click();
  cy.get(":nth-child(9) > .ant-form-item-control-wrapper div > button").click();
  cy.get(":nth-child(8) > .ant-form-item-control-wrapper div > button").click();
  cy.get(":nth-child(7) > .ant-form-item-control-wrapper div > button").click();
  cy.wait(1000);
  cy.get(".CreateFlow-footer-button")
    .contains("Continue")
    .click();

  // final
  cy.get("button")
    .contains("Publish")
    .click();
  cy.get(".CreateFinal-loader-text").contains("Deploying contract...");
  cy.get(".CreateFinal-message-text a", { timeout: 30000 })
    .contains("Click here")
    .click();

  // created
  cy.get(".Proposal-top-main-title").contains(title);
};

export const fundProposal = (
  cy: Cypress.Chainable,
  accountIndex: number,
  amount: number
) => {
  // expects to be @ /proposals/<proposal>
  cy.url().should("contain", "/proposals/");

  // reload page with accountIndex account
  syncTimeWithEvm(cy);
  cy.url().then(url => cy.visit(url, { onBeforeLoad: loadWeb3(accountIndex) }));

  // fund proposal
  cy.get(".ant-input", { timeout: 20000 }).type(amount + "");
  cy.contains(".ant-form > .ant-btn", "Fund this project", { timeout: 20000 })
    .click()
    .should("not.have.attr", "loading");
};
