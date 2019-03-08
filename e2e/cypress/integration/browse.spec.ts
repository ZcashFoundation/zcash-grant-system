/// <reference types="cypress"/>

Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
describe("browse", () => {
  let stubs;
  before(() => {
    cy.request("http://localhost:5000/api/v1/e2e/setup").then(
      r => (stubs = r.body)
    );
  });
  it("should load and be able to browse pages", () => {
    // cy.visit("http://localhost:3000");
    cy.visit("/");
    cy.title().should("include", "ZF Grants - Home");
    cy.get("html").then(el =>
      console.log("scrollBehavior", (el[0].style.scrollBehavior = "auto"))
    );

    cy.contains("a", "Proposals").click();

    cy.contains(".ant-select", "Newest").click();
    cy.contains(".ant-select-dropdown", "Oldest").click();

    cy.contains(
      ".ProposalCard",
      "Fake Proposal #0 COMMUNITY FUNDING_REQ"
    ).click();
    cy.contains("h1", "Fake Proposal #0 COMMUNITY FUNDING_REQ");
    cy.wait(1000);
    cy.contains(".ant-tabs-tab", "Discussion").click();
    cy.contains("Fake comment #30");
    cy.contains("Fake comment #21");
    cy.get(".ProposalComments").should("not.contain", "Fake comment #20");
    cy.contains("button", "Older Comments").click();
    cy.contains("Fake comment #11");
    cy.get(".ProposalComments").should("not.contain", "Fake comment #10");

    cy.contains("a", "Requests").click();

    cy.contains("a", "Start a Proposal").click();
    cy.title().should("include", "ZF Grants - Sign in");
    cy.contains("Authorization required");

    // cy.contains("a", "About").click(); // external site
    cy.contains("a", "Contact").click({ force: true });
    cy.contains("h1", "Contact");
    cy.contains("a", "Terms of").click({ force: true });
    cy.contains("h1", "Terms");
    cy.contains("a", "Privacy").click({ force: true });
    cy.contains("h1", "Privacy");
    cy.contains("a", "Code of").click({ force: true });
    cy.contains("h1", "Code");

    cy.contains("a", "Sign in").click();
    cy.contains("a", "Recover your").click();
    cy.contains("h1", "Account Recovery");
    cy.contains("a", "Sign in").click();
    cy.contains("a", "Create a").click();

    // // test hero create link
    // cy.get('.Home-hero-buttons a[href="/create"]')
    //   // {force: true} here overcomes a strange issue where the button moves up under the header
    //   // this is likely a cypress scroll related problem
    //   .click({ force: true });
    // cy.title().should("include", "Grant.io - Create a Proposal");

    // // browse back home
    // cy.get('.Header a[href="/"]').click();

    // // test hero explore link
    // cy.get('.Home-hero-buttons a[href="/proposals"]')
    //   // {force: true} here overcomes a strange issue where the button moves up under the header
    //   // this is likely a cypress-related problem
    //   .click({ force: true });
    // cy.title().should("include", "Grant.io - Browse proposals");

    // // browse back home
    // cy.get('.Header a[href="/"]').click();

    // // browse to create via header link
    // cy.get('.Header a[href="/create"]').click();
    // cy.title().should("include", "Grant.io - Create a Proposal");

    // // browse to explore via header link
    // cy.get('.Header a[href="/proposals"]').click();
    // cy.title().should("include", "Grant.io - Browse proposals");

    // // browse footer links
    // cy.get('.Footer a[href="/about"]').click();
    // cy.title().should("include", "Grant.io - About");
    // cy.get('.Footer a[href="/contact"]').click();
    // cy.title().should("include", "Grant.io - Contact");
    // cy.get('.Footer a[href="/tos"]').click();
    // cy.title().should("include", "Grant.io - Terms of Service");
    // cy.get('.Footer a[href="/privacy"]').click();
    // cy.title().should("include", "Grant.io - Privacy Policy");
  });
});
