/// <reference types="cypress"/>

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
    cy.get("html").then(el => (el[0].style.scrollBehavior = "auto"));

    cy.contains("a", "Proposals").click();

    cy.contains(".ant-select", "Newest").click();
    cy.contains(".ant-select-dropdown", "Oldest").click();

    cy.contains(
      ".ProposalCard",
      "Fake Proposal #0 COMMUNITY FUNDING_REQ"
    ).click();
    cy.contains("h1", "Fake Proposal #0 COMMUNITY FUNDING_REQ");
    cy.contains(".ant-tabs-tab", "Discussion").click();
    cy.contains("Fake comment #30");
    cy.contains("Fake comment #21");
    cy.get(".ProposalComments").should("not.contain", "Fake comment #20");
    cy.contains("button", "Older Comments").click();
    cy.contains("Fake comment #11");
    cy.get(".ProposalComments").should("not.contain", "Fake comment #10");

    cy.contains("a", "Proposals").click();
    cy.contains(".ant-radio-wrapper", "All").click(); // FILTER
    cy.contains(".ProposalCard", "Fake Proposal #0 COMMUNITY FUNDING_REQUIRED");
    cy.contains(".ant-pagination-item", "5");
    cy.contains(".ant-radio-wrapper", "In prog").click(); // FILTER
    cy.contains(".ProposalCard", "Fake Proposal #0 CORE_DEV WIP");
    cy.contains(".ant-pagination-item", "2").click();
    cy.contains(".ProposalCard", "Fake Proposal #12 CORE_DEV WIP");

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
  });
});
